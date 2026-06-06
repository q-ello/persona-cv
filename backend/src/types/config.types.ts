
export interface INotionConfig {
    secret: string;
    prioritiesDatabaseId: string;
    localizationDatabaseId: string;
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