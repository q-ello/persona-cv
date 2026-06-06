//#region priorities
type NotionPriorityQuery = {
    properties?: {
        PriorityKey?: { type: string, plain_text: string },
        Completed?: { type: string, checkbox: boolean },
        Object: {
            relation?: [{ id?: string; }?]
        }
    }
}

type NotionPriorityQueryData = {
    priorityKey?: string;
    completed?: boolean;
    objectId?: string;
}

export const createNotionPriorityQuery = (data?: NotionPriorityQueryData): NotionPriorityQuery => ({
    properties: {
        PriorityKey: { type: "text", plain_text: data?.priorityKey ?? "Priority Key" },
        Completed: { type: "checkbox", checkbox: data?.completed ?? false },
        Object: {
            relation: [{ id: data?.objectId ?? "page-1" }]
        },
    }
});
//#endregion


//#region object
type NotionObjectPage = {
    properties?: {
        Name?: {
            type?: string,
            title: Array<{ type: string, plain_text: string }>
        },
        LocalizationKey?: {
            type?: string,
            rich_text: Array<{ type: string, plain_text: string }>
        },
        URL?: {
            type: string,
            url: string
        }
    }
}

type NotionObjectPageData = {
    objectName?: string;
    localizationKey?: string;
    url?: string;
}

export const createNotionObjectPage = (data?: NotionObjectPageData): NotionObjectPage => ({
    properties: {
        Name: {
            type: "title",
            title: [{ type: "text", plain_text: data?.objectName ?? "Object Name" }]
        },
        LocalizationKey: {
            type: "rich_text",
            rich_text: [{ type: "text", plain_text: data?.localizationKey ?? "object.localization.key" }]
        },
        URL: {
            type: "url",
            url: data?.url ?? "http://example.com"
        }
    }
});

//#endregion

//#region localization

type NotionLocalizationQuery = {
    properties?: {
        Key?: { type: string, title: Array<{ type: string, plain_text: string }> },
        en?: { type: string, rich_text: Array<{ type: string, plain_text: string }> },
        ru?: { type: string, rich_text: Array<{ type: string, plain_text: string }> }
    }
}

type NotionLocalizationQueryData = {
    keyName?: string;
    enLocalization?: string;
    ruLocalization?: string;
}

export const createNotionLocalizationQuery = (data?: NotionLocalizationQueryData): NotionLocalizationQuery => ({
    properties: {
        Key: { type: "title", title: [{ type: "text", plain_text: data?.keyName ?? "Localization Key" }] },
        en: { type: "rich_text", rich_text: [{ type: "text", plain_text: data?.enLocalization ?? "Eng Localization" }] },
        ru: { type: "rich_text", rich_text: [{ type: "text", plain_text: data?.ruLocalization ?? "Ru Localization" }] },
    }
})

//#endregion
