import express from 'express';
import { getNotionObjectives } from '../services/notion.service';
import { getGoogleCalendarEvents } from '../services/googleCalendar.service';
import { getHolidaysEvents } from '../services/nager.service';
import { IEvent } from '@shared/types/event';

const router = express.Router();

router.get('/objectives', async (req, res) => {
    try {
        const response = await getNotionObjectives();
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
        if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: "Invalid month or year format" });
        }

        const [googleEvents, nagerEvents] = await Promise.all([
            getGoogleCalendarEvents(yearNum, monthNum),
            getHolidaysEvents(yearNum, monthNum)
        ]);


        const eventsRecord : Record<string, IEvent[]> = {}

        const addToMap = (key: string, event: IEvent) => {
            if (eventsRecord[key]) eventsRecord[key].push(event);
            else eventsRecord[key] = [event];
        }

        googleEvents.forEach(({ date, event }) => addToMap(date, event));
        nagerEvents.forEach(({ date, event }) => addToMap(date, event));

        res.json(eventsRecord);

    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

export default router;