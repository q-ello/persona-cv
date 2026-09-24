import { IObject } from "./notion";

export interface IDailyLogItem {
    activityKey: string;
    object: IObject;
    relevantToProject: boolean;
    detail?: string;
    icons?: string[];
    hoverInfo?: string;
}

export type DailyLogsResponse = Record<string, IDailyLogItem[]>;