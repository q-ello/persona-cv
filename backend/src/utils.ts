import { isLanguage, Language } from "@cv/shared";
import { IRawDailyLogItem } from "./services/dataConstructors/dailyLogs/dailyLogs.types";

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

export interface ILogService {
    getLogs(): Promise<IRawDailyLogItem[]>;
    commitPendingCache(): Promise<void>;
};

export type LogType = "info" | "error" | "warning";

export const deepLog = (serviceName: string, log: string, type: LogType) => {
    const message = `${`[${serviceName}]`.padEnd(15)} - ${log}`;
    switch (type) {
        case "error":
            console.error(message);
            break;
        case "info":
            console.log(message);
            break;
        case "warning":
            console.warn(message);
    }
}