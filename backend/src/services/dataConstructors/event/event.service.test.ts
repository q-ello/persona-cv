import { EEventState, EEventType, MIN_TIMELINE_DATE } from '@cv/shared';
import { IRawEvent } from '../../../types/events.types';
import { createDeferred } from '../../../test/utils/createDeferred';
import { createFetchResponse } from '../../../test/utils/createFetchMock';
import { createGoogleCalendarEvent } from '../../externalApi/googleCalendar/googleCalendar.builders';
import { createGoogleCalendarTestService } from '../../externalApi/googleCalendar/googleCalendar.service.factory';
import { createEventSerivce } from './event.service';
import { createRawEvent } from './event.builders';

const DAY = 24 * 60 * 60 * 1000;
const createDependencies = (googleEvents: IRawEvent[] = [], holidays: IRawEvent[] = []) => ({
    google: {
        getGoogleCalendarEvents: jest.fn().mockResolvedValue(googleEvents),
        commitPendingCache: jest.fn(),
    },
    nager: {
        getHolidaysEvents: jest.fn().mockResolvedValue(holidays),
        hasFetchedYear: jest.fn((year: number) => year >= MIN_TIMELINE_DATE.getFullYear() && year <= 2026),
    },
});

describe('events cache', () => {
    beforeEach(() => {
        jest.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') });
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('initializes once using all Google events and the full historical holiday range', async () => {
        const { google, nager } = createDependencies();
        const service = createEventSerivce(google, nager);

        const initialization = service.init();
        expect(service.init()).toBe(initialization);
        await initialization;
        await service.getEvents('en', 9, 2026);

        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledWith();
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(1);
        expect(nager.getHolidaysEvents).toHaveBeenCalledWith(MIN_TIMELINE_DATE.getFullYear(), 2026);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('groups both providers by day, selects zero-based months, and localizes at read time', async () => {
        const { google, nager } = createDependencies([
            createRawEvent({ date: '2026-01-01' }),
            createRawEvent({ date: '2026-12-31', eventEng: 'Year End' }),
        ], [createRawEvent({ date: '2026-01-01', eventEng: 'Holiday', eventRu: 'Праздник', type: EEventType.Holiday })]);
        const service = createEventSerivce(google, nager);

        expect(await service.getEvents('en', 0, 2026)).toEqual({
            '2026-01-01': [
                { eventText: 'Event', type: EEventType.Common, state: EEventState.Single },
                { eventText: 'Holiday', type: EEventType.Holiday, state: EEventState.Single },
            ],
        });
        expect((await service.getEvents('ru', 0, 2026))['2026-01-01'].map(event => event.eventText))
            .toEqual(['Событие', 'Праздник']);
        expect(Object.keys(await service.getEvents('en', 11, 2026))).toEqual(['2026-12-31']);
        await expect(service.getEvents('en', 1, 2026)).resolves.toEqual({});
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
    });

    it('waits for initialization and shares it across concurrent readers before committing', async () => {
        const { google, nager } = createDependencies();
        const loading = createDeferred<IRawEvent[]>();
        google.getGoogleCalendarEvents.mockReturnValueOnce(loading.promise);
        const service = createEventSerivce(google, nager);
        let finished = false;
        const english = service.getEvents('en', 9, 2026).then(events => {
            finished = true;
            return events;
        });
        const russian = service.getEvents('ru', 9, 2026);
        await jest.advanceTimersByTimeAsync(0);

        expect(finished).toBe(false);
        expect(google.commitPendingCache).not.toHaveBeenCalled();
        loading.resolve([createRawEvent({ date: '2026-10-11' })]);
        expect((await english)['2026-10-11'][0].eventText).toBe('Event');
        expect((await russian)['2026-10-11'][0].eventText).toBe('Событие');
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(1);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('shares a missing year load and keeps all of its months without another Google commit', async () => {
        const { google, nager } = createDependencies();
        const service = createEventSerivce(google, nager);
        await service.init();
        const loading = createDeferred<IRawEvent[]>();
        nager.getHolidaysEvents.mockReturnValueOnce(loading.promise);

        const january = service.getEvents('en', 0, 2027);
        const december = service.getEvents('ru', 11, 2027);
        await jest.advanceTimersByTimeAsync(0);
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(2);
        expect(nager.getHolidaysEvents).toHaveBeenLastCalledWith(2027);
        loading.resolve([
            createRawEvent({ date: '2027-01-01', type: EEventType.Holiday }),
            createRawEvent({ date: '2027-12-31', type: EEventType.Holiday }),
        ]);

        expect(Object.keys(await january)).toEqual(['2027-01-01']);
        expect(Object.keys(await december)).toEqual(['2027-12-31']);
        expect((await service.getEvents('en', 0, 2027))['2027-01-01']).toHaveLength(1);
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(2);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('records coverage for an empty year instead of loading it for every month', async () => {
        const { google, nager } = createDependencies();
        const service = createEventSerivce(google, nager);

        await expect(service.getEvents('en', 0, 2027)).resolves.toEqual({});
        await expect(service.getEvents('en', 11, 2027)).resolves.toEqual({});
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(2);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('retries a failed year load without reinitializing or duplicating holidays', async () => {
        const { google, nager } = createDependencies();
        const service = createEventSerivce(google, nager);
        await service.init();
        nager.getHolidaysEvents.mockRejectedValueOnce(new Error('Nager unavailable'))
            .mockResolvedValueOnce([createRawEvent({ date: '2027-01-01', type: EEventType.Holiday })]);

        await expect(service.getEvents('en', 0, 2027)).rejects.toThrow('Nager unavailable');
        expect((await service.getEvents('en', 0, 2027))['2027-01-01']).toHaveLength(1);
        expect((await service.getEvents('en', 0, 2027))['2027-01-01']).toHaveLength(1);
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(3);
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('refreshes daily and appends fresh Google events while retaining existing events and holidays', async () => {
        const { google, nager } = createDependencies(
            [createRawEvent({ date: '2026-10-11', eventEng: 'Old' })],
            [createRawEvent({ date: '2026-10-11', eventEng: 'Holiday', type: EEventType.Holiday })],
        );
        const service = createEventSerivce(google, nager);
        await service.init();
        google.getGoogleCalendarEvents.mockResolvedValueOnce([
            createRawEvent({ date: '2026-10-11', eventEng: 'New' }),
        ]).mockResolvedValue([]);

        await jest.advanceTimersByTimeAsync(DAY - 1);
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(1);
        expect((await service.getEvents('en', 9, 2026))['2026-10-11'].map(event => event.eventText))
            .toEqual(['Old', 'Holiday', 'New']);
        await jest.advanceTimersByTimeAsync(DAY);
        expect((await service.getEvents('en', 9, 2026))['2026-10-11']).toHaveLength(3);
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(1);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(3);
    });

    it('preserves cached data on refresh failure and retries after five seconds', async () => {
        const { google, nager } = createDependencies([createRawEvent({ date: '2026-10-11', eventEng: 'Old' })]);
        const service = createEventSerivce(google, nager);
        await service.init();
        google.getGoogleCalendarEvents.mockRejectedValueOnce(new Error('Google unavailable'))
            .mockResolvedValueOnce([createRawEvent({ date: '2026-10-11', eventEng: 'New' })]);

        await jest.advanceTimersByTimeAsync(DAY);
        expect((await service.getEvents('en', 9, 2026))['2026-10-11']).toHaveLength(1);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(4999);
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(2);
        await jest.advanceTimersByTimeAsync(1);
        expect((await service.getEvents('en', 9, 2026))['2026-10-11'].map(event => event.eventText))
            .toEqual(['Old', 'New']);
        expect(google.commitPendingCache).toHaveBeenCalledTimes(2);
    });

    it('recovers Google events when Nager fails after Google has completed initialization', async () => {
        const { service: google, fetchMock } = createGoogleCalendarTestService({ json: {} });
        fetchMock.mockImplementation(async (input: string) => {
            const url = new URL(input);
            return createFetchResponse({ json: url.searchParams.has('fields')
                ? { updated: '2026-10-10T12:00:00Z' }
                : { items: url.pathname.includes('/common/') ? [createGoogleCalendarEvent()] : [] } });
        });
        const { nager } = createDependencies();
        const loading = createDeferred<IRawEvent[]>();
        nager.getHolidaysEvents.mockReturnValueOnce(loading.promise);
        const commit = jest.spyOn(google, 'commitPendingCache');
        const service = createEventSerivce(google, nager);
        const failure = expect(service.init()).rejects.toThrow('Nager unavailable');
        await jest.advanceTimersByTimeAsync(0);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(commit).not.toHaveBeenCalled();
        loading.reject(new Error('Nager unavailable'));
        await failure;

        expect((await service.getEvents('en', 4, 2026))['2026-05-10']).toHaveLength(1);
        expect(commit).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(DAY);
        expect((await service.getEvents('en', 4, 2026))['2026-05-10']).toHaveLength(1);
        // One daily refresh after retrying initialization, rather than two timers.
        expect(fetchMock).toHaveBeenCalledTimes(6);
    });

    it('does not commit a partial Google batch when a new holiday year loads before its retry', async () => {
        const { service: google, fetchMock } = createGoogleCalendarTestService({ json: {} });
        let updated = '2026-10-10T12:00:00Z';
        let newEvents = false;
        let failDeadlines = false;
        fetchMock.mockImplementation(async (input: string) => {
            const url = new URL(input);
            if (url.searchParams.has('fields')) return createFetchResponse({ json: { updated } });
            if (failDeadlines && url.pathname.includes('/deadlines/')) {
                failDeadlines = false;
                throw new Error('Deadline unavailable');
            }
            return createFetchResponse({ json: { items: newEvents && url.pathname.includes('/common/')
                ? [createGoogleCalendarEvent()] : [] } });
        });
        const { nager } = createDependencies();
        const commit = jest.spyOn(google, 'commitPendingCache');
        const service = createEventSerivce(google, nager);
        await service.init();
        updated = '2026-10-12T11:00:00Z';
        newEvents = true;
        failDeadlines = true;

        await jest.advanceTimersByTimeAsync(DAY);
        nager.getHolidaysEvents.mockResolvedValueOnce([
            createRawEvent({ date: '2027-01-01', type: EEventType.Holiday }),
        ]);
        expect((await service.getEvents('en', 0, 2027))['2027-01-01']).toHaveLength(1);
        expect(commit).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(5000);

        expect((await service.getEvents('en', 4, 2026))['2026-05-10']).toHaveLength(1);
        expect(commit).toHaveBeenCalledTimes(2);
        await jest.advanceTimersByTimeAsync(DAY);
        expect((await service.getEvents('en', 4, 2026))['2026-05-10']).toHaveLength(1);
        expect((await service.getEvents('en', 0, 2027))['2027-01-01']).toHaveLength(1);
    });
});
