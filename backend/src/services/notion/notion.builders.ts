type NotionPriorityQuery = {
    properties?: {
        NameEn: { type: string, plain_text: string },
        NameRu: { type: string, plain_text: string },
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
        Name: {
            title: [{ type: string, plain_text: string }]
        },
        URL: {
            type: string,
            url: string
        }
    }
}

export const createNotionPriorityPage = (overrides: NotionPriorityPage = {}): NotionPriorityPage => ({
    ...overrides
});
