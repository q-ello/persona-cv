import { IGithubConfig } from "../../../types/config.types";
import { IRawDailyLogItem } from "../../dataConstructors/dailyLogs/dailyLogs.types"

export const createGithubService = (deps: IGithubConfig, fetchFn: typeof fetch) => {
    const getLogs = async (): Promise<IRawDailyLogItem[]> => {

    }

    const commitPendingCache = async (): Promise<void> => {

    }

    return {getLogs, commitPendingCache};
}