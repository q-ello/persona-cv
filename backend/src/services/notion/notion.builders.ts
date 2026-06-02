type NotionPriorityQuery = {
    properties?: {
        PriorityKey?: { type: string, plain_text: string },
        Completed?: { type: string, checkbox: boolean },
        Object: {
            relation?: [{ id?: string; }?]
        }
    }
}

export const createNotionPriorityQuery = (overrides: NotionPriorityQuery = {}): NotionPriorityQuery => ({
    ...overrides
});

type NotionPriorityPage = {
    properties?: {
        Name?: {
            title: Array<{ type: string, plain_text: string }>
        },
        LocalizationKey?: {
            rich_text: Array<{ type: string, plain_text: string }>
        },
        URL?: {
            type: string,
            url: string
        }
    }
}

export const createNotionPriorityPage = (overrides: NotionPriorityPage = {}): NotionPriorityPage => ({
    ...overrides
});
