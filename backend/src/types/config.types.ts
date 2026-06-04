
export interface INotionConfig {
    secret: string;
    prioritiesDatasourceId: string;
    localizationDatasourceId: string;
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