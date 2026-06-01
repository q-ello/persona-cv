import { Outlet, useParams } from "react-router-dom";
import LanguageRedirect from "../LanguageRedirect/LanguageRedirect";
import { isLanguage } from "../../services/localization/localization";
import { languageStorage } from "../../services/localization/languageStore";

const LanguageProvider = () => {
    const {lang} = useParams();

    if (!lang || !isLanguage(lang))
    {
        return <LanguageRedirect />;
    }

    languageStorage.setLanguage(lang);

    return <Outlet />;
}

export default LanguageProvider
