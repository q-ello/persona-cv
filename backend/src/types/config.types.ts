
export interface INotionConfig {
    secret: string;
    prioritiesDbId: string;
    localizationDbId: string;
    dailyLogDbId: string;
    objectDbId: string;
    compoundActivitiesDbId: string;
}

export interface IGoogleCalendarConfig {
    apiKey: string;
    commonCalendarId: string;
    deadlinesCalendarId: string;
}

export interface IConfig {
    notion: INotionConfig;
    googleCalendar: IGoogleCalendarConfig;
}