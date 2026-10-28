export interface IGithubCommit {
    sha: string;
    author: {
        date: string;
    };
    message: string;
}

export interface IGithubRepo {
    name: string;
    updated_at: string | null;
    owner: {
        login: string;
    }
}