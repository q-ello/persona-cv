import { Octokit } from "octokit";
import { IGithubConfig } from "../../../types/config.types";
import { IRawDailyLogItem } from "../../dataConstructors/dailyLogs/dailyLogs.types"
import { IGithubCommit, IGithubRepo } from "./github.types";
import { getGeneralString } from "@cv/shared";
import { deepLog, LogType } from "../../../utils";

const log = (log: string, logType: LogType = "info") => {
    deepLog('github', log, logType);
}
//todo: {{amount}} commits in the start of hover info

export const createGithubService = (github: Octokit, deps: IGithubConfig) => {
    const lastUpdatedByRepo: Map<string, Date> = new Map();
    const pendingLastUpdatedByRepo: Map<string, Date> = new Map();

    let pendingRetries = false;

    const getRepoFullName = (repo: IGithubRepo) => `${repo.owner.login}/${repo.name}`;

    const getLogs = async (): Promise<IRawDailyLogItem[]> => {
        const response = await github.paginate(`GET /user/repos`);
        let repos: IGithubRepo[] = response;

        repos = repos.filter(repo => {
            const repoFullName = getRepoFullName(repo);
            const lastSuccessfulUpdate = lastUpdatedByRepo.get(repoFullName);

            return !lastSuccessfulUpdate || !repo.updated_at || new Date(repo.updated_at) > lastSuccessfulUpdate
        });

        const commitsResponses = await Promise.allSettled(repos.map(async repo => {
            let sinceParam = "";
            const repoFullName = getRepoFullName(repo);
            if (lastUpdatedByRepo.get(repoFullName)) {
                sinceParam = `&since=${lastUpdatedByRepo.get(repoFullName)?.toISOString()}`;
            }
            const response = await github.paginate(`GET /repos/{owner}/{repo}/commits?author=${deps.owner}${sinceParam}`, {
                owner: repo.owner.login,
                repo: repo.name
            });
            return response as IGithubCommit[];
        }));

        pendingRetries = commitsResponses.some(response => response.status === "rejected");

        const logs: IRawDailyLogItem[] = [];

        commitsResponses.forEach((response, index) => {
            const repoName = repos[index].name;
            const repoFullName = getRepoFullName(repos[index]);
            if (response.status === "fulfilled") {
                logs.push(...makeRawDailyLogItems(repoName, response.value));
                const updatedAt = repos[index].updated_at;
                if (updatedAt) {
                    pendingLastUpdatedByRepo.set(repoFullName, new Date(updatedAt));
                }
            } else {
                log(`Could not fetch commits for a repo ${repoName}: ${response.reason}`, "error");
            }
        });

        log(`Fetched ${logs.length} github logs`);

        return logs;
    }

    const commitPendingCache = async (): Promise<void> => {
        pendingLastUpdatedByRepo.forEach((value, key) => {
            lastUpdatedByRepo.set(key, value);
        })
        pendingLastUpdatedByRepo.clear();
    }

    const makeRawDailyLogItems = (repoName: string, commits: IGithubCommit[]): IRawDailyLogItem[] => {
        const hoverMessages: Map<string, { amount: number, message: string }> = new Map(); //date -> hover message

        commits.forEach(commit => {
            if (!commit.commit.author.date) {
                return;
            }
            const date = getGeneralString(new Date(commit.commit.author.date));
            const commitParts = commit.commit.message.split('\n');
            let message = commitParts.length > 3
                ? commitParts.slice(0, 3).join('\n') + "..."
                : commit.commit.message;

            if (hoverMessages.has(date)) {
                const prevMessage = hoverMessages.get(date)!;
                hoverMessages.set(date, { amount: prevMessage?.amount + 1, message: prevMessage?.message + '\n\n' + message });
            } else {
                hoverMessages.set(date, { amount: 1, message });
            }
        })

        const logs: IRawDailyLogItem[] = [];

        hoverMessages.forEach((value, key) => {
            logs.push({
                activityKey: "worked",
                object: { objectName: repoName },
                dateLogged: key,
                relevantToProject: true,
                hoverInfo: `${value.amount} commit${value.amount > 1 ? "s" : ""}:\n\n ${value.message}`
            })
        });

        return logs;
    }

    return { getLogs, commitPendingCache, hasPendingRetries: () => pendingRetries };
}