import { createNotionService } from "./notion.service";

type CreateNotionFactoryOptions = {
    queryResult?: any[];
    pageResult?: any;
}

export const createNotionTestService = ({
    queryResult = [],
    pageResult = {}
}: CreateNotionFactoryOptions = {}) => {
    const notionMock = {
        dataSources: {
            query: jest.fn().mockResolvedValue({
                results: queryResult
            })
        },
        pages: {
            retrieve: jest.fn().mockResolvedValue(pageResult)
        }
    };

    const service = createNotionService(notionMock as any, { secret: "", objectivesDatasourceId: "" });

    return { service, notionMock };
}