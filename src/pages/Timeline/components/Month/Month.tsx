import React from 'react'

interface IMonthProps {
    month: string,
    bgColor: string
}

const Month = ({ month, bgColor }: IMonthProps) => {
    return (
        <div className={`absolute ${bgColor} -rotate-20 -top-28 right-158 skew-x-6 pt-50 w-50 h-73 overflow-hiden`}>
            <div className="rotate-20 -skew-x-6 flex justify-center gap-4">
                <div className={`${bgColor} py-1.5 px-7 flex items-center`}>
                    <div className="bg-stone-500 w-[30px] h-[30px]">
                        <div className="text-2xl font-arsenal font-black text-black -translate-y-1">Q</div>
                    </div>
                </div>
                <div className="text-black text-4xl font-helvetica font-black cursor-default select-none rotate-1 -skew-x-3 scale-y-120 -tracking-[0.06em]">
                    {month}
                </div>
                <div className={`${bgColor} py-1.5 px-7 flex item-center -translate-y-0.5 translate-x-3`}>
                    <div className="bg-black w-[30px] h-[30px]">
                        <div className="text-2xl font-arsenal font-black text-white -translate-y-0.5">E</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Month
