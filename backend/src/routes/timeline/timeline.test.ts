import request from "supertest";
import { EEventState, EEventType, IEvent } from "@cv/shared";
import { createTestApp } from "../../test/factories/createTestApp";
import { createRawEvent } from "./timeline.builders";

describe("/events route", () => {

    it("returns 400 if params missing", async () => {
        const { app } = createTestApp();
        const response = await request(app).get("/api/timeline/events");
        expect(response.status).toBe(400);
    });

    it("returns empty object if no events", async () => {
        const { app } = createTestApp();
        const response = await request(app).get("/api/timeline/events?year=2024&month=1");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({});
    });

    it("merges google and holiday events correctly", async () => {
        const { app, googleCalendarService, nagerService } = createTestApp();

        googleCalendarService.getGoogleCalendarEvents.mockResolvedValue([
            createRawEvent({
                date: "2025-05-10",
                eventEng: "Google Event", 
                eventRu: "Google Event", 
                type: EEventType.Common, 
                state: EEventState.Single
            })
        ]);

        nagerService.getHolidaysEvents.mockResolvedValue([
            createRawEvent({
                date: "2025-05-10",
                eventEng: "Holiday", 
                eventRu: "Holiday", 
                type: EEventType.Holiday, 
                state: EEventState.Single
            })
        ]);

        const res = await request(app).get("/api/timeline/events?month=4&year=2025");

        expect(res.status).toBe(200);

        expect(res.body["2025-05-10"]).toHaveLength(2);
    });

    it("returns 400 for invalid month", async () => {
        const { app } = createTestApp();

        const res = await request(app)
            .get("/api/timeline/events?month=99&year=2026");

        expect(res.status).toBe(400);
    });

    it("calls both services", async () => {
        const googleMock = jest.fn().mockResolvedValue([]);
        const nagerMock = jest.fn().mockResolvedValue([]);

        const { app } = createTestApp({
            googleCalendarService: { getGoogleCalendarEvents: googleMock },
            nagerService: { getHolidaysEvents: nagerMock }
        });

        const res = await request(app)
            .get("/api/timeline/events?month=4&year=2026");

        expect(res.status).toBe(200);
        expect(googleMock).toHaveBeenCalled();
        expect(nagerMock).toHaveBeenCalled();
    });

    it("handles multiple events on same date without overwriting", async () => {
        const { app, googleCalendarService, nagerService } = createTestApp();

        googleCalendarService.getGoogleCalendarEvents.mockResolvedValue([
            createRawEvent({ date: "2026-04-10", eventEng: "A", eventRu: "A", type: EEventType.Common, state: EEventState.Single})
            
        ]);

        nagerService.getHolidaysEvents.mockResolvedValue([
            createRawEvent({ date: "2026-04-10", eventEng: "B", eventRu: "B", type: EEventType.Holiday, state: EEventState.Single})
        ]);

        const res = await request(app)
            .get("/api/timeline/events?month=3&year=2026");

        const events: IEvent[] = res.body["2026-04-10"];

        expect(events.map((e: IEvent) => e.eventText)).toContain("A");
        expect(events.map((e: IEvent) => e.eventText)).toContain("B");
    });
});

describe("/priorities route", () => {
    it("returns priorities from Notion", async () => {
        const { app, notionService, localizationService } = createTestApp();

        const mockRawPriorities = [
            { priorityKey: "Priority 1", objectName: "Object 1", localizationKey: "object-1", url: "https://example.com/1", checked: false },
            { priorityKey: "Priority 2", objectName: "Object 2", localizationKey: "object-2", url: "https://example.com/2", checked: true }
        ];

        notionService.getNotionPriorities.mockResolvedValue(mockRawPriorities);
        localizationService.asyncLocalize
            .mockResolvedValueOnce("Localized Object 1")
            .mockResolvedValueOnce("Localized Object 2");

        const res = await request(app).get("/api/timeline/priorities");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { priorityKey: "Priority 1", objectName: "Localized Object 1", url: "https://example.com/1", checked: false },
            { priorityKey: "Priority 2", objectName: "Localized Object 2", url: "https://example.com/2", checked: true }
        ]);
    });
});
