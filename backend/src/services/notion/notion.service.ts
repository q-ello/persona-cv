import { Client } from "@notionhq/client";
import { IPriority } from '@cv/shared';
import { INotionConfig } from "../../types/config.types";

export const createNotionService = (notion: Client,  deps: INotionConfig) => {
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
            default:
                return "";
        }
    }

    const getNotionPriorities = async (): Promise<IPriority[]> => {
        try {
            const response = await notion!.dataSources.query({
                data_source_id: deps.prioritiesDatasourceId,
                filter: {
                    property: "Completed",
                    checkbox: { equals: false }
                }
            });

            let priorities: IPriority[] = (await Promise.all(
                response.results.map(async (result) => {

                    if (!("properties" in result)) {
                        return null;
                    }

                    const properties = result.properties;

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

                    if (!("title" in nameProp && Array.isArray(nameProp.title))) {
                        return null;
                    }

                    //#endregion

                    return {
                        nameEng: GetPropertyValue(properties.NameEn),
                        nameRu: GetPropertyValue(properties.NameRu),
                        object: GetPropertyValue(nameProp.title[0]),
                        url: GetPropertyValue(urlProp)
                    };
                }))).filter((obj): obj is IPriority => obj !== null);

            console.log(priorities)

            //rendering more than 7 priorities is painful so we should slice it
            if (priorities.length > 7)
            {
                priorities = priorities.slice(0, 7);
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

