import { IEvent, isLanguage, Language } from "@cv/shared";
import { IRawEvent } from "./types/events.types";

export const requireEnvVariable = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }
    return value;
};

export const mergeAndLocalizeEvents = (
    locale: Language,
    googleEvents: IRawEvent[],
    nagerEvents: IRawEvent[]
): Record<string, IEvent[]> => {

    const eventsRecord: Record<string, IEvent[]> = {};

    const addToMap = (key: string, event: IEvent) => {
        if (eventsRecord[key]) eventsRecord[key].push(event);
        else eventsRecord[key] = [event];
    };

    [...googleEvents, ...nagerEvents].forEach(rawEvent => {
        addToMap(rawEvent.date, {
            state: rawEvent.state,
            //google calendar is a real constraint so any language that is not ru just has to fall back to english
            eventText: (locale && locale === "ru") ? rawEvent.eventRu : rawEvent.eventEng,
            type: rawEvent.type
        })
    }
    );

    return eventsRecord;
};

export const getLocale = (req: any): Language => {
    const value = req.headers["accept-language"];
    return isLanguage(value) ? value : "en";
}