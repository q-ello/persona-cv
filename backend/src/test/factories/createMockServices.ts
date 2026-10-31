import { LocalizationParams } from "../../services/helpers/localization/localization.service";
import { IObject, Language } from "@cv/shared";

export const createMockServices = (overrides: Partial<any> = {}) => {
    const services = {
        notionService: {
            getNotionPriorities: jest.fn().mockResolvedValue([]),
            getAllLocalizations: jest.fn().mockResolvedValue(new Map()),
            getLogs: jest.fn().mockResolvedValue([]),
            commitPendingCache: jest.fn().mockResolvedValue(undefined)
        },
        localizationService: {
            init: jest.fn(),
            asyncLocalize: jest.fn(async (key: string, _locale?: string, params?: LocalizationParams) => key),
            reload: jest.fn().mockResolvedValue(undefined),
            localizeObject: jest.fn(async (object: IObject, _locale: Language, _key?: string) => object)
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
        },
        logService: {
            init: jest.fn().mockResolvedValue(undefined),
            getLogs: jest.fn().mockResolvedValue({})
        }
    };

    return {...services, ...overrides};
}
