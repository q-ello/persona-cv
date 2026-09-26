import { getGeneralString } from "@cv/shared";
import { createNotionCompoundActivitiesPage, createNotionDailyLogQuery, createNotionLocalizationQuery, createNotionObjectPage, createNotionPriorityQuery } from "./notion.builders";
import { maxPrioritiesNumber } from "./notion.service";
import { createNotionTestService } from "./notion.service.factory";

describe("NotionService", () => {
    //#region priorities
    it("maps valid response to priorities", async () => {
        const priorityKey = "Test Priority Key";
        const objectName = "Test Object Name";
        const objectLocalizationKey = "object.localization.key";
        const url = "Test url";
        const checked = true;

        const { service } = createNotionTestService({
            queryResult: [
                createNotionPriorityQuery({
                    priorityKey,
                    completed: checked,
                })
            ],
            pageResult: createNotionObjectPage({
                objectName,
                objectLocalizationKey: objectLocalizationKey,
                url
            })
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([
            {
                priorityKey,
                object: {objectName, url},
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
        const dummyPriority = createNotionPriorityQuery();

        const dummyArray = new Array(maxPrioritiesNumber + 1).fill(dummyPriority);

        const { service } = createNotionTestService({
            queryResult: dummyArray,
            pageResult: createNotionObjectPage()
        });
        const result = await service.getNotionPriorities();
        expect(result.length).toBe(maxPrioritiesNumber);
    })

    it("prioritizes unchecked items over checked items", async () => {
        const checkedPriority = createNotionPriorityQuery({
            completed: true
        });
        const uncheckedPriority = createNotionPriorityQuery({
            priorityKey: "Unchecked Priority",
            completed: false
        });

        const { service } = createNotionTestService({
            queryResult: [checkedPriority, uncheckedPriority],
            pageResult: createNotionObjectPage()
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
                createNotionLocalizationQuery({keyName: ""})
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

        const detailsValue = "Test details value";
        const dateLogged = new Date();
        const relevantToProject = true;

        const activityKey = "Test Activity Key";
        const detailsKey = "Test details key";
        const format = "text";

        const objectName = "Test Object Name";
        const localizationKey = "object.localization.key";
        const url = "Test url";

        const { service } = createNotionTestService({
            queryResult: [
                createNotionDailyLogQuery({
                    compoundActivitiesId: activitiesId,
                    objectId,
                    detailsValue,
                    dateLogged,
                    relevantToProject
                })
            ],
            pageResultsById: {
                [activitiesId]: createNotionCompoundActivitiesPage({
                    activityKey,
                    detailsKey,
                    format
                }),
                [objectId]: createNotionObjectPage({
                    objectName,
                    objectLocalizationKey: localizationKey,
                    url
                })
            }
        });

        const result = await service.getDailyLogs();

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
                detailsValue,
                format,
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

        const result = await service.getDailyLogs();

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
                            relation: [{id: 'ok'}]
                        },
                        RelevantToProject: { type: "checkbox", checkbox: false },
                        DetailsValue: { type: "rich_text", rich_text: [{type: "text", plain_text: "Priority Key"}] },
                        DateLogged: {type: "date", date: {start: "now"}}
                    }
                })
            ]
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([]);
    });
    //#endregion
});
