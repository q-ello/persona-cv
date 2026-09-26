import { createNotionService } from "./notion.service";

type CreateNotionFactoryOptions = {
    queryResult?: any[];
    pageResult?: any;
    pageResultsById?: Record<string, any>;
    databaseResult?: any;
}

export const createNotionTestService = ({
    queryResult = [],
    pageResult = {},
    pageResultsById = {},
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
            retrieve: jest.fn(({page_id}: {page_id: string}) => Promise.resolve(pageResultsById[page_id] ?? pageResult))
        }
    };

    const service = createNotionService(notionMock as any, { secret: "", prioritiesDatabaseId: "", localizationDatabaseId: "", dailyLogDatabaseId: "" });

    return { service, notionMock };
}
