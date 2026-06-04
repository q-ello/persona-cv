import { Client } from "@notionhq/client";
import { IPriority, LANGUAGES } from '@cv/shared';
import { INotionConfig } from "../../types/config.types";
import { LocalizationCache, LocalizationEntry } from "../localization/localization.service";

type IRawPriority = IPriority & {localizationKey : string};

export const maxPrioritiesNumber = 6;

export const createNotionService = (notion: Client, deps: INotionConfig) => {

    const GetPropertyValue = (property: any): string => {
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
            case "title":
                return GetPropertyValue(property.title[0]);
            case "rich_text":
                return GetPropertyValue(property.rich_text[0])
            default:
                return "";
        }
    }

    const getNotionPriorities = async (): Promise<IRawPriority[]> => {
        try {
            const response = await notion!.dataSources.query({
                data_source_id: deps.prioritiesDatasourceId,
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

                    //object
                    const object = properties.Object;

                    if (!("relation" in object && Array.isArray(object.relation) && object.relation.length > 0)) {
                        return null;
                    }

                    const relation = object.relation;

                    if (!("id" in relation[0])) {
                        return null;
                    }

                    const pageId = relation[0].id;

                    //#endregion

                    //#region RelationPagePropertiesValidation

                    const pageResponse = await notion!.pages.retrieve({
                        page_id: pageId
                    });

                    if (!("properties" in pageResponse)) {
                        return null;
                    }

                    const objectProperties = pageResponse.properties;
                    const nameProp = objectProperties.Name;
                    const urlProp = objectProperties.URL;
                    const localizationKeyProp = objectProperties.LocalizationKey;

                    if (!nameProp || !("title" in nameProp && Array.isArray(nameProp.title))) {
                        return null;
                    }

                    if (!localizationKeyProp || !("rich_text" in localizationKeyProp && Array.isArray(localizationKeyProp.rich_text))) {
                        return null;
                    }

                    //#endregion

                    return {
                        priorityKey: GetPropertyValue(properties.PriorityKey),
                        objectName: GetPropertyValue(nameProp),
                        localizationKey: GetPropertyValue(localizationKeyProp),
                        url: GetPropertyValue(urlProp),
                        checked: GetPropertyValue(properties.Completed) === "Yes"
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

    const getAllLocalizations = async (): Promise<LocalizationCache> => {
        try {
            const response = await notion!.dataSources.query({
                data_source_id: deps.localizationDatasourceId,
            });

            let localization: LocalizationCache = new Map();

            await Promise.all(
                response.results.map(async (result): Promise<void> => {

                    if (!("properties" in result)) {
                        return;
                    }

                    const properties = result.properties;

                    const keyProp = properties.Key;

                    const key = GetPropertyValue(keyProp);

                    let record: Partial<LocalizationEntry> = {};

                    for (const lang of LANGUAGES)
                    {
                        const langProp = properties[lang];
                        record[lang] = GetPropertyValue(langProp);
                    }

                    localization.set(key, record as LocalizationEntry);
                }));

            return localization;
        } catch (error) {
            console.error("Error fetching localization from Notion:", error);
            throw new Error("Failed to fetch localization from Notion");
        }
    }

    return {
        getNotionPriorities,
        getAllLocalizations
    }

}

