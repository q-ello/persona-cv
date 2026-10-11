import { EEventState, EEventType, MIN_TIMELINE_DATE } from '@cv/shared';
import { createDeferred } from '../../../test/utils/createDeferred';
import { createFetchResponse } from '../../../test/utils/createFetchMock';
import { createGoogleCalendarTestService } from './googleCalendar.service.factory';
import { createGoogleCalendarEvent, GoogleCalendarEvent } from './googleCalendar.builders';

const createCalendars = (common: GoogleCalendarEvent[] = [], deadlines: GoogleCalendarEvent[] = []) => {
    const calendars = {
        common: { items: common, updated: '2026-10-10T12:00:00Z' },
        deadlines: { items: deadlines, updated: '2026-10-10T12:00:00Z' },
    };
    const { service, fetchMock } = createGoogleCalendarTestService({ json: {} });
    fetchMock.mockImplementation(async (input: string) => {
        const url = new URL(input);
        const calendarId = url.pathname.split('/').at(-2) as keyof typeof calendars;
        const calendar = calendars[calendarId];
        return createFetchResponse({ json: url.searchParams.has('fields')
            ? { updated: calendar.updated }
            : { items: calendar.items, updated: calendar.updated } });
    });

    return { service, fetchMock, calendars };
};

describe('Google Calendar events', () => {
    beforeEach(() => {
        jest.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('loads both calendars from the fixed start date without an upper bound', async () => {
        const { service, fetchMock } = createCalendars();

        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const urls = fetchMock.mock.calls.map(([input]) => new URL(input));
        expect(urls.map(url => url.pathname)).toEqual([
            '/calendar/v3/calendars/common/events',
            '/calendar/v3/calendars/deadlines/events',
        ]);
        for (const url of urls) {
            expect(url.searchParams.get('key')).toBe('test');
            expect(url.searchParams.get('timeMin')).toBe(MIN_TIMELINE_DATE.toISOString());
            expect(url.searchParams.has('timeMax')).toBe(false);
        }
    });

    it('converts timed events and retains the calendar type and both translations', async () => {
        const event = createGoogleCalendarEvent({ start: { dateTime: '2026-05-10T12:00:00Z' } });
        const { service } = createCalendars([event], [event]);

        expect(await service.getGoogleCalendarEvents()).toEqual([
            { date: '2026-05-10', eventEng: 'Event', eventRu: 'Событие', state: EEventState.Single, type: EEventType.Common },
            { date: '2026-05-10', eventEng: 'Event', eventRu: 'Событие', state: EEventState.Single, type: EEventType.Deadline },
        ]);
    });

    it('expands every day of a multi-day event before committing its ID', async () => {
        const { service, calendars } = createCalendars([
            createGoogleCalendarEvent({ end: { date: '2026-05-13' } }),
        ]);

        const result = await service.getGoogleCalendarEvents();
        expect(result.map(({ date, state }) => ({ date, state }))).toEqual([
            { date: '2026-05-10', state: EEventState.Start },
            { date: '2026-05-11', state: EEventState.Middle },
            { date: '2026-05-12', state: EEventState.End },
        ]);
        service.commitPendingCache();
        calendars.common.updated = '2026-10-12T12:00:00Z';
        jest.setSystemTime(new Date('2026-10-13T12:00:00Z'));
        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
    });

    it('treats a one-day all-day event as single and falls back to its summary', async () => {
        const { service } = createCalendars([createGoogleCalendarEvent({ description: undefined })]);

        expect(await service.getGoogleCalendarEvents()).toEqual([
            { date: '2026-05-10', eventEng: 'Event', eventRu: 'Event', state: EEventState.Single, type: EEventType.Common },
        ]);
    });

    it.each([{ summary: undefined }, { id: undefined }])('skips events missing required content: %j', async overrides => {
        const { service } = createCalendars([createGoogleCalendarEvent(overrides)]);

        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
    });

    it('returns no events when the response has no items', async () => {
        const { service } = createGoogleCalendarTestService({ json: {} });

        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
    });

    it('replays uncommitted events, then skips full fetches for unchanged calendars', async () => {
        const { service, fetchMock } = createCalendars([createGoogleCalendarEvent()]);

        expect(await service.getGoogleCalendarEvents()).toHaveLength(1);
        expect(await service.getGoogleCalendarEvents()).toHaveLength(1);
        service.commitPendingCache();
        fetchMock.mockClear();

        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        for (const [input] of fetchMock.mock.calls) {
            expect(new URL(input).searchParams.get('fields')).toBe('updated');
        }
    });

    it.each([
        ['common', EEventType.Common],
        ['deadlines', EEventType.Deadline],
    ] as const)('fetches only the changed %s calendar and returns only unseen IDs', async (calendarId, type) => {
        const original = createGoogleCalendarEvent();
        const { service, fetchMock, calendars } = createCalendars([original], [original]);

        // Identical event IDs in different calendars must remain independent.
        expect(await service.getGoogleCalendarEvents()).toHaveLength(2);
        service.commitPendingCache();
        calendars[calendarId].items.push(createGoogleCalendarEvent({ id: 'new-event', summary: 'New' }));
        calendars[calendarId].updated = '2026-10-12T12:00:00Z';
        jest.setSystemTime(new Date('2026-10-13T12:00:00Z'));
        fetchMock.mockClear();

        const result = await service.getGoogleCalendarEvents();
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ eventEng: 'New', type });
        const fullFetches = fetchMock.mock.calls.map(([input]) => new URL(input))
            .filter(url => !url.searchParams.has('fields'));
        expect(fullFetches.map(url => url.pathname)).toEqual([`/calendar/v3/calendars/${calendarId}/events`]);

        service.commitPendingCache();
        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
    });

    it.each(['metadata', 'events'])('retries after an HTTP failure during %s without advancing committed state', async phase => {
        const { service, fetchMock, calendars } = createCalendars();
        await service.getGoogleCalendarEvents();
        service.commitPendingCache();
        calendars.common.items.push(createGoogleCalendarEvent());
        calendars.common.updated = '2026-10-12T12:00:00Z';
        jest.setSystemTime(new Date('2026-10-13T12:00:00Z'));
        if (phase === 'events') {
            fetchMock.mockResolvedValueOnce(createFetchResponse({ json: { updated: calendars.common.updated } }))
                .mockResolvedValueOnce(createFetchResponse({ json: { updated: calendars.deadlines.updated } }));
        }
        fetchMock.mockResolvedValueOnce(createFetchResponse({ ok: false, status: 503 }));

        await expect(service.getGoogleCalendarEvents()).rejects.toThrow('Google HTTP 503');
        jest.setSystemTime(new Date('2026-10-13T12:00:05Z'));
        expect(await service.getGoogleCalendarEvents()).toHaveLength(1);
    });

    it('replays the first calendar when the second calendar fails before commit', async () => {
        const { service, fetchMock } = createCalendars(
            [createGoogleCalendarEvent()], [createGoogleCalendarEvent()],
        );
        fetchMock.mockResolvedValueOnce(createFetchResponse({ json: { items: [createGoogleCalendarEvent()] } }))
            .mockRejectedValueOnce(new Error('Deadline unavailable'));

        await expect(service.getGoogleCalendarEvents()).rejects.toThrow('Deadline unavailable');
        expect(await service.getGoogleCalendarEvents()).toHaveLength(2);
        service.commitPendingCache();
        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
    });

    it('waits for all pages, including pages after an empty page', async () => {
        const { service, fetchMock } = createCalendars();
        const page = createDeferred<ReturnType<typeof createFetchResponse>>();
        fetchMock.mockResolvedValueOnce(createFetchResponse({ json: { items: [], nextPageToken: 'second' } }))
            .mockReturnValueOnce(page.promise);
        let finished = false;
        const loading = service.getGoogleCalendarEvents().then(events => {
            finished = true;
            return events;
        });
        await jest.advanceTimersByTimeAsync(0);
        expect(finished).toBe(false);
        expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('pageToken')).toBe('second');

        page.resolve(createFetchResponse({ json: { items: [createGoogleCalendarEvent()] } }));
        expect(await loading).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('propagates a later-page error and replays the complete batch on retry', async () => {
        const { service, fetchMock } = createCalendars([createGoogleCalendarEvent()]);
        fetchMock.mockResolvedValueOnce(createFetchResponse({ json: {
            items: [createGoogleCalendarEvent()], nextPageToken: 'second',
        } })).mockResolvedValueOnce(createFetchResponse({ ok: false, status: 429 }));

        await expect(service.getGoogleCalendarEvents()).rejects.toThrow('Google HTTP 429');
        expect(await service.getGoogleCalendarEvents()).toHaveLength(1);
    });

    it('detects an addition made while the preceding full fetch is in flight', async () => {
        const { service, fetchMock, calendars } = createCalendars();
        fetchMock.mockImplementationOnce(async () => {
            calendars.common.items.push(createGoogleCalendarEvent());
            calendars.common.updated = '2026-10-11T12:00:01Z';
            jest.setSystemTime(new Date('2026-10-11T12:00:02Z'));
            return createFetchResponse({ json: { items: [] } });
        });

        await expect(service.getGoogleCalendarEvents()).resolves.toEqual([]);
        service.commitPendingCache();
        expect(await service.getGoogleCalendarEvents()).toHaveLength(1);
    });
});
