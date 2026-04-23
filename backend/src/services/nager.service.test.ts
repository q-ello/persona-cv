import { createNagerService } from "./nager.service";

describe('getHolidaysEvents', () => {
    it('filters holidays by month', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' },
                { date: '2024-03-08', name: 'International Women\'s Day', localName: 'Международный женский день' }
            ]
        });

        const service = createNagerService(jest.fn());

        const result = await service.getHolidaysEvents(2024, 1); // February

        expect(result.length).toBe(1);
        expect(result[0].event.eventEng).toBe('Valentine\'s Day');
        expect(result[0].event.eventRu).toBe('День святого Валентина');
    });

    it('returns empty array if no holidays in the month', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => [
                { date: '2024-01-01', name: 'New Year', localName: 'Новый год' },
                { date: '2024-02-14', name: 'Valentine\'s Day', localName: 'День святого Валентина' }
            ]
        });

        const service = createNagerService(jest.fn());

        const result = await service.getHolidaysEvents(2024, 2); // March

        expect(result.length).toBe(0);
    });
});