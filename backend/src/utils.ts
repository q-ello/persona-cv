import { EventResponse, IEvent, isLanguage, Language } from "@cv/shared";
import { IRawEvent } from "./services/dataConstructors/event/event.types";

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

export const formatMonthKey = (year: number, month: number) => `${year}-${(month + 1).toString().padStart(2, '0')}`;

export const refreshIntervalTime = 1000*60*60*24;