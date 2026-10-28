import { Octokit } from "octokit";
import { IGithubConfig } from "../../../types/config.types";
import { IRawDailyLogItem } from "../../dataConstructors/dailyLogs/dailyLogs.types"
import { IGithubCommit, IGithubRepo } from "./github.types";
import { getGeneralString } from "@cv/shared";

export const createGithubService = (github: Octokit, deps: IGithubConfig) => {
    let lastFetchedTime: Date | null = null;
    let pendingLastFetchedTime: Date | null = null;

    let lastUpdatedByRepo: Map<string, Date> = new Map();
    const pendingLastUpdatedByRepo: Map<string, Date> = new Map();

    const getLogs = async (): Promise<IRawDailyLogItem[]> => {

        const response = await github.paginate(`GET /user/repos`);
        let repos: IGithubRepo[] = response;

        if (lastFetchedTime) {
            repos = repos.filter(repo => repo.updated_at && new Date(repo.updated_at) > lastFetchedTime!);
        }

        const commitsResponses = await Promise.allSettled(repos.map(async repo => {
            let sinceParam = "";
            if (lastUpdatedByRepo.get(repo.name)) {
                sinceParam = `&since=${lastUpdatedByRepo.get(repo.name)?.toISOString()}`;
            }
            const response = await github.paginate(`GET /repos/{owner}/{repo}/commits?author=${deps.owner}${sinceParam}`, {
                owner: deps.owner,
                repo: repo.name
            });
            return response as IGithubCommit[];
        }));

        const logs: IRawDailyLogItem[] = [];

        commitsResponses.forEach((response, index) => {
            const repoName = repos[index].name;
            if (response.status === "fulfilled") {
                logs.push(...makeRawDailyLogItems(repoName, response.value));
                const updatedAt = repos[index].updated_at;
                if (updatedAt) {
                    pendingLastUpdatedByRepo.set(repoName, new Date(updatedAt));
                }
            } else {
                console.log(`Could not fetch commits for a repo ${repoName}. Will retry in 5 seconds.`, response.reason);
            }
        });

        return logs;
    }

    const commitPendingCache = async (): Promise<void> => {
        lastFetchedTime = pendingLastFetchedTime;
        lastUpdatedByRepo = pendingLastUpdatedByRepo;
        pendingLastUpdatedByRepo.clear();
    }

    const makeRawDailyLogItems = (repoName: string, commits: IGithubCommit[]): IRawDailyLogItem[] => {
        const hoverMessages: Map<string, string> = new Map(); //date -> hover message

        commits.forEach(commit => {
            const date = getGeneralString(new Date(commit.author.date));
            if (hoverMessages.has(date)) {
                hoverMessages.set(date, hoverMessages.get(date) + '\n' + commit.message);
            } else {
                hoverMessages.set(date, commit.message);
            }
        })

        const logs: IRawDailyLogItem[] = [];
        
        hoverMessages.forEach((value, key) => {
            logs.push({
                activityKey: "worked",
                object: {objectName: repoName},
                dateLogged: key,
                relevantToProject: true,
                hoverInfo: value
            })
        });

        return logs;
    }

    return { getLogs, commitPendingCache };
}