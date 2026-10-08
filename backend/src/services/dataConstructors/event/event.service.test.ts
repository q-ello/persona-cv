import { EEventState, EEventType } from '@cv/shared';
import { IRawEvent } from '../../../types/events.types';
import { createEventSerivce } from './event.service';
import { createRawEvent } from './event.builders';

describe('events cache', () => {
    it("merges events from both sources by date without overwriting them", async () => {
        const service = createEventSerivce(
            { getGoogleCalendarEvents: jest.fn().mockResolvedValue([createRawEvent({ date: "2026-04-10", eventEng: "A" })]) },
            { getHolidaysEvents: jest.fn().mockResolvedValue([createRawEvent({ date: "2026-04-10", eventEng: "B", type: EEventType.Holiday })]) }
        );
        const result = await service.getEvents("en", 3, 2026);

        expect(result["2026-04-10"]).toEqual([
            { eventText: "A", type: EEventType.Common, state: EEventState.Single },
            { eventText: "B", type: EEventType.Holiday, state: EEventState.Single },
        ]);
    });

    it('loads events from both sources', async () => {
        const google = { getGoogleCalendarEvents: jest.fn().mockResolvedValue([]) };
        const nager = { getHolidaysEvents: jest.fn().mockResolvedValue([]) };
        const service = createEventSerivce(google, nager);

        await service.init();

        expect(google.getGoogleCalendarEvents).toHaveBeenCalledWith(expect.any(Date), expect.any(Date));
        expect(nager.getHolidaysEvents).toHaveBeenCalledWith(...google.getGoogleCalendarEvents.mock.calls[0]);
    });

    it('waits for startup initialization and shares it across concurrent requests', async () => {
        let resolveGoogle!: (events: IRawEvent[]) => void;
        const google = {
            getGoogleCalendarEvents: jest.fn(() => new Promise<IRawEvent[]>(resolve => {
                resolveGoogle = resolve;
            }))
        };
        const nager = { getHolidaysEvents: jest.fn().mockResolvedValue([]) };
        const service = createEventSerivce(google, nager);

        const initialization = service.init();
        expect(service.init()).toBe(initialization);
        let requestFinished = false;
        const english = service.getEvents('en', 9, 2026).then(events => {
            requestFinished = true;
            return events;
        });
        const russian = service.getEvents('ru', 9, 2026);
        await Promise.resolve();
        expect(requestFinished).toBe(false);

        resolveGoogle([createRawEvent({ date: '2026-10-08' })]);
        expect(await english).toEqual({
            '2026-10-08': [{ eventText: 'Event', state: EEventState.Single, type: EEventType.Common }],
        });
        expect((await russian)['2026-10-08'][0].eventText).toBe('Событие');
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
        expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(1);
    });

    it('uses zero-based request months and keeps events grouped by date', async () => {
        const google = {
            getGoogleCalendarEvents: jest.fn().mockResolvedValue([
                createRawEvent({ date: '2026-01-01' }),
                createRawEvent({ date: '2026-12-31' }),
            ])
        };
        const nager = {
            getHolidaysEvents: jest.fn().mockResolvedValue([
                createRawEvent({ date: '2026-01-01', eventEng: 'Holiday', type: EEventType.Holiday }),
            ])
        };
        const service = createEventSerivce(google, nager);

        const january = await service.getEvents('en', 0, 2026);
        expect(Object.keys(january)).toEqual(['2026-01-01']);
        expect(january['2026-01-01'].map(event => event.eventText)).toEqual(['Event', 'Holiday']);
        expect(Object.keys(await service.getEvents('en', 11, 2026))).toEqual(['2026-12-31']);
        expect(google.getGoogleCalendarEvents).toHaveBeenCalledTimes(1);
    });

    it('returns an empty object for months with no cached events', async () => {
        const service = createEventSerivce(
            { getGoogleCalendarEvents: jest.fn().mockResolvedValue([]) },
            { getHolidaysEvents: jest.fn().mockResolvedValue([]) },
        );

        await expect(service.getEvents('en', 0, 2020)).resolves.toEqual({});
    });

    it('propagates initialization errors and retries on the next request', async () => {
        const error = new Error('Nager unavailable');
        const google = { getGoogleCalendarEvents: jest.fn().mockResolvedValue([createRawEvent({ date: '2026-10-08' })]) };
        const nager = { getHolidaysEvents: jest.fn().mockRejectedValueOnce(error).mockResolvedValue([]) };
        const service = createEventSerivce(google, nager);
        const log = jest.spyOn(console, 'error').mockImplementation(() => { });

        try {
            await expect(service.getEvents('en', 9, 2026)).rejects.toThrow(error);
            expect((await service.getEvents('en', 9, 2026))['2026-10-08']).toHaveLength(1);
            expect(nager.getHolidaysEvents).toHaveBeenCalledTimes(2);
        } finally {
            log.mockRestore();
        }
    });
});
