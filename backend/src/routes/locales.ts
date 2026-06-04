import express from 'express';
import { IEvent, IPriority, Language } from '@cv/shared';
import { createNotionService } from '../services/notion/notion.service';
import { createGoogleCalendarService } from '../services/googleCalendar/googleCalendar.service';
import { createNagerService } from '../services/nager/nager.service';
import { mergeEvents } from '../utils';
import { createLocalizationService } from '../services/localization/localization.service';

//hidden route for manual reloading
export const createLocalesRouter = (localizationService: ReturnType<typeof createLocalizationService>) => {
    const router = express.Router();

    router.get('/', async (_, res) => {
        try {
            console.log("Reloading localization after request...")
            await localizationService.reload();
            
            res.json("Locales are reloaded successfully");
        } catch (error) {
            console.error("Error reloading localization from Notion:", error);
            res.status(500).json({ error: "Failed to reload localization" });
        }
    });

    return router;
}