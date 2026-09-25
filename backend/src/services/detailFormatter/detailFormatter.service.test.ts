import { createMockServices } from "../../test/factories/createMockServices";
import { createLocalizationService } from "../localization/localization.service";
import { createDetailFormatterService } from "./detailFormatter.service";

describe("DetailFormatterService", () => {
    it("resolves number-number to range correcly", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.chapter.range",
                    {
                        en: "chapters {{value}}",
                        ru: "главы {{value}}"
                    },
                    
                ],
                [
                    "detail.chapter.single",
                    {
                        en: "chapter {{value}}",
                        ru: "глава {{value}}"
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result = await detailFormatterService.formatDetail('chapter', 'range', '1-3', 'en');

        expect(result).toBe("— chapters 1-3");
    });

    it("resolves number to single correctly", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.chapter.range",
                    {
                        en: "chapters {{value}}",
                        ru: "главы {{value}}"
                    },
                    
                ],
                [
                    "detail.chapter.single",
                    {
                        en: "chapter {{value}}",
                        ru: "глава {{value}}"
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result = await detailFormatterService.formatDetail('chapter', 'range', '3', 'ru');

        expect(result).toBe("— глава 3");
    });

    it("resolves seasons correctly", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.chapter.range",
                    {
                        en: "chapters {{value}}",
                        ru: "главы {{value}}"
                    },
                    
                ],
                [
                    "detail.chapter.single",
                    {
                        en: "chapter {{value}}",
                        ru: "глава {{value}}"
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result = await detailFormatterService.formatDetail('chapter', 'range', '1-3 (S2)', 'ru');

        expect(result).toBe("— главы 1-3 (S2)");
    });

    it("resolves english counts", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.video.one",
                    {
                        en: "{{value}} video",
                        ru: "{{value}} ролик"
                    },
                    
                ],
                [
                    "detail.video.other",
                    {
                        en: "{{value}} videos",
                        ru: "{{value}} роликов"
                    }
                ],
                [
                    "detail.video.few",
                    {
                        en: "{{value}} videos few",
                        ru: "{{value}} ролика"
                    },
                    
                ],
                [
                    "detail.video.many",
                    {
                        en: "{{value}} videos many",
                        ru: "{{value}} роликов"
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const resultOne = await detailFormatterService.formatDetail('video', 'count', '1', 'en');
        const resultOther = await detailFormatterService.formatDetail('video', 'count', '5', 'en');

        expect(resultOne).toBe("— 1 video");
        expect(resultOther).toBe("— 5 videos");
    });

    it("resolves commas alright counts", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.video.one",
                    {
                        en: "{{value}} video",
                        ru: "{{value}} ролик"
                    },
                    
                ],
                [
                    "detail.video.other",
                    {
                        en: "{{value}} videos",
                        ru: "{{value}} роликов"
                    }
                ],
                [
                    "detail.video.few",
                    {
                        en: "{{value}} videos few",
                        ru: "{{value}} ролика"
                    },
                    
                ],
                [
                    "detail.video.many",
                    {
                        en: "{{value}} videos many",
                        ru: "{{value}} роликов"
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const resultOne = await detailFormatterService.formatDetail('video', 'count', 'Single stories, 1', 'en');
        const resultOther = await detailFormatterService.formatDetail('video', 'count', 'Single stories, 5', 'en');

        expect(resultOne).toBe("— Single stories, 1 video");
        expect(resultOther).toBe("— Single stories, 5 videos");
    });

    it("resolves russian counts", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.video.one",
                    {
                        en: "{{value}} video",
                        ru: "{{value}} ролик"
                    },
                    
                ],
                [
                    "detail.video.other",
                    {
                        en: "{{value}} videos",
                        ru: "{{value}} роликов"
                    }
                ],
                [
                    "detail.video.few",
                    {
                        en: "{{value}} videos few",
                        ru: "{{value}} ролика"
                    },
                    
                ],
                [
                    "detail.video.many",
                    {
                        en: "{{value}} videos many",
                        ru: "{{value}} роликов"
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result1 = await detailFormatterService.formatDetail('video', 'count', '1', 'ru');
        const result2 = await detailFormatterService.formatDetail('video', 'count', '2', 'ru');
        const result5 = await detailFormatterService.formatDetail('video', 'count', '5', 'ru');
        const result11 = await detailFormatterService.formatDetail('video', 'count', '11', 'ru');
        const result21 = await detailFormatterService.formatDetail('video', 'count', '21', 'ru');
        const result22 = await detailFormatterService.formatDetail('video', 'count', '22', 'ru');
        const result25 = await detailFormatterService.formatDetail('video', 'count', '25', 'ru');
        const result111 = await detailFormatterService.formatDetail('video', 'count', '111', 'ru');
        const result112 = await detailFormatterService.formatDetail('video', 'count', '112', 'ru');

        expect(result1).toBe("— 1 ролик");
        expect(result2).toBe("— 2 ролика");
        expect(result5).toBe("— 5 роликов");
        expect(result11).toBe("— 11 роликов");
        expect(result21).toBe("— 21 ролик");
        expect(result22).toBe("— 22 ролика");
        expect(result25).toBe("— 25 роликов");
        expect(result111).toBe("— 111 роликов");
        expect(result112).toBe("— 112 роликов");
    });

    it("text adds a dash", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations
            .mockResolvedValueOnce(
                new Map([
                    [
                        "detail.postprocess",
                        {
                            en: "postprocess outline",
                            ru: "постпроцессная обводка"
                        }
                    ]
                ])
            )
            .mockResolvedValueOnce(new Map());

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result = await detailFormatterService.formatDetail("postprocess", 'text', '', 'en');


        expect(result).toBe("— postprocess outline");
    });

    it("no_dash doesn't add a dash", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations
            .mockResolvedValueOnce(
                new Map([
                    [
                        "detail.postprocess",
                        {
                            en: "postprocess outline",
                            ru: "постпроцессная обводка"
                        }
                    ]
                ])
            )
            .mockResolvedValueOnce(new Map());

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result = await detailFormatterService.formatDetail("postprocess", 'no_dash', '', 'en');


        expect(result).toBe("postprocess outline");
    });

    it("english fallback still interpolates values", async () => {
        const { notionService } = createMockServices();
        notionService.getAllLocalizations.mockResolvedValue(
            new Map([
                [
                    "detail.chapter.range",
                    {
                        en: "chapters {{value}}",
                    },
                    
                ],
                [
                    "detail.chapter.single",
                    {
                        en: "chapter {{value}}",
                    }
                ]
            ])
        );

        const localizationService = createLocalizationService(notionService);
        await localizationService.reload();

        const detailFormatterService = createDetailFormatterService(localizationService);
        const result = await detailFormatterService.formatDetail('chapter', 'range', '1-3 (S2)', 'ru');

        expect(result).toBe("— chapters 1-3 (S2)");
    }) 
})