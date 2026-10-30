import { IObject } from "./notion";

export interface IDailyLogItem {
    activityKey: string;
    object?: IObject;
    relevantToProject: boolean;
    icons?: string[];
    hoverInfo?: string;
}

export type DailyLogsResponse = Record<string, IDailyLogItem[]>;