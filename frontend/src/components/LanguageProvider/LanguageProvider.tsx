import { Outlet, useParams } from "react-router-dom";
import LanguageRedirect from "../LanguageRedirect/LanguageRedirect";
import { isLanguage } from "@cv/shared";
import { useEffect } from "react";
import { languageStore } from "../../services/localization/languageStore";

const LanguageProvider = () => {
    const { lang } = useParams();
    const validLang = lang && isLanguage(lang) ? lang : null;

    useEffect(() => {
        if (validLang) {
            languageStore.setLanguage(validLang);
        }
    }, [validLang]);

    if (!validLang) {
        return <LanguageRedirect />;
    }

    return <Outlet />;
}

export default LanguageProvider
