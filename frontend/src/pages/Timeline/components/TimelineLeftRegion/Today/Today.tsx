import clsx from 'clsx';
import React from 'react';
import { Language } from '@cv/shared';
import { useLanguage } from '../../../../../services/localization/languageStore';

const Today = ({ position, number }: { position: { x: number; y: number; w: number; h: number } | null, number: string }) => {
    const locale = useLanguage();
   
    if (!position) return null;

    const todayLocalizedSpans: Map<Language, React.ReactElement> = new Map([
        ["en", <>TO<span className='font-inter font-black scale-x-60 inline-block -mx-2 -translate-y-1'>D</span>AY</>],
        ["ru", <span className='scale-x-50'>СЕГОДНЯ</span>]
    ]);


    return (
        <div
            className={clsx('text-neutral-300 font-moon text-7xl absolute scale-[0.7_1] whitespace-nowrap flex tracking-tighter z-5 -rotate-7 -skew-y-1 pointer-events-none',
                number.length === 1 && '-translate-x-1/2' || number[0] === '1' && '-translate-x-1/2' || '-translate-x-3/7')}
            style={{ left: position.x + position.w * 0.5, top: position.y + position.h * 0.5 - 15 }}

        >
            {todayLocalizedSpans.get(locale)}
        </div>
    )
}

export default React.memo(Today);