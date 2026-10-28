import { EEventState, EEventType } from "@cv/shared";

export interface IRawEvent
{
    date: string,
    eventRu: string,
    eventEng: string,
    state: EEventState;
    type: EEventType;
}