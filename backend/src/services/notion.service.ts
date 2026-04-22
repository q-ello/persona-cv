import { Client } from "@notionhq/client";
import { IObjective } from '@shared/types/notion';
import { config } from "../config";

export const initNotionClient = () => {
    notion = new Client({ auth: config.notion.secret });
}

let notion : Client;

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

export const getNotionObjectives = async (): Promise<IObjective[]> => {
    try {
        const response = await notion.dataSources.query({
            data_source_id: config.notion.objectivesDatasourceId,
            filter: {
                property: "Completed",
                checkbox: { equals: false }
            }
        });

        const objectives: IObjective[] = (await Promise.all(
            response.results.map(async (result) => {

                if (!("properties" in result)) {
                    return null;
                }

                const properties = result.properties;

                const object = properties.Object;

                if (!("relation" in object && Array.isArray(object.relation))) {
                    return null;
                }

                const relation = object.relation;

                if (!("id" in relation[0])) {
                    return null;
                }

                const pageId = relation[0].id;

                //#endregion

                //#region RelationPagePropertiesValidation

                const pageResponse = await notion.pages.retrieve({
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
            }))).filter((obj): obj is IObjective => obj !== null);

        return objectives;
    } catch (error) {
        console.error("Error fetching objectives from Notion:", error);
        throw new Error("Failed to fetch objectives from Notion");
    }
};
