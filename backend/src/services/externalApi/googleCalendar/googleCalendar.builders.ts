export type GoogleCalendarEvent = {
    id?: string;
    summary?: string;
    description?: string;
    start?: {
        dateTime?: string;
        date?: string;
    };

    end?: {
        dateTime?: string;
        date?: string;
    };
}

export const createGoogleCalendarEvent = (overrides: GoogleCalendarEvent = {}): GoogleCalendarEvent => ({
    id: "event-1",
    summary: "Event",
    description: "Событие",
    start: { date: "2026-05-10" },
    end: { date: "2026-05-11" },
    ...overrides
});
