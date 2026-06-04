export const createMockServices = (overrides: Partial<any> = {}) => {
    const services = {
        notionService: {
            getNotionPriorities: jest.fn().mockResolvedValue([]),
            getAllLocalizations: jest.fn().mockResolvedValue(new Map())
        },
        localizationService: {
            init: jest.fn(),
            asyncLocalize: jest.fn(async (key: string, _locale?: string) => key),
            reload: jest.fn().mockResolvedValue(undefined)
        },
        googleCalendarService: {
            getGoogleCalendarEvents: jest.fn().mockResolvedValue([])
        },
        nagerService: {
            getHolidaysEvents: jest.fn().mockResolvedValue([])
        }
    };

    return {...services, ...overrides};
}
