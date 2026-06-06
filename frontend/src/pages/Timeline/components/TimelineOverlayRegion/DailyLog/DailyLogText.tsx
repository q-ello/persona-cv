import { Language } from "@cv/shared";
import { useMemo } from "react";
import { languageStorage } from "../../../../../services/localization/languageStore";

const DailyLogText = () => {
  const dailyLogLocalized: Map<Language, React.ReactElement> = new Map([
    ["en",
      <div className='text-black text-8xl font-inter font-extrabold scale-x-75 scale-y-120 tracking-tight text-left pl-5 pt-2'>
        <span className='inline-block -rotate-5 mr-5'>Daily</span>
        <span className='inline-block -rotate-3 perspective-dramatic translate-y-2'>
          <span className='inline-block bg-neutral-600 text-white px-5 pb-1 -rotate-x-15 -skew-x-20 -mr-1 -translate-y-1'>L</span>
          og
        </span>
      </div>
    ],
    ["ru",
      <div className='text-black text-8xl font-inter font-extrabold scale-x-75 scale-y-120 tracking-tight text-left pl-20 pt-2'>
        <span className='inline-block perspective-dramatic translate-y-2'>
          <span className='inline-block bg-neutral-600 text-white px-5 pb-1 -rotate-x-15 -skew-x-20 -mr-1 -translate-y-1'>Д</span>
          невник
        </span>
      </div>
    ]
  ]);

  const locale = useMemo(() => languageStorage.getLanguage(), []);

  return (
    dailyLogLocalized.get(locale)
  )
}

export default DailyLogText