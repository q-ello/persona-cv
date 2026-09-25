import { createNotionService } from "./notion.service";
import { requireEnvVariable } from "../../utils";

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;

describeIntegration("Integration: Notion", () => {
    const createRealNotion = () => {
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
        
        return {service};
    }

    it("fetches real priorities data", async () => {

        const {service} = createRealNotion();

        const result = await service.getNotionPriorities();

        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty("priorityKey");
        expect(result[0]).toHaveProperty("object");
        expect(result[0]["object"]).toHaveProperty("objectName");
        expect(result[0]["object"]).toHaveProperty("url");
        expect(result[0]).toHaveProperty("localizationKey");
        expect(result[0]).toHaveProperty("checked");
        expect(typeof result[0].checked).toBe("boolean");
    });

    it("fetches real localization data", async () => {
        const {service} = createRealNotion();

        const result = await service.getAllLocalizations();

        expect(result instanceof Map).toBe(true);

        const firstEntry = result.entries().next();
        expect(firstEntry.value?.[1]).toHaveProperty("en");
        expect(firstEntry.value?.[1]).toHaveProperty("ru");
    });

    it("returns empty map if data is now (it's always later than the last time db was edited", async () => {
        const {service} = createRealNotion();

        const result = await service.getAllLocalizations(new Date());

        expect(result.size).toBe(0);
    });
});
