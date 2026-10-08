import { createMockServices } from "../../../test/factories/createMockServices";
import { createLocalizationService } from "./localization.service";

describe("LocalizationService", () => {
    it("returns localized value from cache", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "ui.play",
                    {
                        en: "Play",
                        ru: "Играть"
                    }
                ]
            ])
        );

        const service = createLocalizationService(notionService);

        await service.reload();

        const result = await service.asyncLocalize("ui.play", "ru");

        expect(result).toBe("Играть");
    });

    it("refreshes cache when key is missing", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations
            .mockResolvedValueOnce(new Map())
            .mockResolvedValueOnce(
                new Map([
                    [
                        "ui.play",
                        {
                            en: "Play",
                            ru: "Играть"
                        }
                    ]
                ])
            );

        const service = createLocalizationService(notionService);

        await service.reload();

        const result = await service.asyncLocalize("ui.play", "ru");

        expect(result).toBe("Играть");
        expect(notionService.getAllLocalizations).toHaveBeenCalledTimes(2);
    });

    it("falls back to english locale when requested locale is missing", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "ui.play",
                    {
                        en: "Play"
                    }
                ]
            ])
        );

        const service = createLocalizationService(notionService);

        await service.reload();

        const result = await service.asyncLocalize("ui.play", "ru");

        expect(result).toBe("Play");
    });

    it("returns last segment of key when localization is missing", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations.mockResolvedValue(new Map());

        const service = createLocalizationService(notionService);

        await service.reload();

        const result = await service.asyncLocalize(
            "timeline.event.birthday",
            "ru"
        );

        expect(result).toBe("birthday");
    });

    it("keeps existing cache when refresh returns empty map", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations
            .mockResolvedValueOnce(
                new Map([
                    [
                        "ui.play",
                        {
                            en: "Play"
                        }
                    ]
                ])
            )
            .mockResolvedValueOnce(new Map());

        const service = createLocalizationService(notionService);

        await service.reload();
        await service.reload();

        const result = await service.asyncLocalize("ui.play", "en");

        expect(result).toBe("Play");
    });

    it("keeps old cache when refresh throws", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations
            .mockResolvedValueOnce(
                new Map([
                    [
                        "ui.play",
                        {
                            en: "Play"
                        }
                    ]
                ])
            )
            .mockRejectedValueOnce(new Error("Notion down"));

        const service = createLocalizationService(notionService);

        await service.reload();
        await service.reload();

        const result = await service.asyncLocalize("ui.play", "en");

        expect(result).toBe("Play");
    });

    it("resolves params", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "ui.play",
                    {
                        en: "Play {{value}}"
                    }
                ]
            ])
        );

        const service = createLocalizationService(notionService);

        await service.reload();

        const result = await service.asyncLocalize("ui.play", "en", {value: "test"});

        expect(result).toBe("Play test");
    });

    it("leaves placeholder if params don't match", async () => {
        const { notionService } = createMockServices();

        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "ui.play",
                    {
                        en: "Play {{value}}"
                    }
                ]
            ])
        );

        const service = createLocalizationService(notionService);

        await service.reload();

        const result = await service.asyncLocalize("ui.play", "en", {val: "test"});

        expect(result).toBe("Play {{value}}");
    });
})