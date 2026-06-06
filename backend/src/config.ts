import {IConfig} from "./types/config.types";
import {requireEnvVariable} from "./utils";

export const config : IConfig = {
    notion: {
        secret: "",
        prioritiesDatabaseId: "",
        localizationDatabaseId: ""
    },
    googleCalendar: {
        apiKey: "",
        commonCalendarId: "",
        deadlinesCalendarId: ""
    }
};

export const loadConfig = () => {
    config.notion = {
        secret: requireEnvVariable("NOTION_SECRET"),
        prioritiesDatabaseId: requireEnvVariable("NOTION_PRIORITIES_DATABASE_ID"),
        localizationDatabaseId: requireEnvVariable("NOTION_LOCALIZATION_DATABASE_ID")
    }

    config.googleCalendar = {
        apiKey: requireEnvVariable("GOOGLE_CALENDAR_API_KEY"),
        commonCalendarId: requireEnvVariable("GOOGLE_COMMON_CALENDAR_ID"),
        deadlinesCalendarId: requireEnvVariable("GOOGLE_DEADLINES_CALENDAR_ID")
    }
}