import { DailyLogsResponse, Language } from "@cv/shared";
import { createGithubService } from "../../externalApi/github/github.service";
import { createHardcoverService } from "../../externalApi/hardcover/hardcover.service";
import { createLingoTrackService } from "../../externalApi/lingotrack/lingotrack.service";
import { createNotionService } from "../../externalApi/notion/notion.service";
import { createSteamService } from "../../externalApi/steam/steam.services";
import { createTraktService } from "../../externalApi/trakt/trakt.service";
import { createTumblrService } from "../../externalApi/tumblr/tumblr.service";
import { createUnityService } from "../../externalApi/unity/unity.service";
import { IRawDailyLogItem } from "./dailyLogs.types";
import { formatMonthKey, refreshIntervalTime } from "../../../utils";

export const createDailyLogsService = (
    notionService: ReturnType<typeof createNotionService>,
    githubService: ReturnType<typeof createGithubService>,
    hardcoverService: ReturnType<typeof createHardcoverService>,
    lingotrackService: ReturnType<typeof createLingoTrackService>,
    steamService: ReturnType<typeof createSteamService>,
    traktService: ReturnType<typeof createTraktService>,
    tumblrService: ReturnType<typeof createTumblrService>,
    unityService: ReturnType<typeof createUnityService>
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

    const updateLogs = async (): Promise<void> => {
        try {
            const newLogs = [];
            newLogs.push(...await notionService.getDailyLogs());
            //todo: update github logs
            //todo: update hardcover logs
            //todo: update lingotrack logs
            //todo: update steam logs
            //todo: update trakt logs
            //todo: update tumbrl logs
            //todo: update unity logs
            mergeLogsIntoCache(newLogs);
            //every ILogService: commit pending cache
            console.log(`Added ${newLogs.length} new logs total`);
            
            //question: maybe add interface getLogs to every service, so that we just call it for each service?
            //and put array of ILogService instead of so many different ones
            //todo: catch different services errors, so that one doesn't fail all of them
        } catch (error) {
            console.log(`Could not refresh logs. retrying in 5 seconds`);
            //todo: log which ones failed
            setTimeout(() => {
                updateLogs();
            }, 5000);
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