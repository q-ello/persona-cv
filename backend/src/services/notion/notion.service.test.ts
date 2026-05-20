import { createNotionObjectivePage, createNotionObjectiveQuery } from "./notion.builders";
import { createNotionTestService } from "./notion.service.factory";

describe("NotionService", () => {
    it("maps valid response to objectives", async () => {

        const { service } = createNotionTestService({
            queryResult: [
                createNotionObjectiveQuery(
                    {
                        properties: {
                            NameEn: { type: "text", plain_text: "Eng Name" },
                            NameRu: { type: "text", plain_text: "Ru Name" },
                            Object: {
                                relation: [{ id: "page-1" }]
                            }
                        }
                    }
                )
            ],
            pageResult: createNotionObjectivePage({
                properties: {
                    Name: {
                        title: [{ type: "text", plain_text: "Object Name" }]
                    },
                    URL: {
                        type: "url",
                        url: "http://example.com"
                    }
                }
            })
        });

        const result = await service.getNotionObjectives();

        expect(result).toEqual([
            {
                nameEng: "Eng Name",
                nameRu: "Ru Name",
                object: "Object Name",
                url: "http://example.com"
            }
        ]);
    });

    it("filters out invalid results", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                { noProperties: true } // invalid
            ]
        });

        const result = await service.getNotionObjectives();

        expect(result).toEqual([]);
    });

    it("skips items without relation", async () => {
        const { service } = createNotionTestService({
            queryResult: [
                createNotionObjectiveQuery(
                {
                    properties: {
                        NameEn: { type: "text", plain_text: "Eng Name" },
                        NameRu: { type: "text", plain_text: "Ru Name" },
                        Object: {
                            relation: []
                        }
                    }
                })
            ]
        });

        const result = await service.getNotionObjectives();

        expect(result).toEqual([]);
    });

    it("cuts items length to 7 if longer", async () => {
        const dummyObjective = createNotionObjectiveQuery({
            properties: {
                NameEn: { type: "text", plain_text: "Eng Name" },
                NameRu: { type: "text", plain_text: "Ru Name" },
                Object: {
                    relation: [{ id: "page-1" }]
                }
            }
        });

        const dummyArray = new Array(8).fill(dummyObjective);

        const { service } = createNotionTestService({
            queryResult: dummyArray,
            pageResult: createNotionObjectivePage({
                properties: {
                    Name: {
                        title: [{ type: "text", plain_text: "Object Name" }]
                    },
                    URL: {
                        type: "url",
                        url: "http://example.com"
                    }
                }
            })
        });
        const result = await service.getNotionObjectives();
        expect(result.length).toBe(7);
    })
});
