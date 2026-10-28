import { IObject } from "@cv/shared";
import { DetailFormatType } from "../../helpers/detailFormatter/detailFormatter.service";

export type IRawDailyLogItem = {
    activityKey: string;
    object?: IObject;
    objectLocalizationKey?: string;
    detailsKey?: string;
    detailsValue?: string;
    format?: DetailFormatType;
    dateLogged: string;
    relevantToProject: boolean;
    icons?: string;
    hoverInfo?: string;
}
