import { requireEnvVariable } from "../../../utils";
import { createGoogleCalendarService } from "./googleCalendar.service";
import { checkRawEventData } from "../nager/nager.service.int.test";

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;

describeIntegration("Integration: Google Calendar", () => {
    it("should fetch real events from Google Calendar", async () => {
        const service = createGoogleCalendarService({ apiKey: requireEnvVariable("GOOGLE_CALENDAR_API_KEY"), commonCalendarId: requireEnvVariable("GOOGLE_COMMON_CALENDAR_ID"), deadlinesCalendarId: requireEnvVariable("GOOGLE_DEADLINES_CALENDAR_ID") }, fetch);

        const result = await service.getGoogleCalendarEvents(new Date(2025, 4), new Date(2025, 5));
        checkRawEventData(result);
    });
});
