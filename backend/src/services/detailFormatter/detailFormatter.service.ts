import { Language } from "@cv/shared";
import { createLocalizationService, LocalizationParams } from "../localization/localization.service";

export type DetailFormatType = "text" | "range" | "no_dash" | "count";

export const createDetailFormatterService = (localizationService: ReturnType<typeof createLocalizationService>) => {
    const formatDetail = async (detailsKey: string, format: DetailFormatType, detailsValue: string, locale: Language): Promise<string> => {
        let completeDetailsKey = `detail.${detailsKey}`;
        const params: LocalizationParams = {value: detailsValue};

        switch (format) {
            case "no_dash":
                if (!detailsValue)
                {
                    return `${await localizationService.asyncLocalize(completeDetailsKey, locale)}`;
                }
            case "text":
                if (!detailsValue)
                {
                    return `— ${await localizationService.asyncLocalize(completeDetailsKey, locale)}`;
                }
            case "range":
                completeDetailsKey += detailsValue.includes("-") ? ".range" : ".single";
                break;
            case "count":
                const parts = detailsValue.split(",");
                const numberPart = +parts[parts.length - 1];
                completeDetailsKey += `.${new Intl.PluralRules(locale).select(numberPart)}`;
                
                break;
        }

        return `— ${await localizationService.asyncLocalize(completeDetailsKey, locale, params)}`;
    }

    return {formatDetail};
}