import { createFetchMock } from "../../test/utils/createFetchMock"
import { createGoogleCalendarService } from "./googleCalendar.service";

export const createGoogleCalendarTestService = (response: any) => {
    const fetchMock = createFetchMock(response);

    const service = createGoogleCalendarService(
        {
            apiKey: "test",
            commonCalendarId: "common",
            deadlinesCalendarId: "deadlines"
        },
        fetchMock
    );

    return { service, fetchMock };
}