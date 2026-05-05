import { createGoogleCalendarService } from "./googleCalendar.service";
import { EEventState } from "@cv/shared";

describe("GoogleCalendarService", () => {

    const setup = (mockResponse: any) => {
        const fetchMock = jest.fn().mockResolvedValue({
            json: async () => mockResponse
        });

        const service = createGoogleCalendarService(
            {
                apiKey: "test",
                commonCalendarId: "common",
                deadlinesCalendarId: "deadlines"
            },
            fetchMock
        );

        return { service, fetchMock };
    };

    it("handles single day event", async () => {
        const { service } = setup({
            items: [
                {
                    summary: "Single Day Event",
                    description: "Однодневное событие",
                    start: { dateTime: "2025-05-10T10:00:00Z" }
                }
            ]
        });

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result).toHaveLength(2);
        expect(result[0].event.state).toBe(EEventState.Single);
    });

    it("splits multi-day events correctly", async () => {
        const { service } = setup({
            items: [
                {
                    summary: "Trip",
                    start: { date: "2025-05-10" },
                    end: { date: "2025-05-13" } // exclusive
                }
            ]
        });

        const result = await service.getGoogleCalendarEvents(2025, 4);

        // 3 days * 2 calendars = 6 entries
        expect(result).toHaveLength(6);

        const states = result.map(e => e.event.state);

        expect(states).toContain(EEventState.Start);
        expect(states).toContain(EEventState.Middle);
        expect(states).toContain(EEventState.End);
    });

    it("handles single-day all-day event", async () => {
        const { service } = setup({
            items: [
                {
                    summary: "Holiday",
                    start: { date: "2025-05-10" },
                    end: { date: "2025-05-11" }
                }
            ]
        });

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result[0].event.state).toBe(EEventState.Single);
    });

    it("skips items without summary", async () => {
        const { service } = setup({
            items: [
                {
                    start: { dateTime: "2025-05-10T10:00:00Z" }
                }
            ]
        });

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result).toHaveLength(0);
    });

    it("returns empty array when no items", async () => {
        const { service } = setup({});

        const result = await service.getGoogleCalendarEvents(2025, 4);

        expect(result).toEqual([]);
    });
});