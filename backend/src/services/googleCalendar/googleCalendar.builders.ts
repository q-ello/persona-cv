type GoogleCalendarEvent = {
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
    ...overrides
});