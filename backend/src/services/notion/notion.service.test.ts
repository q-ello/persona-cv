import { createNotionService } from "./notion.service";
import { createNotionTestService } from "./notion.service.factory";

describe("NotionService", () => {
    it("maps valid response to objectives", async () => {

        const {service} = createNotionTestService({
            queryResult: [
                {
                    properties: {
                        NameEn: { type: "text", plain_text: "Eng Name" },
                        NameRu: { type: "text", plain_text: "Ru Name" },
                        Object: {
                            relation: [{ id: "page-1" }]
                        }
                    }
                }
            ],
            pageResult: {
                properties: {
                    Name: {
                        title: [{ type: "text", plain_text: "Object Name" }]
                    },
                    URL: {
                        type: "url",
                        url: "http://example.com"
                    }
                }
            }
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
        const {service} = createNotionTestService({
            queryResult: [
                { noProperties: true } // invalid
            ]
        });

        const result = await service.getNotionObjectives();

        expect(result).toEqual([]);
    });

    it("skips items without relation", async () => {
        const {service} = createNotionTestService({
            queryResult: [
                {
                    properties: {
                        NameEn: { type: "text", plain_text: "Eng Name" },
                        NameRu: { type: "text", plain_text: "Ru Name" },
                        Object: {
                            relation: []
                        }
                    }
                }
            ]
        });

        const result = await service.getNotionObjectives();

        expect(result).toEqual([]);
    });
});
