import express from 'express';
import { createLocalizationService } from '../../services/helpers/localization/localization.service';
import { deepLog, LogType } from '../../utils';

const log = (log: string, type: LogType = "info") => {
    deepLog('locales', log, type);
}

//hidden route for manual reloading
export const createLocalesRouter = (localizationService: ReturnType<typeof createLocalizationService>) => {
    const router = express.Router();

    router.get('/', async (_, res) => {
        log("Reloading localization after request...");
        try {
            await localizationService.reload();
            
            res.json("Locales are reloaded successfully");
        } catch (error) {
            log("Error reloading localization from Notion:" + error, "error");
            res.status(500).json({ error: "Failed to reload localization" });
        }
    });

    return router;
}