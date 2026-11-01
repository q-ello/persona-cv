import type { Octokit } from 'octokit';
import { createGithubService } from './github.service';
import { IGithubCommit, IGithubRepo } from './github.types';

const createRepo = (name = 'project', updated_at: string | null = '2026-10-10T12:00:00Z'): IGithubRepo => ({
    name, updated_at, owner: { login: 'repository-owner' },
});

const createCommit = (message = 'Fix a bug', date = '2026-10-10T12:00:00Z'): IGithubCommit => ({
    commit: { author: { date }, message },
});

const createTestService = (repos: IGithubRepo[] = [], commits: IGithubCommit[] = []) => {
    const paginate = jest.fn().mockResolvedValue(commits);
    paginate.mockResolvedValueOnce(repos);
    const service = createGithubService({ paginate } as unknown as Octokit, { owner: 'author', token: 'test' });
    return { service, paginate };
};

describe('GitHub logs', () => {
    beforeEach(() => {
        jest.useFakeTimers({ now: new Date('2026-10-10T14:00:00Z') });
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('paginates repositories and requests commits by the configured author and actual repository owner', async () => {
        const { service, paginate } = createTestService([createRepo()], [createCommit()]);

        await expect(service.getLogs()).resolves.toEqual([{
            activityKey: 'worked', object: { objectName: 'project' }, dateLogged: '2026-10-10',
            relevantToProject: true, hoverInfo: '1 commit:\n\n Fix a bug',
        }]);
        expect(paginate.mock.calls).toEqual([
            ['GET /user/repos'],
            ['GET /repos/{owner}/{repo}/commits?author=author', { owner: 'repository-owner', repo: 'project' }],
        ]);
    });

    it('combines commit messages per day while keeping different days separate', async () => {
        const { service } = createTestService([createRepo()], [
            createCommit('First'), createCommit('Second', '2026-10-10T13:00:00Z'),
            createCommit('Another day', '2026-10-09T12:00:00Z'),
        ]);

        expect((await service.getLogs()).map(({ dateLogged, hoverInfo }) => ({ dateLogged, hoverInfo })))
            .toEqual([
                { dateLogged: '2026-10-10', hoverInfo: '2 commits:\n\n First\n\nSecond' },
                { dateLogged: '2026-10-09', hoverInfo: '1 commit:\n\n Another day' },
            ]);
    });

    it('keeps logs for different repositories separate even on the same day', async () => {
        const { service } = createTestService([createRepo('first'), createRepo('second')], [createCommit()]);

        expect((await service.getLogs()).map(log => log.object?.objectName)).toEqual(['first', 'second']);
    });

    it.each([
        ['one line', '1 commit:\n\n one line'],
        ['one\ntwo\nthree', '1 commit:\n\n one\ntwo\nthree'],
        ['one\ntwo\nthree\nfour', '1 commit:\n\n one\ntwo\nthree...'],
    ])('formats hover text for %j', async (message, expected) => {
        const { service } = createTestService([createRepo()], [createCommit(message)]);

        expect((await service.getLogs())[0].hoverInfo).toBe(expected);
    });

    it('skips commits without an author date', async () => {
        const { service } = createTestService([createRepo()], [createCommit('Undated', ''), createCommit()]);

        const logs = await service.getLogs();
        expect(logs).toHaveLength(1);
        expect(logs[0].hoverInfo).toBe('1 commit:\n\n Fix a bug');
    });

    it('returns no logs for an empty repository list without requesting commits', async () => {
        const { service, paginate } = createTestService();

        await expect(service.getLogs()).resolves.toEqual([]);
        expect(paginate).toHaveBeenCalledTimes(1);
    });

    it('handles repositories without commits or an update timestamp', async () => {
        const { service, paginate } = createTestService([createRepo('empty'), createRepo('undated', null)]);

        await expect(service.getLogs()).resolves.toEqual([]);
        expect(paginate).toHaveBeenCalledTimes(3);
    });

    it('propagates repository-list failures so the caller can retry', async () => {
        const { service, paginate } = createTestService();
        paginate.mockReset().mockRejectedValueOnce(new Error('GitHub unavailable'))
            .mockResolvedValueOnce([createRepo()]).mockResolvedValueOnce([createCommit()]);

        await expect(service.getLogs()).rejects.toThrow('GitHub unavailable');
        await expect(service.getLogs()).resolves.toHaveLength(1);
    });

    it('retains successful repositories when another commit request fails', async () => {
        const { service, paginate } = createTestService([createRepo('failed'), createRepo('healthy')]);
        paginate.mockRejectedValueOnce(new Error('Forbidden')).mockResolvedValueOnce([createCommit()]);

        const logs = await service.getLogs();
        expect(logs).toHaveLength(1);
        expect(logs[0].object?.objectName).toBe('healthy');
    });

    it('does not advance the commit cursor before the caller commits the fetched batch', async () => {
        const { service, paginate } = createTestService([createRepo()], [createCommit()]);
        await service.getLogs();
        paginate.mockResolvedValueOnce([createRepo()]).mockResolvedValueOnce([createCommit()]);

        await expect(service.getLogs()).resolves.toHaveLength(1);
        expect(paginate).toHaveBeenLastCalledWith(
            'GET /repos/{owner}/{repo}/commits?author=author', { owner: 'repository-owner', repo: 'project' });
    });

    it('uses the committed repository timestamp as the next commit cursor', async () => {
        const { service, paginate } = createTestService([createRepo()], [createCommit()]);
        await service.getLogs();
        await service.commitPendingCache();
        paginate.mockResolvedValueOnce([createRepo('project', '2026-10-11T12:00:00Z')])
            .mockResolvedValueOnce([createCommit('New commit', '2026-10-11T12:00:00Z')]);

        await service.getLogs();

        expect(paginate).toHaveBeenLastCalledWith(
            'GET /repos/{owner}/{repo}/commits?author=author&since=2026-10-10T12:00:00.000Z',
            { owner: 'repository-owner', repo: 'project' });
    });

    it('skips unchanged repositories after committing a successful fetch', async () => {
        const { service, paginate } = createTestService([createRepo()], [createCommit()]);
        await service.getLogs();
        await service.commitPendingCache();
        paginate.mockClear().mockResolvedValueOnce([createRepo()]).mockResolvedValueOnce([createCommit()]);

        await service.getLogs();

        expect(paginate).toHaveBeenCalledTimes(1);
    });
});
