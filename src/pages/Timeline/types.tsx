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
    Deadline
}

export interface IEvent
{
    state: EEventState,
    eventEng: string,
    eventRu: string,
    type: EEventType
}
