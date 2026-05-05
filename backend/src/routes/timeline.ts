import express from 'express';
import { IEvent } from '@cv/shared';
import { createNotionService } from '../services/notion.service';
import { createGoogleCalendarService } from '../services/googleCalendar.service';
import { createNagerService } from '../services/nager.service';
import { mergeEvents } from '../utils';


export const createTimelineRouter = (notionService: ReturnType<typeof createNotionService>,
    googleCalendarService: ReturnType<typeof createGoogleCalendarService>,
    nagerService: ReturnType<typeof createNagerService>
) => {
    const router = express.Router();

    router.get('/objectives', async (req, res) => {
        try {
            const response = await notionService.getNotionObjectives();
            res.json(response);
        } catch (error) {
            console.error("Error fetching objectives from Notion:", error);
            res.status(500).json({ error: "Failed to fetch objectives from Notion" });
        }
    });

    router.get('/events', async (req, res) => {
        try {
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({ error: "Month and year query parameters are required" });
            }

            const monthNum = parseInt(month as string);
            const yearNum = parseInt(year as string);
            if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 0 || monthNum > 11) {
                return res.status(400).json({ error: "Invalid month or year format" });
            }

            const [googleEvents, nagerEvents] = await Promise.all([
                googleCalendarService.getGoogleCalendarEvents(yearNum, monthNum),
                nagerService.getHolidaysEvents(yearNum, monthNum)
            ]);

            const eventsRecord: Record<string, IEvent[]> = mergeEvents(googleEvents, nagerEvents);

            res.json(eventsRecord);

        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ error: "Failed to fetch events" });
        }

    });

    router.get('/health', async (req, res) => {
        try {
            await notionService.getNotionObjectives();
            res.json({ status: "ok" });
        } catch {
            res.status(500).json({ status: "fail" });
        }
    });

    return router;
}