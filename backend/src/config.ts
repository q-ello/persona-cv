export const config = {
    notion: {
        secret: '',
        objectivesDatasourceId: ''
    },
    googleCalendar: {
        apiKey: '',
        commonCalendarId: '',
        deadlinesCalendarId: ''
    }
}

export const loadConfig = () => {
    config.notion = {
        secret: process.env.NOTION_SECRET!,
        objectivesDatasourceId: process.env.NOTION_OBJECTIVES_DATASOURCE_ID!
    }

    config.googleCalendar = {
        apiKey: process.env.GOOGLE_CALENDAR_API_KEY!,
        commonCalendarId: process.env.GOOGLE_COMMON_CALENDAR_ID!,
        deadlinesCalendarId: process.env.GOOGLE_DEADLINES_CALENDAR_ID!
    }
}