import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../services/localization/languageStore';

const LanguageRedirect = () => {
    const language = useLanguage();
    return (
        <Navigate to={`/${language}`} replace/>
    )
}

export default LanguageRedirect
