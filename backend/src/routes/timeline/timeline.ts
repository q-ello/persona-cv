import express from 'express';
import { IPriority } from '@cv/shared';
import { createNotionService } from '../../services/externalApi/notion/notion.service';
import { getLocale } from '../../utils';
import { createEventSerivce } from '../../services/dataConstructors/event/event.service';
import { createLocalizationService } from '../../services/helpers/localization/localization.service';


export const createTimelineRouter = (
    notionService: ReturnType<typeof createNotionService>,
    eventService: ReturnType<typeof createEventSerivce>,
    localizationService: ReturnType<typeof createLocalizationService>
) => {
    const router = express.Router();

    router.get('/priorities', async (req, res) => {
        console.log("starting GET priorities handling")

        try {
            //todo: move that to priorities service
            const rawPriorities = await notionService.getNotionPriorities();
            const locale = getLocale(req);
            const localizedPriorities: IPriority[] = await Promise.all(rawPriorities.map(async rawPriority => {
                let objectName;
                if (rawPriority.objectLocalizationKey)
                {
                    objectName = await localizationService.asyncLocalize(`object.${rawPriority.objectLocalizationKey}`, locale);
                }
                else
                {
                    objectName = rawPriority.object.objectName;
                }
                return {
                priorityKey: rawPriority.priorityKey,
                object: {
                    objectName: objectName,
                    url: rawPriority.object.url,
                },
                checked: rawPriority.checked
            }}));
            
            console.log(`Returned priorities: ${localizedPriorities.length} items`)

            res.json(localizedPriorities);
        } catch (error) {
            console.error("Error fetching priorities from Notion:", error);
            res.status(500).json({ error: "Failed to fetch priorities from Notion" });
        }
    });

    router.get('/events', async (req, res) => {
        console.log("Starting to handle GET events request...");
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

            const events = eventService.getEvents(getLocale(req), monthNum, yearNum);

            console.log(`Returning events: ${events.length} items`)
            res.json(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ error: "Failed to fetch events" });
        }

    });

    router.get('/health', async (req, res) => {
        console.log("Starting to handle GET health request");
        try {
            await notionService.getNotionPriorities();
            console.log("Everything's ok");
            res.json({ status: "ok" });
        } catch {
            res.status(500).json({ status: "fail" });
        }
    });

    return router;
}