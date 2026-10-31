import request from "supertest";
import { DailyLogsResponse, EEventState, EEventType, EventResponse } from "@cv/shared";
import { createTestApp } from "../../test/factories/createTestApp";

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

    it("returns 400 for invalid month", async () => {
        const { app } = createTestApp();

        const res = await request(app)
            .get("/api/timeline/events?month=99&year=2026");

        expect(res.status).toBe(400);
    });

    it("passes locale and date parameters to the event service and returns its response", async () => {
        const { app, eventService } = createTestApp();
        const events: EventResponse = {
            "2026-04-10": [{ eventText: "Событие", type: EEventType.Common, state: EEventState.Single }]
        };
        eventService.getEvents.mockResolvedValue(events);

        const res = await request(app)
            .get("/api/timeline/events?month=3&year=2026")
            .set("Accept-Language", "ru");

        expect(res.status).toBe(200);
        expect(eventService.getEvents).toHaveBeenCalledWith("ru", 3, 2026);
        expect(res.body).toEqual(events);
    });

    it("returns 500 when the event service fails", async () => {
        const { app, eventService } = createTestApp();
        eventService.getEvents.mockRejectedValue(new Error("Events unavailable"));
        const log = jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            const res = await request(app).get("/api/timeline/events?month=3&year=2026");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: "Failed to fetch events" });
        } finally {
            log.mockRestore();
        }
    });
});

describe("/priorities route", () => {
    it("returns priorities from Notion", async () => {
        const { app, notionService, localizationService } = createTestApp();

        const mockRawPriorities = [
            { priorityKey: "Priority 1", objectLocalizationKey: "object-1", object: {objectName: "Object 1", url: "https://example.com/1"}, checked: false },
            { priorityKey: "Priority 2", objectLocalizationKey: "object-2", object: {objectName: "Object 2", url: "https://example.com/2"}, checked: true }
        ];

        notionService.getNotionPriorities.mockResolvedValue(mockRawPriorities);
        localizationService.localizeObject
            .mockResolvedValueOnce({ objectName: "Localized Object 1", url: "https://example.com/1" })
            .mockResolvedValueOnce({ objectName: "Localized Object 2", url: "https://example.com/2" });

        const res = await request(app).get("/api/timeline/priorities");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { priorityKey: "Priority 1", object: {objectName: "Localized Object 1", url: "https://example.com/1"}, checked: false },
            { priorityKey: "Priority 2", object: {objectName: "Localized Object 2", url: "https://example.com/2"}, checked: true }
        ]);
    });
});

describe("/logs route", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each(["", "?month=0", "?year=2026"])("rejects missing parameters: %s", async query => {
        const { app, logService } = createTestApp();

        const response = await request(app).get(`/api/timeline/logs${query}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Month and year query parameters are required" });
        expect(logService.getLogs).not.toHaveBeenCalled();
    });

    it.each([
        "month=-1&year=2026", "month=12&year=2026", "month=invalid&year=2026", "month=0&year=invalid",
    ])("rejects invalid parameters: %s", async query => {
        const { app, logService } = createTestApp();

        const response = await request(app).get(`/api/timeline/logs?${query}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid month or year format" });
        expect(logService.getLogs).not.toHaveBeenCalled();
    });

    it.each([0, 11])("accepts zero-based month %i and defaults to English", async month => {
        const { app, logService } = createTestApp();

        const response = await request(app).get(`/api/timeline/logs?month=${month}&year=2026`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({});
        expect(logService.getLogs).toHaveBeenCalledWith("en", month, 2026);
    });

    it("passes the requested locale and returns the daily log response", async () => {
        const { app, logService } = createTestApp();
        const logs: DailyLogsResponse = {
            "2026-04-10": [{
                activityKey: "worked", object: { objectName: "Проект" },
                relevantToProject: true, hoverInfo: "Commit message", icons: ["code"],
            }],
        };
        logService.getLogs.mockResolvedValue(logs);

        const response = await request(app).get("/api/timeline/logs?month=3&year=2026")
            .set("Accept-Language", "ru");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(logs);
        expect(logService.getLogs).toHaveBeenCalledWith("ru", 3, 2026);
    });

    it("falls back to English for an unsupported locale", async () => {
        const { app, logService } = createTestApp();

        const response = await request(app).get("/api/timeline/logs?month=0&year=2026")
            .set("Accept-Language", "de");

        expect(response.status).toBe(200);
        expect(logService.getLogs).toHaveBeenCalledWith("en", 0, 2026);
    });

    it("returns a generic 500 response when fetching logs fails", async () => {
        const { app, logService } = createTestApp();
        logService.getLogs.mockRejectedValue(new Error("Private provider error"));

        const response = await request(app).get("/api/timeline/logs?month=0&year=2026");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to fetch logs" });
    });
});
