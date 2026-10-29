import { IRawDailyLogItem } from "../../dataConstructors/dailyLogs/dailyLogs.types";

export const createSteamService = (fetchFn: typeof fetch) => {
    const getLogs = async (): Promise<IRawDailyLogItem[]> => {
        return [];
    }

    const commitPendingCache = async (): Promise<void> => {

    }

    return { getLogs, commitPendingCache };
}