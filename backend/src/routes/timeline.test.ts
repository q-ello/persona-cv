import request from "supertest";
import { IEvent } from "@cv/shared";
import { createTestApp } from "../test/factories/createTestApp";

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
            {
                date: "2025-05-10",
                event: { eventEng: "Google Event", eventRu: "Google Event", type: "Common", state: "Single" }
            }
        ]);

        nagerService.getHolidaysEvents.mockResolvedValue([
            {
                date: "2025-05-10",
                event: { eventEng: "Holiday", eventRu: "Holiday", type: "Holiday", state: "Single" }
            }
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
            { date: "2026-04-10", event: { eventEng: "A", eventRu: "A", type: "Common", state: "Single" } }
        ]);

        nagerService.getHolidaysEvents.mockResolvedValue([
            { date: "2026-04-10", event: { eventEng: "B", eventRu: "B", type: "Holiday", state: "Single" } }
        ]);

        const res = await request(app)
            .get("/api/timeline/events?month=3&year=2026");

        const events: IEvent[] = res.body["2026-04-10"];

        expect(events.map((e: IEvent) => e.eventEng)).toContain("A");
        expect(events.map((e: IEvent) => e.eventEng)).toContain("B");
    });
});

describe("/objectives route", () => {
    it("returns objectives from Notion", async () => {
        const { app, notionService } = createTestApp();

        const mockObjectives = [
            { id: "1", title: "Objective 1", description: "Desc 1", date: "2024-01-01" },
            { id: "2", title: "Objective 2", description: "Desc 2", date: "2024-02-01" }
        ];

        notionService.getNotionObjectives.mockResolvedValue(mockObjectives);

        const res = await request(app).get("/api/timeline/objectives");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockObjectives);
    });
});