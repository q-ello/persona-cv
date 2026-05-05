import { createNagerService } from "./nager.service";

describe('getHolidaysEvents', () => {
    it('filters holidays by month', async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            json: async () => [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' },
                { date: '2024-03-08', name: 'International Women\'s Day', localName: 'Международный женский день' }
            ]
        });

        const service = createNagerService(fetchMock);

        const result = await service.getHolidaysEvents(2024, 1); // February

        expect(result.length).toBe(1);
        expect(result[0].event.eventEng).toBe('Valentine\'s Day');
        expect(result[0].event.eventRu).toBe('День святого Валентина');
    });

    it('returns empty array if no holidays in the month', async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            json: async () => [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' }
            ]
        });

        const service = createNagerService(fetchMock);

        const result = await service.getHolidaysEvents(2024, 2); // March

        expect(result.length).toBe(0);
    });

    it('uses the date string directly as the map key (no UTC shift)', async () => {
        // This test guards against the timezone bug: new Date("2026-05-01") is UTC midnight,
        // which in UTC+3 is April 30 locally. The key must remain "2026-05-01".
        const fetchMock = jest.fn().mockResolvedValue({
            json: async () => [
                { date: '2026-05-01', name: 'Labour Day', localName: 'Праздник труда' }
            ]
        });

        const service = createNagerService(fetchMock);
        const result = await service.getHolidaysEvents(2026, 4); // May (0-based)

        expect(result.length).toBe(1);
        expect(result[0].date).toBe('2026-05-01');
    });

    it("caches holidays by year", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            json: async () => [{ date: '2024-01-01', name: 'New Year' }]
        });

        const service = createNagerService(fetchMock);

        await service.getHolidaysEvents(2024, 0);
        await service.getHolidaysEvents(2024, 1);

        expect(fetchMock).toHaveBeenCalledTimes(1); 
    });
});