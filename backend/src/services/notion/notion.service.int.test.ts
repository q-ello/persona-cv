import { createNotionService } from "./notion.service";
import { requireEnvVariable } from "../../utils";

describe("Integration: Notion", () => {
    it("fetches real priorities data", async () => {
        const Client = require("@notionhq/client").Client;

        const notion = new Client({
            auth: requireEnvVariable("NOTION_SECRET")
        });

        const service = createNotionService(notion,
            {
                secret: requireEnvVariable("NOTION_SECRET"),
                prioritiesDatabaseId: requireEnvVariable("NOTION_PRIORITIES_DATABASE_ID"),
                localizationDatabaseId: requireEnvVariable("NOTION_LOCALIZATION_DATABASE_ID")
            });

        const result = await service.getNotionPriorities();
        
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty("priorityKey");
        expect(result[0]).toHaveProperty("objectName");
        expect(result[0]).toHaveProperty("objectLocalizationKey");
        expect(result[0]).toHaveProperty("url");
        expect(result[0]).toHaveProperty("checked");
        expect(typeof result[0].checked).toBe("boolean");
    });

    //todo: add localization fetching test
});
