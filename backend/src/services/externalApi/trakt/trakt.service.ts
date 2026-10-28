export const createTraktService = (fetchFn: typeof fetch) => {
    const getLogs = async (): Promise<IRawDailyLogItem[]> => {

    }

    const commitPendingCache = async (): Promise<void> => {

    }

    return { getLogs, commitPendingCache };
}