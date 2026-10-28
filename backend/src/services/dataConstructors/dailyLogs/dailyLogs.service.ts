import { DailyLogsResponse, Language } from "@cv/shared";
import { IRawDailyLogItem } from "./dailyLogs.types";
import { formatMonthKey, ILogService, refreshIntervalTime } from "../../../utils";

export const createDailyLogsService = (
    services: readonly ILogService[]
) => {
    //first key: year-month, second: date string
    const cachedLogs: Map<string, Map<string, IRawDailyLogItem[]>> = new Map();
    let cacheInitialization: Promise<void> | null = null;
    let refreshInterval: NodeJS.Timeout | null = null;

    const getLogs = async (locale: Language, month: number, year: number): Promise<DailyLogsResponse> => {
        await init();
        
        const monthKey = formatMonthKey(year, month);

        if (!cachedLogs.has(monthKey)) {
            return {};
        }

        return localizeLogs(locale, cachedLogs.get(monthKey) ?? new Map());
    }

    const init = (): Promise<void> => {
        if (!cacheInitialization) {
            console.log("Started initializing daily logs cache");
            cacheInitialization = updateLogs();
            void cacheInitialization?.catch(error => {
                cacheInitialization = null;
                console.error("Failed to initialize daily logs cache:", error);
            })
        }

        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                updateLogs();
            }, refreshIntervalTime);
        }

        return cacheInitialization;
    }

    const updateLogs = async (servicesToUpdate: readonly ILogService[] = services): Promise<void> => {
        const newLogsResults = await Promise.allSettled(services.map(service => service.getLogs()));
        //todo: update github logs
        //todo: update hardcover logs
        //todo: update lingotrack logs
        //todo: update steam logs
        //todo: update trakt logs
        //todo: update tumbrl logs
        //todo: update unity logs
        const allLogs: IRawDailyLogItem[] = [];
        const servicesToCommit: ILogService[] = [];
        const servicesToRetry: ILogService[] = [];
        newLogsResults.forEach((result, index) => {
            if (result.status === "fulfilled") {
                allLogs.push(...result.value);
                if (result.value.length > 0) {
                    servicesToCommit.push(services[index]);
                }
            } else {
                servicesToRetry.push(services[index]);
                console.log(`Could not update logs of service: ${result.reason}. Will retry in 5 seconds`);
            }
        });

        mergeLogsIntoCache(allLogs);
        servicesToCommit.forEach(async service => await service.commitPendingCache());
        console.log(`Added ${allLogs} new logs total`);

        if (servicesToRetry.length > 0) {
            setTimeout(() => {
                updateLogs(servicesToRetry);
            }, 1000*5);
        }
    }

    const localizeLogs = (locale: Language, rawLogs: Map<string, IRawDailyLogItem[]>): DailyLogsResponse => {
        const localizedLogsRecord: DailyLogsResponse = {};

        rawLogs.forEach((rawLog, key) => {
            const localizedLogs = rawLogs.get(key)?.map(rawLog => ({
                //todo: make log
            }));

            localizedLogsRecord[key] = localizedLogs ?? [];
        })

        return localizedLogsRecord;
    }

    
    const mergeLogsIntoCache = (logs: IRawDailyLogItem[]): void => {
        const addToCache = (firstKey: string, secondKey: string, event: IRawDailyLogItem) => {
            if (!cachedLogs.has(firstKey)) {
                cachedLogs.set(firstKey, new Map([[secondKey, [event]]]));
            } else if (!cachedLogs.get(firstKey)?.has(secondKey)) {
                cachedLogs.get(firstKey)?.set(secondKey, [event]);
            } else {
                cachedLogs.get(firstKey)?.get(secondKey)?.push(event);
            }
        };

        logs.forEach(rawLog => {
            const dateString = rawLog.dateLogged;
            //the string is in y-m-d format, we just need y-m
            addToCache(`${dateString.substring(0, dateString.lastIndexOf('-'))}`, rawLog.dateLogged, rawLog);
        });
    }
}