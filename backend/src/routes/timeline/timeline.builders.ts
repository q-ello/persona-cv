import { EEventState, EEventType } from "@cv/shared";
import { IRawEvent } from "../../types/events.types";

export const createRawEvent = (overrides: Partial<IRawEvent> = {
    date: "",
    eventRu: "",
    eventEng: "",
    state: EEventState.Single,
    type: EEventType.Common
}): IRawEvent => ({
    ...overrides
} as IRawEvent);