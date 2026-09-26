import { INotionConfig } from "../../types/config.types";
import { createNotionService } from "./notion.service";

type CreateNotionFactoryOptions = {
    queryResult?: any[];
    objectResultsById?: Record<string, any>;
    compoundActivitiesResultsById?: Record<string, any>;
    databaseResult?: any;
}

export const createNotionTestService = ({
    queryResult = [],
    objectResultsById = {},
    compoundActivitiesResultsById = {},
    databaseResult = { data_sources: [{ id: "data-source-1" }] }
}: CreateNotionFactoryOptions = {}) => {
    const config: INotionConfig = {
        secret: "",
        prioritiesDbId: "priorities-db",
        localizationDbId: "localization-db",
        dailyLogDbId: "daily-log-db",
        objectDbId: "object-db",
        compoundActivitiesDbId: "compound-activities-db"
    };

    const objectDataSourceId = "object-data-source";
    const compoundActivitiesDataSourceId = "compound-activities-data-source";

    const makeRelationResults = (resultsById: Record<string, any>) => Object.entries(resultsById).map(([id, page]) => ({...page, id}));

    const notionMock = {
        databases: {
            retrieve: jest.fn(
                ({database_id}: {database_id: string}) => {
                    if (database_id === config.objectDbId) {
                        return Promise.resolve({
                            data_sources: [{id: objectDataSourceId}]
                        });
                    }

                    if (database_id === config.compoundActivitiesDbId) {
                        return Promise.resolve({
                            data_sources: [{id: compoundActivitiesDataSourceId}]
                        });
                    }

                    return Promise.resolve(databaseResult);
                }
            )
        },
        dataSources: {
            query: jest.fn(
                ({data_source_id}: {data_source_id: string}) => {
                    if (data_source_id === objectDataSourceId) {
                        return Promise.resolve({results: makeRelationResults(objectResultsById)});
                    }

                    if (data_source_id === compoundActivitiesDataSourceId) {
                        return Promise.resolve({results: makeRelationResults(compoundActivitiesResultsById)});
                    }

                    return Promise.resolve({results: queryResult});
                }
            )
        }
    };

    const service = createNotionService(notionMock as any, config);

    return { service, notionMock };
}
