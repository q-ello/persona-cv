import express from 'express';
import { IPriority } from '@cv/shared';
import { createNotionService } from '../../services/externalApi/notion/notion.service';
import { deepLog, getLocale, LogType } from '../../utils';
import { createEventService } from '../../services/dataConstructors/event/event.service';
import { createLocalizationService } from '../../services/helpers/localization/localization.service';
import { createDailyLogsService } from '../../services/dataConstructors/dailyLogs/dailyLogs.service';

const log = (log: string, type: LogType = "info") => {
    deepLog('timeline', log, type);
}

export const createTimelineRouter = (
    notionService: ReturnType<typeof createNotionService>,
    eventService: ReturnType<typeof createEventService>,
    localizationService: ReturnType<typeof createLocalizationService>,
    logService: ReturnType<typeof createDailyLogsService>
) => {
    const router = express.Router();

    router.get('/priorities', async (req, res) => {
        log("starting GET priorities handling")

        try {
            //todo: move that to priorities service
            const rawPriorities = await notionService.getNotionPriorities();
            const locale = getLocale(req);
            const localizedPriorities: IPriority[] = await Promise.all(rawPriorities.map(async rawPriority => {
                let objectName;
                if (rawPriority.objectLocalizationKey) {
                    objectName = await localizationService.asyncLocalize(`object.${rawPriority.objectLocalizationKey}`, locale);
                }
                else {
                    objectName = rawPriority.object.objectName;
                }
                return {
                    priorityKey: rawPriority.priorityKey,
                    object: {
                        objectName: objectName,
                        url: rawPriority.object.url,
                    },
                    checked: rawPriority.checked
                }
            }));

            log(`Returned priorities: ${localizedPriorities.length} items`)

            res.json(localizedPriorities);
        } catch (error) {
            log("Error fetching priorities from Notion:" + error, "error");
            res.status(500).json({ error: "Failed to fetch priorities from Notion" });
        }
    });

    router.get('/events', async (req, res) => {
        log("Starting to handle GET events request...");
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

            const events = await eventService.getEvents(getLocale(req), monthNum, yearNum);

            const eventCount = Object.values(events).reduce((count, dailyEvents) => count + dailyEvents.length, 0);
            log(`Returning events: ${eventCount} items`)
            res.json(events);
        } catch (error) {
            log("Error fetching events:"+ error, "error");
            res.status(500).json({ error: "Failed to fetch events" });
        }

    });

    router.get('/logs', async (req, res) => {
        log("Starting to handle GET logs request...");
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

            const logs = await logService.getLogs(getLocale(req), monthNum, yearNum);

            const logsCount = Object.values(logs).reduce((count, dailyLogs) => count + dailyLogs.length, 0);
            log(`Returning logs: ${logsCount} items`)
            res.json(logs);
        } catch (error) {
            log("Error fetching logs:"+ error, "error");
            res.status(500).json({ error: "Failed to fetch logs" });
        }
    });

    router.get('/health', async (req, res) => {
        log("Starting to handle GET health request");
        try {
            await notionService.getNotionPriorities();
            log("Everything's ok");
            res.json({ status: "ok" });
        } catch {
            res.status(500).json({ status: "fail" });
        }
    });

    return router;
}
