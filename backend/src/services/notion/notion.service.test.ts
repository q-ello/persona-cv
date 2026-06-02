import { createNotionPriorityPage, createNotionPriorityQuery } from "./notion.builders";
import { createNotionTestService } from "./notion.service.factory";

describe("NotionService", () => {
    const createValidPriorityQuery = (overrides = {}) => createNotionPriorityQuery({
        properties: {
            PriorityKey: { type: "text", plain_text: "Priority Key" },
            Completed: { type: "checkbox", checkbox: false },
            Object: {
                relation: [{ id: "page-1" }]
            },
            ...overrides
        }
    });

    const validPriorityPage = createNotionPriorityPage({
        properties: {
            Name: {
                title: [{ type: "text", plain_text: "Object Name" }]
            },
            LocalizationKey: {
                rich_text: [{ type: "text", plain_text: "object.localization.key" }]
            },
            URL: {
                type: "url",
                url: "http://example.com"
            }
        }
    });

    it("maps valid response to priorities", async () => {

        const { service } = createNotionTestService({
            queryResult: [
                createValidPriorityQuery()
            ],
            pageResult: validPriorityPage
        });

        const result = await service.getNotionPriorities();

        expect(result).toEqual([
            {
                priorityKey: "Priority Key",
                objectName: "Object Name",
                objectLocalizationKey: "object.localization.key",
                url: "http://example.com",
                checked: false
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
                createNotionPriorityQuery({
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

    it("cuts items length to 7 if longer", async () => {
        const dummyPriority = createValidPriorityQuery();

        const dummyArray = new Array(8).fill(dummyPriority);

        const { service } = createNotionTestService({
            queryResult: dummyArray,
            pageResult: validPriorityPage
        });
        const result = await service.getNotionPriorities();
        expect(result.length).toBe(7);
    })

    it("prioritizes unchecked items over checked items", async () => {
        const checkedPriority = createValidPriorityQuery({
            Completed: { type: "checkbox", checkbox: true }
        });
        const uncheckedPriority = createValidPriorityQuery({
            PriorityKey: { type: "text", plain_text: "Unchecked Priority" },
            Completed: { type: "checkbox", checkbox: false }
        });

        const { service } = createNotionTestService({
            queryResult: [checkedPriority, uncheckedPriority],
            pageResult: validPriorityPage
        });

        const result = await service.getNotionPriorities();

        expect(result.map(priority => priority.checked)).toEqual([false, true]);
        expect(result[0].priorityKey).toBe("Unchecked Priority");
    });
});
