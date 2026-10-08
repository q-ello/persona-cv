import express from 'express';
import { createLocalizationService } from '../../services/helpers/localization/localization.service';

//hidden route for manual reloading
export const createLocalesRouter = (localizationService: ReturnType<typeof createLocalizationService>) => {
    const router = express.Router();

    router.get('/', async (_, res) => {
        console.log("Reloading localization after request...")
        try {
            await localizationService.reload();
            
            res.json("Locales are reloaded successfully");
        } catch (error) {
            console.error("Error reloading localization from Notion:", error);
            res.status(500).json({ error: "Failed to reload localization" });
        }
    });

    return router;
}