import { createNagerTestService } from "./nager.service.factory";

describe('getHolidaysEvents', () => {
    it('filters holidays by month', async () => {
        const {service} = createNagerTestService({json: [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' },
                { date: '2024-03-08', name: 'International Women\'s Day', localName: 'Международный женский день' }
            ]}
        );

        const result = await service.getHolidaysEvents(new Date(2024, 2), new Date(2024, 3)); // February

        expect(result.length).toBe(1);
        expect(result[0].eventEng).toBe('Valentine\'s Day');
        expect(result[0].eventRu).toBe('День святого Валентина');
    });

    it('returns empty array if no holidays in the month', async () => {
        const {service} = createNagerTestService({json: [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' }
            ]}
        );

        const result = await service.getHolidaysEvents(new Date(2024, 3), new Date(2024, 4)); // March

        expect(result.length).toBe(0);
    });

    it('uses the date string directly as the map key (no UTC shift)', async () => {
        // This test guards against the timezone bug: new Date("2026-05-01") is UTC midnight,
        // which in UTC+3 is April 30 locally. The key must remain "2026-05-01".
        const {service} = createNagerTestService({json: [{ date: '2026-05-01', name: 'Labour Day', localName: 'Праздник труда' }]});
        const result = await service.getHolidaysEvents(new Date(2026, 5), new Date(2026, 6)); // May (0-based)

        expect(result.length).toBe(1);
        expect(result[0].date).toBe('2026-05-01');
    });

    it("caches holidays by year", async () => {
        const {service, fetchMock} = createNagerTestService({json: [{ date: '2024-01-01', name: 'New Year' }]});

        await service.getHolidaysEvents(new Date(2024, 1), new Date(2024, 2));
        await service.getHolidaysEvents(new Date(2024, 2), new Date(2024, 3));

        expect(fetchMock).toHaveBeenCalledTimes(1); 
    });
});