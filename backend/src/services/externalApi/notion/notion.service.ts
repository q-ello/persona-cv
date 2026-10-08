import { Client } from "@notionhq/client";
import { INotionConfig } from "../../../types/config.types";
import { DetailFormatType } from "../../helpers/detailFormatter/detailFormatter.service";
import { getGeneralString, IObject, IPriority, LANGUAGES } from "@cv/shared";
import { LocalizationCache, LocalizationEntry } from "../../helpers/localization/localization.service";

type IRawPriority = IPriority & { objectLocalizationKey: string };

type IRawDailyLogItem = {
    activityKey: string;
    object?: Object;
    objectLocalizationKey?: string;
    detailsKey: string;
    detailsValue?: string;
    format?: DetailFormatType;
    dateLogged: string;
    relevantToProject: boolean;
}

enum ERelationType {
    Object = "Object",
    CompoundActivities = "CompoundActivities"
}

export const maxPrioritiesNumber = 6;

export const createNotionService = (notion: Client, deps: INotionConfig) => {

    const dbIdsByRelation: Record<ERelationType, string> = {
        [ERelationType.Object]: deps.objectDbId,
        [ERelationType.CompoundActivities]: deps.compoundActivitiesDbId
    }

    const cachedRelations: Record<ERelationType, Record<string, any>> = {
        [ERelationType.Object]: {},
        [ERelationType.CompoundActivities]: {}
    };

    const relationLoadPromises: Partial<Record<ERelationType, Promise<void>>> = {};

    //#region relation

    const getRelationId = (properties: any, relationName: ERelationType): any | null => {
        const relationObject = properties[relationName];

        if (!("relation" in relationObject && Array.isArray(relationObject.relation) && relationObject.relation.length > 0)) {
            return null;
        }

        const relation = relationObject.relation;

        if (!("id" in relation[0])) {
            return null;
        }

        return relation[0].id;
    }

    const getRelationObjectById = async (relation: ERelationType, pageId: string) => {
        if (cachedRelations[relation][pageId]) {
            return cachedRelations[relation][pageId];
        }

        await ensureRelationCacheLoaded(relation);
        return cachedRelations[relation][pageId];
    }

    const getRelationObject = async (relation: ERelationType, properties: any) => {
        const pageId = getRelationId(properties, relation);
        if (!pageId) {
            return null;
        }

        return await getRelationObjectById(relation, pageId);
    }

    const loadRelationCache = async (relation: ERelationType): Promise<void> => {
        const databaseResponse: any = await notion.databases.retrieve({
            database_id: dbIdsByRelation[relation]
        })

        const response = await notion!.dataSources.query({
            data_source_id: databaseResponse.data_sources[0].id
        });

        response.results.forEach(page => {
            if (!("properties" in page)) {
                return
            }
            cachedRelations[relation][page.id] = page.properties;
        });

        console.log(`Cached ${Object.keys(cachedRelations[relation]).length} of "${relation}" objects`);
    }

    const ensureRelationCacheLoaded = async (relation: ERelationType): Promise<void> => {
        if (!relationLoadPromises[relation]) {
            relationLoadPromises[relation] = loadRelationCache(relation);
        }

        try {
            await relationLoadPromises[relation];
        } catch (error) {
            delete relationLoadPromises[relation];
            throw error;
        }
    }

    //#endregion


    const getPropertyValue = (property: any): string => {
        if (!property || typeof property !== "object" || !("type" in property)) {
            return "";
        }

        switch (property.type) {
            case "select":
                return property.select?.name || "";
            case "text":
                return property.plain_text || "";
            case "url":
                return property.url || "";
            case "checkbox":
                return property.checkbox ? "Yes" : "No";
            case "date":
                return property.date.start;
            case "title":
                return getPropertyValue(property.title[0]);
            case "rich_text":
                return getPropertyValue(property.rich_text[0]);
            default:
                return "";
        }
    }

    const getObjectData = async (properties: any): Promise<{ object: IObject, objectLocalizationKey: string } | null> => {
        const objectProperties = await getRelationObject(ERelationType.Object, properties);

        if (!objectProperties) {
            return null;
        }

        return {
            object: {
                objectName: getPropertyValue(objectProperties.Name),
                url: getPropertyValue(objectProperties.URL)
            },
            objectLocalizationKey: getPropertyValue(objectProperties.LocalizationKey)
        }
    }

    //#endregion

    const getPriorities = async (): Promise<IRawPriority[]> => {
        try {
            const databaseResponse: any = await notion.databases.retrieve({
                database_id: deps.prioritiesDbId
            })

            const response = await notion!.dataSources.query({
                data_source_id: databaseResponse.data_sources[0].id,
                sorts: [{
                    property: "Last edited time",
                    direction: "descending"
                }]
            });

            let priorities: IRawPriority[] = (await Promise.all(
                response.results.map(async (result): Promise<IRawPriority | null> => {

                    if (!("properties" in result)) {
                        return null;
                    }

                    const properties = result.properties;

                    const objectData = await getObjectData(properties);

                    if (!objectData) {
                        return null;
                    }

                    return {
                        priorityKey: getPropertyValue(properties.PriorityKey),
                        ...objectData,
                        checked: getPropertyValue(properties.Completed) === "Yes"
                    };
                }))).filter((obj): obj is IRawPriority => obj !== null);

            const uncheckedPriorities = priorities.filter(p => !p.checked);
            if (uncheckedPriorities.length >= maxPrioritiesNumber) {
                priorities = uncheckedPriorities.slice(0, maxPrioritiesNumber);
            }
            else if (uncheckedPriorities.length < maxPrioritiesNumber) {
                const checkedPriorities = priorities.filter(p => p.checked);
                const additionalCheckedPriorities = checkedPriorities.slice(0, Math.min(priorities.length, 7) - uncheckedPriorities.length);
                priorities = [...uncheckedPriorities, ...additionalCheckedPriorities];
            }

            return priorities;
        } catch (error) {
            console.error("Error fetching priorities from Notion:", error);
            throw new Error("Failed to fetch priorities from Notion");
        }
    };

    const getAllLocalizations = async (lastFetchedTime?: Date): Promise<LocalizationCache> => {
        try {
            const databaseResponse: any = await notion!.databases.retrieve({
                database_id: deps.localizationDbId
            })

            if (lastFetchedTime && lastFetchedTime > new Date(databaseResponse.last_edited_time)) {
                return new Map();
            }

            const response = await notion!.dataSources.query({
                data_source_id: databaseResponse.data_sources[0].id,
            });

            let localization: LocalizationCache = new Map();

            await Promise.all(
                response.results.map(async (result): Promise<void> => {

                    if (!("properties" in result)) {
                        return;
                    }

                    const properties = result.properties;

                    const keyProp = properties.Key;

                    const key = getPropertyValue(keyProp);

                    if (!key) {
                        return;
                    }

                    let record: Partial<LocalizationEntry> = {};

                    for (const lang of LANGUAGES) {
                        const langProp = properties[lang];
                        record[lang] = getPropertyValue(langProp);
                    }

                    localization.set(key, record as LocalizationEntry);
                }));

            return localization;
        } catch (error) {
            console.error("Error fetching localization from Notion:", error);
            throw new Error("Failed to fetch localization from Notion");
        }
    }

    const getDailyLogs = async (): Promise<IRawDailyLogItem[]> => {
        try {
            const databaseResponse: any = await notion!.databases.retrieve({
                database_id: deps.dailyLogDbId
            });

            const response = await notion!.dataSources.query({
                data_source_id: databaseResponse.data_sources[0].id,
            });

            let dailyLogs: IRawDailyLogItem[] = (await Promise.all(
                response.results.map(async (result): Promise<IRawDailyLogItem | null> => {
                    if (!("properties" in result)) {
                        return null;
                    }

                    const properties = result.properties;


                    const compoundActivitiesProperties = await getRelationObject(ERelationType.CompoundActivities, properties);
                    if (!compoundActivitiesProperties) {
                        return null;
                    }

                    const objectData = await getObjectData(properties);

                    return {
                        activityKey: getPropertyValue(compoundActivitiesProperties.ActivityKey),
                        ...objectData,
                        detailsKey: getPropertyValue(compoundActivitiesProperties.DetailsKey),
                        detailsValue: getPropertyValue(properties.DetailsValue),
                        format: getPropertyValue(compoundActivitiesProperties.Format) as DetailFormatType,
                        dateLogged: getGeneralString(new Date(getPropertyValue(properties.DateLogged))),
                        relevantToProject: getPropertyValue(properties.RelevantToProject) === "Yes"
                    }
                }))).filter(item => item !== null);

            console.log(`Got ${dailyLogs.length} notion daily logs`);
            return dailyLogs;

        } catch (error) {
            console.error("Error fetching daily logs from Notion:", error);
            throw new Error("Failed to fetch daily logs from Notion");
        }
    }

    return {
        getNotionPriorities: getPriorities,
        getAllLocalizations, getDailyLogs
    }

}

