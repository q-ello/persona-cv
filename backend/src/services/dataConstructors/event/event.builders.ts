import { EEventState, EEventType } from "@cv/shared";
import { IRawEvent } from "../../../types/events.types";

export const createRawEvent = (overrides: Partial<IRawEvent> = {}): IRawEvent => ({
    date: "",
    eventRu: "Событие",
    eventEng: "Event",
    state: EEventState.Single,
    type: EEventType.Common,
    ...overrides
});
