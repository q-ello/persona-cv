export const createMockServices = (overrides: Partial<any> = {}) => {
    const services = {
        notionService: {
            getNotionObjectives: jest.fn().mockResolvedValue([])
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