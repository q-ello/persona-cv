type NotionObjectiveQuery = {
    properties?: {
        NameEn: { type: string, plain_text: string },
        NameRu: { type: string, plain_text: string },
        Object: {
            relation?: [{ id?: string; }?]
        }
    }
}

export const createNotionObjectiveQuery = (overrides: NotionObjectiveQuery = {}): NotionObjectiveQuery => ({
    ...overrides
});

type NotionObjectivePage = {
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

export const createNotionObjectivePage = (overrides: NotionObjectivePage = {}): NotionObjectivePage => ({
    ...overrides
});
