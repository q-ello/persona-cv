import { IObject } from "@cv/shared";

export type IRawDailyLogItem = {
    activityKey: string;
    object?: IObject;
    objectLocalizationKey?: string;
    detailsKey?: string;
    dateLogged: string;
    relevantToProject: boolean;
    icons?: string[];
    hoverInfo?: string;
}
