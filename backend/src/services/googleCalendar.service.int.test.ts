import { requireEnvVariable } from "../utils";
import { createGoogleCalendarService } from "./googleCalendar.service";

describe("Integration: Google Calendar", () => {
    it("should fetch real events from Google Calendar", async () => {
        const service = createGoogleCalendarService({ apiKey: requireEnvVariable("GOOGLE_CALENDAR_API_KEY"), commonCalendarId: requireEnvVariable("GOOGLE_COMMON_CALENDAR_ID"), deadlinesCalendarId: requireEnvVariable("GOOGLE_DEADLINES_CALENDAR_ID") }, fetch);

        const result = await service.getGoogleCalendarEvents(2026, 3); // April 2026
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty("date");
        expect(result[0]).toHaveProperty("event");
    });
});