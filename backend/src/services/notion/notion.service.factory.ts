import { createNotionService } from "./notion.service";

type CreateNotionFactoryOptions = {
    queryResult?: any[];
    pageResult?: any;
    databaseResult?: any;
}

export const createNotionTestService = ({
    queryResult = [],
    pageResult = {},
    databaseResult = { data_sources: [{ id: "data-source-1" }] }
}: CreateNotionFactoryOptions = {}) => {
    const notionMock = {
        databases: {
            retrieve: jest.fn().mockResolvedValue(databaseResult)
        },
        dataSources: {
            query: jest.fn().mockResolvedValue({
                results: queryResult
            })
        },
        pages: {
            retrieve: jest.fn().mockResolvedValue(pageResult)
        }
    };

    const service = createNotionService(notionMock as any, { secret: "", prioritiesDatabaseId: "", localizationDatabaseId: "" });

    return { service, notionMock };
}
