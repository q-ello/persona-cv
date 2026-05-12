type FetchMockOptions = {
    json?: any;
    ok?: boolean;
    status?: number;
};

export const createFetchMock = ({
    json = {},
    ok = true,
    status = 200
}: FetchMockOptions = {}) => {
    return jest.fn().mockResolvedValue({
        ok,
        status,
        json: async () => json
    });
}