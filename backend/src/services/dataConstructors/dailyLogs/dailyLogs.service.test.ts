import { IObject, Language } from '@cv/shared';
import { createDeferred } from '../../../test/utils/createDeferred';
import { refreshIntervalTime } from '../../../utils';
import { createDailyLogsService } from './dailyLogs.service';
import { IRawDailyLogItem } from './dailyLogs.types';

const createLog = (overrides: Partial<IRawDailyLogItem> = {}): IRawDailyLogItem => ({
    activityKey: 'worked',
    dateLogged: '2026-01-10',
    relevantToProject: true,
    ...overrides,
});

const createProvider = (logs: IRawDailyLogItem[] = []) => ({
    getLogs: jest.fn().mockResolvedValue(logs),
    commitPendingCache: jest.fn().mockResolvedValue(undefined),
});

const createLocalization = () => ({
    init: jest.fn(),
    reload: jest.fn().mockResolvedValue(undefined),
    asyncLocalize: jest.fn(async (key: string, locale: Language) => `${locale}:${key}`),
    localizeObject: jest.fn(async (object: IObject, locale: Language, key?: string) => ({
        ...object,
        objectName: key ? `${locale}:${key}` : object.objectName,
    })),
});

describe('daily logs cache', () => {
    beforeEach(() => {
        jest.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') });
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('shares initialization across concurrent readers and commits after logs arrive', async () => {
        const provider = createProvider();
        const loading = createDeferred<IRawDailyLogItem[]>();
        provider.getLogs.mockReturnValueOnce(loading.promise);
        const service = createDailyLogsService([provider], createLocalization());
        const initialization = service.init();
        expect(service.init()).toBe(initialization);
        let finished = false;
        const english = service.getLogs('en', 0, 2026).then(logs => {
            finished = true;
            return logs;
        });
        const russian = service.getLogs('ru', 0, 2026);
        await jest.advanceTimersByTimeAsync(0);

        expect(finished).toBe(false);
        expect(provider.commitPendingCache).not.toHaveBeenCalled();
        loading.resolve([createLog()]);

        expect((await english)['2026-01-10']).toHaveLength(1);
        expect((await russian)['2026-01-10']).toHaveLength(1);
        expect(provider.getLogs).toHaveBeenCalledTimes(1);
        expect(provider.commitPendingCache).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(1);
    });

    it('groups providers by day and isolates zero-based months and years', async () => {
        const service = createDailyLogsService([
            createProvider([
                createLog(),
                createLog({ dateLogged: '2026-12-31' }),
                createLog({ dateLogged: '2025-01-10' }),
            ]),
            createProvider([createLog({ activityKey: 'read' })]),
        ], createLocalization());

        expect(await service.getLogs('en', 0, 2026)).toEqual({
            '2026-01-10': [
                { activityKey: 'worked', relevantToProject: true },
                { activityKey: 'read', relevantToProject: true },
            ],
        });
        expect(Object.keys(await service.getLogs('en', 11, 2026))).toEqual(['2026-12-31']);
        expect(Object.keys(await service.getLogs('en', 0, 2025))).toEqual(['2025-01-10']);
        await expect(service.getLogs('en', 1, 2026)).resolves.toEqual({});
    });

    it('localizes objects and details at read time without exposing raw fields', async () => {
        const localization = createLocalization();
        const provider = createProvider([createLog({
            object: { objectName: 'Project', url: 'https://example.com' },
            objectLocalizationKey: 'project',
            detailsKey: 'coding',
            hoverInfo: 'Original details',
            icons: ['code'],
        })]);
        const service = createDailyLogsService([provider], localization);

        for (const locale of ['en', 'ru'] as const) {
            expect(await service.getLogs(locale, 0, 2026)).toStrictEqual({
                '2026-01-10': [{
                    activityKey: 'worked',
                    object: { objectName: `${locale}:project`, url: 'https://example.com' },
                    relevantToProject: true,
                    icons: ['code'],
                    hoverInfo: `${locale}:detail.coding`,
                }],
            });
            expect(localization.localizeObject).toHaveBeenCalledWith(
                { objectName: 'Project', url: 'https://example.com' }, locale, 'project');
            expect(localization.asyncLocalize).toHaveBeenCalledWith('detail.coding', locale);
        }
        expect(provider.getLogs).toHaveBeenCalledTimes(1);
    });

    it('preserves hover text and handles logs without an object or details key', async () => {
        const localization = createLocalization();
        const service = createDailyLogsService([
            createProvider([createLog({ hoverInfo: 'Commit message', relevantToProject: false })]),
        ], localization);

        expect((await service.getLogs('en', 0, 2026))['2026-01-10'][0]).toEqual({
            activityKey: 'worked', relevantToProject: false, hoverInfo: 'Commit message',
        });
        expect(localization.localizeObject).not.toHaveBeenCalled();
        expect(localization.asyncLocalize).not.toHaveBeenCalled();
    });

    it('returns an empty response for no providers or no logs without committing', async () => {
        await expect(createDailyLogsService([], createLocalization()).getLogs('en', 0, 2026))
            .resolves.toEqual({});
        const provider = createProvider();
        const service = createDailyLogsService([provider], createLocalization());

        await expect(service.getLogs('en', 0, 2026)).resolves.toEqual({});
        expect(provider.commitPendingCache).not.toHaveBeenCalled();
    });

    it('refreshes daily and appends new logs while retaining earlier months', async () => {
        const provider = createProvider([createLog()]);
        const service = createDailyLogsService([provider], createLocalization());
        await service.init();
        provider.getLogs.mockResolvedValueOnce([
            createLog({ activityKey: 'read' }), createLog({ dateLogged: '2026-02-01' }),
        ]).mockResolvedValue([]);

        await jest.advanceTimersByTimeAsync(refreshIntervalTime - 1);
        expect(provider.getLogs).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(1);

        expect((await service.getLogs('en', 0, 2026))['2026-01-10'].map(log => log.activityKey))
            .toEqual(['worked', 'read']);
        expect(Object.keys(await service.getLogs('en', 1, 2026))).toEqual(['2026-02-01']);
        expect(provider.commitPendingCache).toHaveBeenCalledTimes(2);
        await jest.advanceTimersByTimeAsync(refreshIntervalTime);
        expect((await service.getLogs('en', 0, 2026))['2026-01-10']).toHaveLength(2);
        expect(provider.commitPendingCache).toHaveBeenCalledTimes(2);
    });

    it('serves successful providers and retries only failures after five seconds', async () => {
        const healthy = createProvider([createLog()]);
        const failing = createProvider();
        failing.getLogs.mockRejectedValueOnce(new Error('Notion unavailable'))
            .mockResolvedValue([createLog({ activityKey: 'read' })]);
        const service = createDailyLogsService([healthy, failing], createLocalization());

        expect((await service.getLogs('en', 0, 2026))['2026-01-10']).toHaveLength(1);
        expect(failing.commitPendingCache).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(4999);
        expect(failing.getLogs).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(1);

        expect((await service.getLogs('en', 0, 2026))['2026-01-10']).toHaveLength(2);
        expect(healthy.getLogs).toHaveBeenCalledTimes(1);
        expect(healthy.commitPendingCache).toHaveBeenCalledTimes(1);
        expect(failing.getLogs).toHaveBeenCalledTimes(2);
        expect(failing.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('keeps retrying a failed provider without duplicating successful logs', async () => {
        const healthy = createProvider([createLog()]);
        const failing = createProvider();
        failing.getLogs.mockRejectedValueOnce(new Error('Offline'))
            .mockRejectedValueOnce(new Error('Still offline'))
            .mockResolvedValue([createLog({ activityKey: 'read' })]);
        const service = createDailyLogsService([healthy, failing], createLocalization());
        await service.init();

        await jest.advanceTimersByTimeAsync(10000);

        expect((await service.getLogs('en', 0, 2026))['2026-01-10']).toHaveLength(2);
        expect(healthy.getLogs).toHaveBeenCalledTimes(1);
        expect(failing.getLogs).toHaveBeenCalledTimes(3);
        expect(failing.commitPendingCache).toHaveBeenCalledTimes(1);
    });

    it('propagates localization failures and leaves raw logs available for another read', async () => {
        const localization = createLocalization();
        localization.asyncLocalize.mockRejectedValueOnce(new Error('Localization unavailable'));
        const provider = createProvider([createLog({ detailsKey: 'coding' })]);
        const service = createDailyLogsService([provider], localization);

        await expect(service.getLogs('en', 0, 2026)).rejects.toThrow('Localization unavailable');
        expect((await service.getLogs('ru', 0, 2026))['2026-01-10'][0].hoverInfo).toBe('ru:detail.coding');
        expect(provider.getLogs).toHaveBeenCalledTimes(1);
    });
});
