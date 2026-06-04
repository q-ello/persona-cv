import express from 'express';
import { IEvent, IPriority, Language } from '@cv/shared';
import { createNotionService } from '../services/notion/notion.service';
import { createGoogleCalendarService } from '../services/googleCalendar/googleCalendar.service';
import { createNagerService } from '../services/nager/nager.service';
import { getLocale, mergeEvents as mergeAndLocalizeEvents } from '../utils';
import { createLocalizationService } from '../services/localization/localization.service';


export const createTimelineRouter = (
    notionService: ReturnType<typeof createNotionService>,
    googleCalendarService: ReturnType<typeof createGoogleCalendarService>,
    nagerService: ReturnType<typeof createNagerService>,
    localizationService: ReturnType<typeof createLocalizationService>
) => {
    const router = express.Router();

    router.get('/priorities', async (req, res) => {
        try {
            const rawPriorities = await notionService.getNotionPriorities();
            const locale = getLocale(req);
            const localizedPriorities: IPriority[] = await Promise.all(rawPriorities.map(async rawPriority => {
                let objectName;
                if (rawPriority.localizationKey)
                {
                    objectName = await localizationService.asyncLocalize(`object.${rawPriority.localizationKey}`, locale);
                }
                else
                {
                    objectName = rawPriority.objectName;
                }
                return {
                priorityKey: rawPriority.priorityKey,
                objectName: objectName,
                url: rawPriority.url,
                checked: rawPriority.checked
            }}));
            
            res.json(localizedPriorities);
        } catch (error) {
            console.error("Error fetching priorities from Notion:", error);
            res.status(500).json({ error: "Failed to fetch priorities from Notion" });
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

            const eventsRecord: Record<string, IEvent[]> = mergeAndLocalizeEvents(getLocale(req), googleEvents, nagerEvents);

            res.json(eventsRecord);

        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ error: "Failed to fetch events" });
        }

    });

    router.get('/health', async (req, res) => {
        try {
            await notionService.getNotionPriorities();
            res.json({ status: "ok" });
        } catch {
            res.status(500).json({ status: "fail" });
        }
    });

    return router;
}