type TextProperty = {type: "text", plain_text: string};
type CheckboxProperty = {type: "checkbox", checkbox: boolean};
type RelationProperty = {relation?: [{id?: string}]};
type DateProperty = {type: "date", date: {start: string}};
type TitleProperty = {type?: "title", title: Array<TextProperty>};
type SelectProperty = {type: "select", select: {name: string}};
type RichTextProperty = {type: "rich_text", rich_text: Array<TextProperty>};
type UrlProperty = {type: "url", url: string};


//#region priorities
type NotionPriorityQuery = {
    properties?: {
        PriorityKey?: SelectProperty,
        Completed?: CheckboxProperty,
        Object: RelationProperty
    }
}

type NotionPriorityQueryData = {
    priorityKey?: string;
    completed?: boolean;
    objectId?: string;
}

export const createNotionPriorityQuery = (data?: NotionPriorityQueryData): NotionPriorityQuery => ({
    properties: {
        PriorityKey: { type: "select", select: {name: data?.priorityKey ?? "Priority Key" }},
        Completed: { type: "checkbox", checkbox: data?.completed ?? false },
        Object: {
            relation: [{ id: data?.objectId ?? "page-1" }]
        },
    }
});

//#endregion

//#region daily log

type NotionDailyLogQuery = {
    properties?: {
        CompoundActivities: RelationProperty,
        Object?: RelationProperty,
        DetailsValue?: RichTextProperty,
        DateLogged?: DateProperty,
        RelevantToProject?: CheckboxProperty,
    }
}

type NotionDailyLogQueryData = {
    compoundActivitiesId?: string;
    objectId?: string;
    detailsValue?: string;
    dateLogged?: Date;
    relevantToProject?: boolean;
}

export const createNotionDailyLogQuery = (data?: NotionDailyLogQueryData): NotionDailyLogQuery => ({
    properties: {
        CompoundActivities: {
            relation: [{id: data?.compoundActivitiesId ?? "page-1"}]
        },
        Object: {
            relation: [{id: data?.objectId ?? "page-2"}]
        },
        DetailsValue: {
            type: "rich_text",
            rich_text: [{
                type: "text",
                plain_text: data?.detailsValue ?? "Details Value"
            }]
        },
        DateLogged: {type: "date", date: {start: data?.dateLogged?.toString() ?? new Date().toString()}},
        RelevantToProject: {type: "checkbox", checkbox: data?.relevantToProject ?? false}
    }
})
//#endregion


//#region object
type NotionObjectPage = {
    properties?: {
        Name?: TitleProperty,
        LocalizationKey?: RichTextProperty,
        URL?: UrlProperty
    }
}

type NotionObjectPageData = {
    objectName?: string;
    objectLocalizationKey?: string;
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
            rich_text: [{ type: "text", plain_text: data?.objectLocalizationKey ?? "object.localization.key" }]
        },
        URL: {
            type: "url",
            url: data?.url ?? "http://example.com"
        }
    }
});

//#endregion

//#region compound activities

type NotionCompoundActivitiesPage = {
    properties?: {
        ActivityKey?: SelectProperty,
        DetailsKey?: RichTextProperty,
        Format?: SelectProperty 
    }
}

type NotionCompoundActivitiesPageData = {
    activityKey?: string;
    detailsKey?: string;
    format?: string;
}

export const createNotionCompoundActivitiesPage = (data?: NotionCompoundActivitiesPageData): NotionCompoundActivitiesPage => ({
    properties: {
        ActivityKey: {
            type: "select",
            select: {
                name: data?.activityKey ?? "Activity Key"
            }
        },
        DetailsKey: {
            type: "rich_text",
            rich_text: [{
                type: "text",
                plain_text: data?.detailsKey ?? "Details Key"
            }]
        },
        Format: {
            type: "select",
            select: {
                name: data?.format ?? "Format"
            }
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
