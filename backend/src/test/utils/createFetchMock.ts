type FetchMockOptions = {
    json?: any;
    ok?: boolean;
    status?: number;
};

export const createFetchResponse = ({
    json = {},
    ok = true,
    status = 200
}: FetchMockOptions = {}) => {
    return {
        ok,
        status,
        json: async () => json
    };
}

export const createFetchMock = (options: FetchMockOptions = {}) =>
    jest.fn().mockResolvedValue(createFetchResponse(options));
