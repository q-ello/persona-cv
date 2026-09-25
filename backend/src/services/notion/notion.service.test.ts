import { createNotionLocalizationQuery, createNotionObjectPage, createNotionPriorityQuery } from "./notion.builders";
import { maxPrioritiesNumber } from "./notion.service";
import { createNotionTestService } from "./notion.service.factory";

describe("NotionService", () => {
    //#region priorities
    it("maps valid response to priorities", async () => {
        const priorityKey = "Test Priority Key";
        const objectName = "Test Object Name";
        const localizationKey = "object.localization.key";
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
                localizationKey,
                url
            })
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([
            {
                priorityKey,
                object: {objectName, url},
                localizationKey,
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
});
