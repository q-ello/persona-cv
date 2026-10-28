import { Octokit } from "octokit";
import { IGithubConfig } from "../../../types/config.types";
import { IRawDailyLogItem } from "../../dataConstructors/dailyLogs/dailyLogs.types"
import { IGithubCommit, IGithubRepo } from "./github.types";

export const createGithubService = (github: Octokit, deps: IGithubConfig) => {
    let lastFetchedTime: Date | null = null;
    let pendingLastFetchedTime: Date | null = null;

    let lastUpdatedByRepo: Map<string, Date> = new Map();
    const pendingLastUpdatedByRepo: Map<string, Date> = new Map();

    const getLogs = async (): Promise<IRawDailyLogItem[]> => {

        const response = await github.request(`GET /user/repos`);
        let repos: IGithubRepo[] = response.data;

        if (lastFetchedTime) {
            repos = repos.filter(repo => repo.updated_at && new Date(repo.updated_at) > lastFetchedTime!);
        }

        const commits: IGithubCommit[] = [];

        const commitsResponses = await Promise.allSettled(repos.map(async repo => {
            let sinceParam = "";
            if (lastUpdatedByRepo.get(repo.name)) {
                sinceParam = `&since=${lastUpdatedByRepo.get(repo.name)?.toISOString()}`;
            }
            const response = await github.request(`GET /repos/{owner}/{repo}/commits?author=${deps.owner}${sinceParam}`, {
                owner: deps.owner,
                repo: repo.name
            });
            return response.data;
        }));

        commitsResponses.forEach((response, index) => {
            const repoName = repos[index].name;
            if (response.status === "fulfilled") {
                commits.push(...response.value);
                const updatedAt = repos[index].updated_at;
                if (updatedAt) {
                    pendingLastUpdatedByRepo.set(repoName, new Date(updatedAt));
                }
            } else {
                console.log(`Could not fetch commits for a repo ${repoName}. Will retry in 5 seconds.`, response.reason);
            }
        });

        return makeRawDailyLogItems(commits);
    }

    const commitPendingCache = async (): Promise<void> => {
        lastFetchedTime = pendingLastFetchedTime;
        lastUpdatedByRepo = pendingLastUpdatedByRepo;
        pendingLastUpdatedByRepo.clear();
    }

    const makeRawDailyLogItems = (commits: IGithubCommit[]): IRawDailyLogItem[] => {
        //todo: make daiy logs. group by the date and the same name, make 'worked on {{object}}'
    }

    return { getLogs, commitPendingCache };
}