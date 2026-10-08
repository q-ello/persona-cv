import { EventResponse, IEvent, isLanguage, Language } from "@cv/shared";
import { IRawEvent } from "./types/events.types";

export const requireEnvVariable = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }
    return value;
};

export const getLocale = (req: any): Language => {
    const value = req.headers["accept-language"];
    return isLanguage(value) ? value : "en";
}