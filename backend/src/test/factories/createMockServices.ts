import { LocalizationParams } from "../../services/helpers/localization/localization.service";

export const createMockServices = (overrides: Partial<any> = {}) => {
    const services = {
        notionService: {
            getNotionPriorities: jest.fn().mockResolvedValue([]),
            getAllLocalizations: jest.fn().mockResolvedValue(new Map()),
            getDailyLogs: jest.fn().mockResolvedValue([])
        },
        localizationService: {
            init: jest.fn(),
            asyncLocalize: jest.fn(async (key: string, _locale?: string, params?: LocalizationParams) => key),
            reload: jest.fn().mockResolvedValue(undefined)
        },
        googleCalendarService: {
            getGoogleCalendarEvents: jest.fn().mockResolvedValue([])
        },
        nagerService: {
            getHolidaysEvents: jest.fn().mockResolvedValue([])
        },
        eventService: {
            init: jest.fn().mockResolvedValue(undefined),
            getEvents: jest.fn().mockResolvedValue({})
        }
    };

    return {...services, ...overrides};
}
