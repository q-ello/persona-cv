import React from 'react'
import { Link } from 'react-router-dom';
import { useLanguage } from '../../services/localization/languageStore';

interface ILocalizedLinkProps {
    to: string;
    children: React.ReactNode;
}

const LocalizedLink = ({ to, children }: ILocalizedLinkProps) => {
    const lang = useLanguage();

    return (
        <Link to={`/${lang}${to}`}>
            {children}
        </Link>
    )
}

export default LocalizedLink
