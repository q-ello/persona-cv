import { createNotionService } from "./notion.service";
import { requireEnvVariable } from "../config";

describe("Integration: Notion", () => {
    it("fetches real data", async () => {
        const Client = require("@notionhq/client").Client;

        const notion = new Client({
            auth: requireEnvVariable("NOTION_SECRET")
        });

        const service = createNotionService(notion, { secret: requireEnvVariable("NOTION_SECRET"), objectivesDatasourceId: requireEnvVariable("NOTION_OBJECTIVES_DATASOURCE_ID") });

        const result = await service.getNotionObjectives();

        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty("nameEng");
        expect(result[0]).toHaveProperty("nameRu");
        expect(result[0]).toHaveProperty("object");
        expect(result[0]).toHaveProperty("url");
    });
});