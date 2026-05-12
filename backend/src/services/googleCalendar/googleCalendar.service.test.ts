import { createGoogleCalendarService } from "./googleCalendar.service";
import { EEventState } from "@cv/shared";
import { createGoogleCalendarTestService } from "./googleCalendar.service.factory";
import { createGoogleCalendarEvent } from "./googleCalendar.builders";

describe("GoogleCalendarService", () => {

    it("handles single day event", async () => {
        const { service } = createGoogleCalendarTestService({json: {
            items: [
                createGoogleCalendarEvent({
                    summary: "Single Day Event",
                    description: "Однодневное событие",
                    start: { dateTime: "2025-05-10T10:00:00Z" }
                })
            ]
        }});

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result).toHaveLength(2);
        expect(result[0].event.state).toBe(EEventState.Single);
    });

    it("splits multi-day events correctly", async () => {
        const { service } = createGoogleCalendarTestService({json: {
            items: [
                createGoogleCalendarEvent({
                    summary: "Trip",
                    start: { date: "2025-05-10" },
                    end: { date: "2025-05-13" } // exclusive
                })
            ]
        }});

        const result = await service.getGoogleCalendarEvents(2025, 4);

        // 3 days * 2 calendars = 6 entries
        expect(result).toHaveLength(6);

        const states = result.map(e => e.event.state);

        expect(states).toContain(EEventState.Start);
        expect(states).toContain(EEventState.Middle);
        expect(states).toContain(EEventState.End);
    });

    it("handles single-day all-day event", async () => {
        const { service } = createGoogleCalendarTestService({json: {
            items: [
                createGoogleCalendarEvent({
                    summary: "Holiday",
                    start: { date: "2025-05-10" },
                    end: { date: "2025-05-11" }
                })
            ]
        }});

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result[0].event.state).toBe(EEventState.Single);
    });

    it("skips items without summary", async () => {
        const { service } = createGoogleCalendarTestService({json: {
            items: [
                createGoogleCalendarEvent({
                    start: { dateTime: "2025-05-10T10:00:00Z" }
                })
            ]
        }});

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result).toHaveLength(0);
    });

    it("returns empty array when no items", async () => {
        const { service } = createGoogleCalendarTestService({json: {}});

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result).toEqual([]);
    });
});