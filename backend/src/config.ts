import {IConfig} from "./types/config.types";
import {requireEnvVariable} from "./utils";

export const config : IConfig = {
    notion: {
        secret: "",
        prioritiesDbId: "",
        localizationDbId: "",
        dailyLogDbId: "",
        objectDbId: "",
        compoundActivitiesDbId: ""
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
        prioritiesDbId: requireEnvVariable("NOTION_PRIORITIES_DATABASE_ID"),
        localizationDbId: requireEnvVariable("NOTION_LOCALIZATION_DATABASE_ID"),
        dailyLogDbId: requireEnvVariable("NOTION_DAILY_LOG_DATABASE_ID"),
        objectDbId: requireEnvVariable("NOTION_OBJECT_DATABASE_ID"),
        compoundActivitiesDbId: requireEnvVariable("NOTION_COMPOUND_ACTIVITIES_DATABASE_ID")
    }

    config.googleCalendar = {
        apiKey: requireEnvVariable("GOOGLE_CALENDAR_API_KEY"),
        commonCalendarId: requireEnvVariable("GOOGLE_COMMON_CALENDAR_ID"),
        deadlinesCalendarId: requireEnvVariable("GOOGLE_DEADLINES_CALENDAR_ID")
    }
}