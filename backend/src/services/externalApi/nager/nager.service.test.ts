import { createNagerTestService } from "./nager.service.factory";

describe('getHolidaysEvents', () => {
    it('filters holidays by month', async () => {
        const {service} = createNagerTestService({json: [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' },
                { date: '2024-03-08', name: 'International Women\'s Day', localName: 'Международный женский день' }
            ]}
        );

        const result = await service.getHolidaysEvents(new Date(2024, 1), new Date(2024, 2)); // February

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

        const result = await service.getHolidaysEvents(new Date(2024, 2), new Date(2024, 3)); // March

        expect(result.length).toBe(0);
    });

    it('uses the date string directly as the map key (no UTC shift)', async () => {
        // Preserve the API's date string without converting it through UTC.
        const {service} = createNagerTestService({json: [{ date: '2026-05-01', name: 'Labour Day', localName: 'Праздник труда' }]});
        const result = await service.getHolidaysEvents(new Date(2026, 4), new Date(2026, 5)); // May (0-based)

        expect(result.length).toBe(1);
        expect(result[0].date).toBe('2026-05-01');
    });

    it("caches holidays by year", async () => {
        const {service, fetchMock} = createNagerTestService({json: [{ date: '2024-01-01', name: 'New Year' }]});

        await service.getHolidaysEvents(new Date(2024, 1), new Date(2024, 2));
        await service.getHolidaysEvents(new Date(2024, 2), new Date(2024, 3));

        expect(fetchMock).toHaveBeenCalledTimes(1); 
    });

    it('rejects HTTP failures with the requested year and status', async () => {
        const { service } = createNagerTestService({ ok: false, status: 429, json: {} });

        await expect(service.getHolidaysEvents(new Date(2024, 0), new Date(2024, 1)))
            .rejects.toThrow('Nager request failed for 2024: HTTP 429');
    });

    it.each([{ json: {} }, { json: [null] }, { json: [{ date: '2024-01-01' }] }])('rejects malformed response %j', async ({ json }) => {
        const { service } = createNagerTestService({ json });

        await expect(service.getHolidaysEvents(new Date(2024, 0), new Date(2024, 1)))
            .rejects.toThrow('Invalid Nager response for 2024');
    });

    it('retries a year after a failed request', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [] });
        fetchMock.mockRejectedValueOnce(new Error('Unavailable'));

        await expect(service.getHolidaysEvents(new Date(2024, 0), new Date(2024, 1)))
            .rejects.toThrow('Unavailable');
        await expect(service.getHolidaysEvents(new Date(2024, 0), new Date(2024, 1)))
            .resolves.toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
