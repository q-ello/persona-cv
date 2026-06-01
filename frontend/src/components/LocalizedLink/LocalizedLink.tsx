import React from 'react'
import { Link } from 'react-router-dom';
import { languageStorage } from '../../services/localization/languageStore';

interface ILocalizedLinkProps {
    to: string;
    children: React.ReactNode;
}

const LocalizedLink = ({ to, children }: ILocalizedLinkProps) => {
    const lang = languageStorage.getLanguage();

    return (
        <Link to={`/${lang}${to}`}>
            {children}
        </Link>
    )
}

export default LocalizedLink
