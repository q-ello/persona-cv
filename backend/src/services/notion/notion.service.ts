import { Client } from "@notionhq/client";
import { IPriority } from '@cv/shared';
import { INotionConfig } from "../../types/config.types";

export const createNotionService = (notion: Client, deps: INotionConfig) => {
    const GetPropertyValue = (property: any): string => {
        if (!("type" in property)) {
            return "";
        }

        switch (property.type) {
            case "select":
                return property.select?.name || null;
            case "text":
                return property.plain_text || null;
            case "url":
                return property.url || null;
            case "checkbox":
                return property.checkbox ? "Yes" : "No";
            default:
                return "";
        }
    }

    const getNotionPriorities = async (): Promise<IPriority[]> => {
        try {
            const response = await notion!.dataSources.query({
                data_source_id: deps.prioritiesDatasourceId,
                sorts: [{
                    property: "Last edited time",
                    direction: "descending"
                }]
            });

            let priorities: IPriority[] = (await Promise.all(
                response.results.map(async (result): Promise<IPriority | null> => {

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

                    if (!("title" in nameProp && Array.isArray(nameProp.title))) {
                        return null;
                    }

                    if (!("rich_text" in localizationKeyProp && Array.isArray(localizationKeyProp.rich_text))) {
                        return null;
                    }

                    console.log(properties.Completed);

                    //#endregion

                    return {
                        priorityKey: GetPropertyValue(properties.PriorityKey),
                        objectName: GetPropertyValue(nameProp.title[0]),
                        objectLocalizationKey: localizationKeyProp.rich_text.length > 0 ? GetPropertyValue(localizationKeyProp.rich_text[0]) : null,
                        url: GetPropertyValue(urlProp),
                        checked: GetPropertyValue(properties.Completed) === "Yes"
                    };
                }))).filter((obj): obj is IPriority => obj !== null);

            const uncheckedPriorities = priorities.filter(p => !p.checked);
            if (uncheckedPriorities.length > 7) {
                priorities = priorities.slice(0, 7);
            }
            else if (uncheckedPriorities.length < 7) {
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

    return {
        getNotionPriorities: getNotionPriorities
    }

}

