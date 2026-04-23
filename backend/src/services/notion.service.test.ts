import { createNotionService } from "./notion.service";
import { requireEnvVariable } from "../config";

describe("NotionService", () => {
    it("maps valid response to objectives", async () => {

        const fakeNotion = {
            dataSources: {
                query: jest.fn().mockResolvedValue({
                    results: [
                        {
                            properties: {
                                NameEn: { type: "text", plain_text: "Eng Name" },
                                NameRu: { type: "text", plain_text: "Ru Name" },
                                Object: {
                                    relation: [{ id: "page-1" }]
                                }
                            }
                        }
                    ]
                })
            },
            pages: {
                retrieve: jest.fn().mockResolvedValue({
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
            }
        };

        const service = createNotionService(fakeNotion as any, { secret: "", objectivesDatasourceId: "" });

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
        const fakeNotion = {
            dataSources: {
                query: jest.fn().mockResolvedValue({
                    results: [
                        { noProperties: true } // invalid
                    ]
                })
            },
            pages: {
                retrieve: jest.fn()
            }
        };

        const service = createNotionService(fakeNotion as any, {secret: "", objectivesDatasourceId: ""});

        const result = await service.getNotionObjectives();

        expect(result).toEqual([]);
    });

    it("skips items without relation", async () => {
        const fakeNotion = {
            dataSources: {
                query: jest.fn().mockResolvedValue({
                    results: [
                        {
                            properties: {
                                Object: { relation: [] }
                            }
                        }
                    ]
                })
            },
            pages: {
                retrieve: jest.fn()
            }
        };

        const service = createNotionService(fakeNotion as any, { secret: "", objectivesDatasourceId: "" });

        const result = await service.getNotionObjectives();

        expect(result).toEqual([]);
    });
});
