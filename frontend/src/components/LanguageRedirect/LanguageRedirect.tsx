import { languageStorage } from '../../services/localization/languageStore'
import { Navigate } from 'react-router-dom';

const LanguageRedirect = () => {
    const language = languageStorage.getLanguage();
    return (
        <Navigate to={`/${language}`} replace/>
    )
}

export default LanguageRedirect
