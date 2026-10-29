import { IRawDailyLogItem } from "../../dataConstructors/dailyLogs/dailyLogs.types";

export const createUnityService = (fetchFn: typeof fetch) => {
    const getLogs = async (): Promise<IRawDailyLogItem[]> => {
        return [];
    }

    const commitPendingCache = async (): Promise<void> => {

    }

    return { getLogs, commitPendingCache };
}