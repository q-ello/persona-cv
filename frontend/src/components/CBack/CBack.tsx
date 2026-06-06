import React, { useMemo } from 'react';
import clsx from 'clsx'
import { localize } from '../../services/localization/localization';
import { useLanguage } from '../../services/localization/languageStore';

interface ICBackProps {
    isActivated: boolean,
    onClick: () => void
}

const CBack = ({ isActivated, onClick }: ICBackProps) => {

    const stylePerComponent = [
        'translate-y-0.5 translate-x-0.5 -rotate-8',
        '-translate-y-0.5 scale-x-90',
        '-translate-y-1 -translate-x-0.5 rotate-10',
        'rotate-4 -translate-x-1',
        'rotate-7 -translate-x-1 translate-y-0.5'
    ];

    const lang = useLanguage();
    const localizedBack = useMemo(() => localize(lang, 'ui.back'), [lang]) as string;

    return (
        <button className={clsx("absolute bottom-5 right-100", isActivated && 'scale-120')} onClick={onClick} >
            <span className="bg-black w-12 h-12 font-inter font-black text-white text-3xl py-1 inline-block mr-1">C</span>
            <span className="inline-block font-inter font-black text-white text-4xl relative -translate-y-1 p-1 pt-1 -rotate-2 scale-y-110">
                {/* for shadows */}
                <div className='relative inset-0'>
                    {/* for inner shadow */}
                    <div className="relative">

                        {/* shadows */}
                        <div className="absolute inset-0">
                            {localizedBack.split("").map((letter, index) => (
                                <span
                                    key={index}
                                    className={clsx(
                                        'inline-block text-black scale-140 -rotate-10 -skew-x-10 skew-y-7',
                                        stylePerComponent[index]
                                    )}
                                >
                                    {letter}
                                    <div className={clsx(
                                        'absolute inset-0 bg-black scale-x-75',
                                        letter.toUpperCase() === letter ? 'scale-y-50' : 'translate-y-1 scale-y-40')} />
                                </span>
                            ))}
                        </div>

                        {/* letters */}
                        <div className="relative">
                            {localizedBack.split("").map((letter, index) => (
                                <span
                                    key={index}
                                    className={clsx(
                                        'inline-block text-white',
                                        stylePerComponent[index]
                                    )}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>
            </span>
        </button>
    )
}

export default React.memo(CBack, (prev, next) => prev.isActivated === next.isActivated);