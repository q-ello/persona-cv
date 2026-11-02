import { DailyLogsResponse, Language } from "@cv/shared";
import { IRawDailyLogItem } from "./dailyLogs.types";
import { deepLog, formatMonthKey, ILogService, LogType, refreshIntervalTime, retryIntervalTime } from "../../../utils";
import { createLocalizationService } from "../../helpers/localization/localization.service";

const log = (log: string, type: LogType = "info") => {
    deepLog('dailyLogs', log, type);
}

export const createDailyLogsService = (
    services: readonly ILogService[],
    localizationService: ReturnType<typeof createLocalizationService>
) => {
    //first key: year-month, second: date string
    const cachedLogs: Map<string, Map<string, IRawDailyLogItem[]>> = new Map();
    let cacheInitialization: Promise<void> | null = null;
    let refreshInterval: NodeJS.Timeout | null = null;

    let updateQueue: Promise<void> = Promise.resolve();
    let retryTimeout: NodeJS.Timeout | null = null;
    const retryServices = new Set<ILogService>();

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
            log("Started initializing daily logs cache");
            cacheInitialization = updateLogs();
            void cacheInitialization?.catch(error => {
                cacheInitialization = null;
                log("Failed to initialize daily logs cache:" + error, "error");
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
        const update = updateQueue.then(async () => {
            if (retryTimeout) {
                clearTimeout(retryTimeout);
                retryTimeout = null;
            }

            const newLogsResults = await Promise.allSettled(servicesToUpdate.map(service => service.getLogs()));
            const allLogs: IRawDailyLogItem[] = [];
            const servicesToCommit: ILogService[] = [];

            newLogsResults.forEach((result, index) => {
                const service = servicesToUpdate[index];

                if (result.status === "rejected") {
                    retryServices.add(service);
                    log(`Could not update logs of service: ${result.reason}. Will retry in 5 seconds`, "error");
                    return;
                }

                allLogs.push(...result.value);
                servicesToCommit.push(service);

                if (service.hasPendingRetries?.()) {
                    retryServices.add(service);
                } else {
                    retryServices.delete(service);
                }
            });

            mergeLogsIntoCache(allLogs);

            await Promise.all(servicesToCommit.map(service => service.commitPendingCache()));
            log(`Added ${allLogs.length} new logs total`);

            if (retryServices.size > 0) {
                retryTimeout = setTimeout(() => {
                    retryTimeout = null;
                    void updateLogs([...retryServices]);
                }, retryIntervalTime);
            }
        })

        updateQueue = update.catch(error => {
            log(`Failed to update daily logs: ${error}`, "error");
        });

        return update;

        //todo: update hardcover logs
        //todo: update lingotrack logs
        //todo: update steam logs
        //todo: update trakt logs
        //todo: update tumbrl logs
        //todo: update unity logs
    }

    const localizeLogs = async (locale: Language, rawLogs: Map<string, IRawDailyLogItem[]>): Promise<DailyLogsResponse> => {
        const localizedLogsRecord: DailyLogsResponse = {};

        for (const [key, logs] of rawLogs) {
            localizedLogsRecord[key] = await Promise.all(
                logs.map(async rawLog => ({
                    activityKey: rawLog.activityKey,
                    object: rawLog.object ? await localizationService.localizeObject(rawLog.object, locale, rawLog.objectLocalizationKey) : undefined,
                    relevantToProject: rawLog.relevantToProject,
                    icons: rawLog.icons,
                    hoverInfo: rawLog.detailsKey ? await localizationService.asyncLocalize(`detail.${rawLog.detailsKey}`, locale) : rawLog.hoverInfo
                }))
            );
        }

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

    return { init, getLogs }
}