import {IConfig} from "./types/config.types";
import {requireEnvVariable} from "./utils";

export const config : IConfig = {
    notion: {
        secret: "",
        objectivesDatasourceId: ""
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
        objectivesDatasourceId: requireEnvVariable("NOTION_OBJECTIVES_DATASOURCE_ID")
    }

    config.googleCalendar = {
        apiKey: requireEnvVariable("GOOGLE_CALENDAR_API_KEY"),
        commonCalendarId: requireEnvVariable("GOOGLE_COMMON_CALENDAR_ID"),
        deadlinesCalendarId: requireEnvVariable("GOOGLE_DEADLINES_CALENDAR_ID")
    }
}