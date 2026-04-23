import express from "express";
import { createTimelineRouter } from "./timeline";
import request from "supertest";

jest.mock('../services/googleCalendar.service', () => ({
    createGoogleCalendarService: jest.fn().mockReturnValue({
        getGoogleCalendarEvents: jest.fn().mockResolvedValue([])
    })
}));

jest.mock('../services/nager.service', () => ({
    getHolidaysEvents: jest.fn().mockResolvedValue([])
}));

const app = express();
app.use("/api/timeline", createTimelineRouter(
    { getNotionObjectives: jest.fn().mockResolvedValue([]) } as any,
    { getGoogleCalendarEvents: jest.fn().mockResolvedValue([]) } as any,
    { getHolidaysEvents: jest.fn().mockResolvedValue([]) } as any
));

describe("GET /events", () => {



});

describe("/events route", () => {

    const setupApp = (overrides?: any) => {
        const notionService = { getNotionObjectives: jest.fn().mockResolvedValue([]), ...overrides?.notionService } as any;
        const googleCalendarService = { getGoogleCalendarEvents: jest.fn().mockResolvedValue([]), ...overrides?.googleCalendarService } as any;
        const nagerService = { getHolidaysEvents: jest.fn().mockResolvedValue([]), ...overrides?.nagerService } as any;
        const app = express();
        app.use("/api/timeline", createTimelineRouter(notionService, googleCalendarService, nagerService));
        return { app, notionService, googleCalendarService, nagerService };
    };

    it("returns 400 if params missing", async () => {
        const response = await request(app).get("/api/timeline/events");
        expect(response.status).toBe(400);
    });

    it("returns empty object if no events", async () => {
        const response = await request(app).get("/api/timeline/events?year=2024&month=1");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({});
    });

    it("merges google and holiday events correctly", async () => {
        const { app, googleCalendarService } = setupApp();

        googleCalendarService.getGoogleCalendarEvents.mockResolvedValue([
            {
                date: "5/10/2025",
                event: { eventEng: "Google Event", eventRu: "Google Event", type: "Common", state: "Single" }
            }
        ]);

        // mock holidays directly via jest
        jest.spyOn(require("../services/nager.service"), "getHolidaysEvents")
            .mockResolvedValue([
                {
                    date: "5/10/2025",
                    event: { eventEng: "Holiday", eventRu: "Holiday", type: "Holiday", state: "Single" }
                }
            ]);

        const res = await request(app)
            .get("/api/timeline/events?month=5&year=2025");

        expect(res.status).toBe(200);

        expect(res.body["5/10/2025"]).toHaveLength(2);
    });

    it("returns 400 for invalid month", async () => {
        const { app } = setupApp();

        const res = await request(app)
            .get("/api/timeline/events?month=99&year=2026");

        expect(res.status).toBe(400);
    });

    it("calls both services", async () => {
        const { app, googleCalendarService, nagerService } = setupApp();

        googleCalendarService.getGoogleCalendarEvents.mockResolvedValue([]);
        nagerService.getHolidaysEvents.mockResolvedValue([]);

        await request(app)
            .get("/api/timeline/events?month=4&year=2026");

        expect(googleCalendarService.getGoogleCalendarEvents).toHaveBeenCalled();
        expect(nagerService.getHolidaysEvents).toHaveBeenCalled();
    });

    it("handles multiple events on same date without overwriting", async () => {
        const { app, googleCalendarService, nagerService } = setupApp();

        googleCalendarService.getGoogleCalendarEvents.mockResolvedValue([
            { date: "2026-04-10", event: { eventEng: "A", eventRu: "A", type: "Common", state: "Single" } }
        ]);

        nagerService.getHolidaysEvents.mockResolvedValue([
            { date: "2026-04-10", event: { eventEng: "B", eventRu: "B", type: "Holiday", state: "Single" } }
        ]);

        const res = await request(app)
            .get("/api/timeline/events?month=4&year=2026");

        const events = res.body["2026-04-10"];

        expect(events.map((e: any) => e.event.eventEng)).toContain("A");
        expect(events.map((e: any) => e.event.eventEng)).toContain("B");
    });
})