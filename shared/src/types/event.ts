export enum EWeekday {
    Weekday,
    Saturday,
    Holiday
}

export interface IHoliday
{
    date: string,
    localName: string,
    name: string
}

export enum EEventState
{
    Single,
    Start,
    Middle,
    End,
    None
}

export enum EEventType
{
    Common,
    Deadline,
    Holiday
}

export interface IEvent
{
    state: EEventState,
    eventText: string,
    type: EEventType
}

export type EventResponse = Record<string, IEvent[]>;