import { IEvent } from "@cv/shared";

export const requireEnvVariable = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }
    return value;
};

export const mergeEvents = (
    googleEvents: { date: string, event: IEvent }[],
    nagerEvents: { date: string, event: IEvent }[]
): Record<string, IEvent[]> => {

    const eventsRecord: Record<string, IEvent[]> = {};

    const addToMap = (key: string, event: IEvent) => {
        if (eventsRecord[key]) eventsRecord[key].push(event);
        else eventsRecord[key] = [event];
    };

    googleEvents.forEach(({ date, event }) => addToMap(date, event));
    nagerEvents.forEach(({ date, event }) => addToMap(date, event));

    return eventsRecord;
};

export const getGeneralString = (date: Date) => {
    return date.toISOString().split('T')[0];
};
