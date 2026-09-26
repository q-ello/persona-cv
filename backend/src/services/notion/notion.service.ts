import { Client } from "@notionhq/client";
import { INotionConfig } from "../../types/config.types";
import { LocalizationCache, LocalizationEntry } from "../localization/localization.service";
import { DetailFormatType } from "../detailFormatter/detailFormatter.service";
import { getGeneralString, IObject, IPriority, LANGUAGES } from "@cv/shared";

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

export const maxPrioritiesNumber = 6;

export const createNotionService = (notion: Client, deps: INotionConfig) => {

    //#region helpers

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

    const getRelationProperties = async (properties: any, relationName: string): Promise<any | null> => {
        const relationObject = properties[relationName];

        if (!("relation" in relationObject && Array.isArray(relationObject.relation) && relationObject.relation.length > 0)) {
            return null;
        }

        const relation = relationObject.relation;

        if (!("id" in relation[0])) {
            return null;
        }
        
        const pageId = relation[0].id;

        const pageResponse = await notion!.pages.retrieve({
            page_id: pageId
        });

        if (!("properties" in pageResponse)) {
            return null;
        }

        return pageResponse.properties;
    }

    const getPropertiesData = (properties: any, neededProperties: string[]): Record<string, string> => {
        const result: Record<string, string> = {};

        neededProperties.forEach(property => {
            result[property] = getPropertyValue(properties[property]);
        })

        return result;
    }

    const getObjectData = async (properties: any): Promise<{object: IObject, objectLocalizationKey: string} | null> => {
        const objectProperties = await getRelationProperties(properties, "Object");
        if (!objectProperties) {
            return null;
        }

        const data = getPropertiesData(objectProperties, ["Name", "URL", "LocalizationKey"]);

        return {
            object: {
                objectName: data["Name"],
                url: data["URL"]
            },
            objectLocalizationKey: data["LocalizationKey"]
        }
    }

    //#endregion

    const getPriorities = async (): Promise<IRawPriority[]> => {
        try {
            const databaseResponse: any = await notion.databases.retrieve({
                database_id: deps.prioritiesDatabaseId
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
                database_id: deps.localizationDatabaseId
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

                    if (!key)
                    {
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
                database_id: deps.dailyLogDatabaseId
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


                    const compoundActivitiesProperties = await getRelationProperties(properties, "CompoundActivities");
                    if (!compoundActivitiesProperties) {
                        return null;
                    }
                    const compoundActivitiesData = getPropertiesData(compoundActivitiesProperties, ["ActivityKey", "DetailsKey", "Format"]);
                    
                    const objectData = await getObjectData(properties);

                    return {
                        activityKey: compoundActivitiesData["ActivityKey"], 
                        ...objectData,
                        detailsKey: compoundActivitiesData["DetailsKey"], 
                        detailsValue: getPropertyValue(properties.DetailsValue),
                        format: compoundActivitiesData["Format"] as DetailFormatType,
                        dateLogged: getGeneralString(new Date(getPropertyValue(properties.DateLogged))),
                        relevantToProject: getPropertyValue(properties.RelevantToProject) === "Yes"
                    }
                }))).filter(item => item !== null);
                return dailyLogs;

        } catch (error) {
            console.error("Error fetching localization from Notion:", error);
            throw new Error("Failed to fetch localization from Notion");
        }
    }

    return {
        getNotionPriorities: getPriorities,
        getAllLocalizations, getDailyLogs
    }

}

