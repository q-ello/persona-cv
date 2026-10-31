import { getGeneralString } from "@cv/shared";
import { createNotionCompoundActivitiesPage, createNotionDailyLogQuery, createNotionLocalizationQuery, createNotionObjectPage, createNotionPriorityQuery } from "./notion.builders";
import { maxPrioritiesNumber } from "./notion.service";
import { createNotionTestService } from "./notion.service.factory";

const createDailyLog = () => createNotionDailyLogQuery({ dateLogged: new Date("2026-10-10T12:00:00Z") });
const createLogsService = (queryResult: any[] = [createDailyLog()]) => createNotionTestService({
    queryResult,
    objectResultsById: { "page-2": createNotionObjectPage() },
    compoundActivitiesResultsById: { "page-1": createNotionCompoundActivitiesPage() },
});

describe("NotionService", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    //#region priorities
    it("maps valid response to priorities", async () => {
        const priorityKey = "Test Priority Key";
        const objectName = "Test Object Name";
        const objectLocalizationKey = "object.localization.key";
        const url = "Test url";
        const checked = true;
        const objectId = "object-id";

        const { service } = createNotionTestService({
            queryResult: [
                createNotionPriorityQuery({
                    priorityKey,
                    completed: checked,
                    objectId
                })
            ],
            objectResultsById: {
                [objectId]: createNotionObjectPage({
                    objectName,
                    objectLocalizationKey: objectLocalizationKey,
                    url
                })
            }
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([
            {
                priorityKey,
                object: { objectName, url },
                objectLocalizationKey,
                checked
            }
        ]);
    });

    it("filters out invalid results", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                { noProperties: true } // invalid
            ]
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([]);
    });

    it("skips items without relation", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                ({
                    properties: {
                        PriorityKey: { type: "text", plain_text: "Priority Key" },
                        Completed: { type: "checkbox", checkbox: false },
                        Object: {
                            relation: []
                        }
                    }
                })
            ]
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([]);
    });

    it("cuts items length to maxPrioritiesNumber if longer", async () => {
        const objectId = "object-id";
        const dummyPriority = createNotionPriorityQuery({ objectId });

        const dummyArray = new Array(maxPrioritiesNumber + 1).fill(dummyPriority);

        const { service } = createNotionTestService({
            queryResult: dummyArray,
            objectResultsById: {
                [objectId]: createNotionObjectPage()
            }
        });
        const result = await service.getNotionPriorities();
        expect(result.length).toBe(maxPrioritiesNumber);
    })

    it("prioritizes unchecked items over checked items", async () => {
        const objectId = "object id";
        const checkedPriority = createNotionPriorityQuery({
            completed: true,
            objectId
        });
        const uncheckedPriority = createNotionPriorityQuery({
            priorityKey: "Unchecked Priority",
            completed: false,
            objectId
        });

        const { service } = createNotionTestService({
            queryResult: [checkedPriority, uncheckedPriority],
            objectResultsById: {
                [objectId]: createNotionObjectPage()
            }
        });

        const result = await service.getNotionPriorities();

        expect(result.map(priority => priority.checked)).toEqual([false, true]);
        expect(result[0].priorityKey).toBe("Unchecked Priority");
    });

    //#endregion

    //#region localization
    it("makes a localization cache", async () => {
        const keyName = "Test Key";
        const enLocalization = "Test Eng Localization";
        const ruLocalization = "Test Ru Localization";

        const localization = createNotionLocalizationQuery({
            keyName,
            enLocalization,
            ruLocalization,
        });

        const { service } = createNotionTestService({
            queryResult: [localization]
        });

        const result = await service.getAllLocalizations();

        expect(result instanceof Map).toBe(true);
        expect(result.size).toBe(1);

        const firstEntry = result.entries().next();
        expect(firstEntry.value?.[0]).toBe(keyName);
        expect(firstEntry.value?.[1]).toHaveProperty("en");
        expect(firstEntry.value?.[1]).toHaveProperty("ru");
        expect(firstEntry.value?.[1].en).toBe(enLocalization);
        expect(firstEntry.value?.[1].ru).toBe(ruLocalization);
    });

    it("skips empty keys", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                createNotionLocalizationQuery(),
                createNotionLocalizationQuery({ keyName: "" })
            ]
        });

        const result = await service.getAllLocalizations();

        expect(result instanceof Map).toBe(true);
        expect(result.size).toBe(1);

        const firstEntry = result.entries().next();
        expect(firstEntry.value?.[0].length).toBeGreaterThan(0);
    })

    //#endregion

    //#region daily logs
    it("maps valid response to daily logs", async () => {
        const objectId = "test object";
        const activitiesId = "test activities";

        const dateLogged = new Date("2026-10-10T12:00:00Z");
        const relevantToProject = true;

        const activityKey = "Test Activity Key";
        const detailsKey = "Test details key";

        const objectName = "Test Object Name";
        const localizationKey = "object.localization.key";
        const url = "Test url";

        const { service } = createNotionTestService({
            queryResult: [
                createNotionDailyLogQuery({
                    compoundActivitiesId: activitiesId,
                    objectId,
                    dateLogged,
                    relevantToProject
                })
            ],
            objectResultsById: {
                [objectId]: createNotionObjectPage({
                    objectName,
                    objectLocalizationKey: localizationKey,
                    url
                })
            },
            compoundActivitiesResultsById: {
                [activitiesId]: createNotionCompoundActivitiesPage({
                    activityKey,
                    detailsKey
                })
            }
        });

        const result = await service.getLogs();

        const dateString = getGeneralString(dateLogged);

        expect(result).toEqual([
            {
                activityKey,
                object: {
                    objectName,
                    url
                },
                objectLocalizationKey: localizationKey,
                detailsKey,
                dateLogged: dateString,
                relevantToProject
            }
        ]);
    });

    it("filters out invalid results for daily logs", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                { noProperties: true } // invalid
            ]
        });

        const result = await service.getLogs();

        expect(result).toEqual([]);
    });

    it("skips daily logs without compound activities relation", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                ({
                    properties: {
                        CompoundActivities: {
                            relation: []
                        },
                        Object: {
                            relation: [{ id: 'ok' }]
                        },
                        RelevantToProject: { type: "checkbox", checkbox: false },
                        DetailsValue: { type: "rich_text", rich_text: [{ type: "text", plain_text: "Priority Key" }] },
                        DateLogged: { type: "date", date: { start: "now" } }
                    }
                })
            ]
        });

        const result = await service.getLogs();

        expect(result).toEqual([]);
    });

    it.each([{ relation: [] }, { relation: [{}] }, { relation: [{ id: "unknown-page" }] }])("skips unresolved compound activities: $relation", async ({ relation }) => {
        const entry = createDailyLog();
        const { service } = createLogsService([{
            ...entry,
            properties: { ...entry.properties, CompoundActivities: { relation } },
        }]);

        await expect(service.getLogs()).resolves.toEqual([]);
    });

    it.each([{ relation: [] }, { relation: [{ id: "unknown-page" }] }])("keeps a log without a resolved optional object: $relation", async ({ relation }) => {
        const entry = createDailyLog();
        const { service } = createLogsService([{
            ...entry,
            properties: { ...entry.properties, Object: { relation } },
        }]);

        await expect(service.getLogs()).resolves.toEqual([{
            activityKey: "Activity Key", detailsKey: "Details Key", dateLogged: "2026-10-10",
            relevantToProject: false,
        }]);
    });

    it("paginates the daily log data source before resolving relations", async () => {
        const { service, notionMock } = createLogsService();
        notionMock.dataSources.query.mockResolvedValueOnce({
            results: [createNotionDailyLogQuery({ dateLogged: new Date("2026-10-09T12:00:00Z") })],
            has_more: true, next_cursor: "next-page",
        });

        expect((await service.getLogs()).map(log => log.dateLogged)).toEqual(["2026-10-09", "2026-10-10"]);
        expect(notionMock.dataSources.query).toHaveBeenNthCalledWith(2, expect.objectContaining({
            data_source_id: "data-source-1", start_cursor: "next-page",
        }));
        expect(notionMock.databases.retrieve).toHaveBeenCalledWith({ database_id: "daily-log-db" });
    });

    it("loads each relation database once for concurrent entries and later reads", async () => {
        const { service, notionMock } = createLogsService([createDailyLog(), createDailyLog()]);

        const results = await Promise.all([service.getLogs(), service.getLogs()]);
        expect(results.map(logs => logs.length)).toEqual([2, 2]);
        await expect(service.getLogs()).resolves.toHaveLength(2);

        for (const dataSource of ["object-data-source", "compound-activities-data-source"]) {
            expect(notionMock.dataSources.query.mock.calls.filter(([args]) => args.data_source_id === dataSource))
                .toHaveLength(1);
        }
        expect(notionMock.databases.retrieve).toHaveBeenCalledTimes(5);
    });

    it("paginates relation databases and ignores relation results without properties", async () => {
        const { service, notionMock } = createLogsService();
        const query = notionMock.dataSources.query.getMockImplementation()!;
        notionMock.dataSources.query.mockImplementationOnce(query)
            .mockResolvedValueOnce({
                results: [{ id: "invalid-page" }], has_more: true, next_cursor: "more-activities",
            });

        await expect(service.getLogs()).resolves.toHaveLength(1);
        expect(notionMock.dataSources.query).toHaveBeenNthCalledWith(3, expect.objectContaining({
            data_source_id: "compound-activities-data-source", start_cursor: "more-activities",
        }));
    });

    it("only advances the created-time filter after committing the pending batch", async () => {
        const fetchedAt = new Date("2026-10-11T12:00:00Z");
        jest.useFakeTimers({ now: fetchedAt });
        const { service, notionMock } = createLogsService();
        await service.getLogs();
        await service.getLogs();
        const logQueries = () => notionMock.dataSources.query.mock.calls
            .map(([args]) => args).filter(args => args.data_source_id === "data-source-1");
        expect(logQueries()).toEqual([
            expect.objectContaining({ filter: undefined }), expect.objectContaining({ filter: undefined }),
        ]);

        jest.setSystemTime(new Date("2026-10-12T12:00:00Z"));
        await service.commitPendingCache();
        await service.getLogs();

        expect(logQueries().at(-1)).toEqual(expect.objectContaining({
            filter: { property: "Created time", date: { after: fetchedAt.toISOString() } },
        }));
    });

    it("committing before any fetch does not exclude historical logs", async () => {
        const { service, notionMock } = createLogsService();
        await service.commitPendingCache();

        await expect(service.getLogs()).resolves.toHaveLength(1);
        expect(notionMock.dataSources.query).toHaveBeenNthCalledWith(1, expect.objectContaining({ filter: undefined }));
    });

    it("returns no logs when the data source is empty without loading relations", async () => {
        const { service, notionMock } = createLogsService([]);

        await expect(service.getLogs()).resolves.toEqual([]);
        expect(notionMock.databases.retrieve).toHaveBeenCalledTimes(1);
        expect(notionMock.dataSources.query).toHaveBeenCalledTimes(1);
    });

    it("reports database retrieval failures and allows a later retry", async () => {
        const { service, notionMock } = createLogsService();
        notionMock.databases.retrieve.mockRejectedValueOnce(new Error("Notion unavailable"));

        await expect(service.getLogs()).rejects.toThrow("Failed to fetch daily logs from Notion");
        expect(notionMock.dataSources.query).not.toHaveBeenCalled();
        await expect(service.getLogs()).resolves.toHaveLength(1);
    });

    it("reports query failures without advancing the previously committed filter", async () => {
        const fetchedAt = new Date("2026-10-11T12:00:00Z");
        jest.useFakeTimers({ now: fetchedAt });
        const { service, notionMock } = createLogsService();
        await service.getLogs();
        await service.commitPendingCache();
        jest.setSystemTime(new Date("2026-10-12T12:00:00Z"));
        notionMock.dataSources.query.mockRejectedValueOnce(new Error("Rate limited"));

        await expect(service.getLogs()).rejects.toThrow("Failed to fetch daily logs from Notion");
        await expect(service.getLogs()).resolves.toHaveLength(1);

        expect(notionMock.dataSources.query).toHaveBeenLastCalledWith(expect.objectContaining({
            filter: { property: "Created time", date: { after: fetchedAt.toISOString() } },
        }));
    });

    it("retries a failed relation load instead of caching its rejected promise", async () => {
        const { service, notionMock } = createLogsService();
        const retrieve = notionMock.databases.retrieve.getMockImplementation()!;
        notionMock.databases.retrieve.mockImplementationOnce(retrieve)
            .mockRejectedValueOnce(new Error("Relations unavailable"));

        await expect(service.getLogs()).rejects.toThrow("Failed to fetch daily logs from Notion");
        await expect(service.getLogs()).resolves.toHaveLength(1);

        expect(notionMock.databases.retrieve.mock.calls.filter(([args]) => args.database_id === "compound-activities-db"))
            .toHaveLength(2);
    });
    //#endregion
});
