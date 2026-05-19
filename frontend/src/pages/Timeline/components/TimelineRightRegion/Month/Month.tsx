import clsx from "clsx";
import React from "react";

interface IMonthProps {
    month: string,
    bgColor: string,
    qEnabled: boolean,
    eEnabled: boolean,
    onMonthChanged: (direction: number) => void
}

const MonthNavButton = ({ label, enabled, onClick, bgColor }: { label: string, enabled: boolean, onClick: () => void, bgColor: string }) => (
    <button className={clsx(bgColor, "py-1.5 px-7 flex items-center")} disabled={!enabled}>
        <div className={clsx("w-[30px] h-[30px]", enabled ? "bg-black" : "bg-stone-500")} onClick={onClick}>
            <div className={clsx(`text-2xl font-arsenal font-black -translate-y-1`, enabled ? "text-white" : "text-black")}>
                {label}
            </div>
        </div>
    </button>
);

const Month = ({ month, bgColor, qEnabled, eEnabled, onMonthChanged }: IMonthProps) => {
    return (
        <div className={clsx(bgColor, `absolute -rotate-20 -top-28 right-158 skew-x-6 pt-50 w-50 h-73`)}>
            <div className="rotate-20 -skew-x-6 flex justify-center gap-4">
                <MonthNavButton label="Q" enabled={qEnabled} onClick={() => onMonthChanged(-1)} bgColor={bgColor} />
                <div className="text-black text-4xl font-helvetica font-black cursor-default select-none rotate-1 -skew-x-3 scale-y-120 -tracking-[0.06em]">
                    {month}
                </div>
                <div className="-translate-y-0.5 translate-x-3">
                    <MonthNavButton label="E" enabled={eEnabled} onClick={() => onMonthChanged(1)} bgColor={bgColor} />
                </div>
            </div>
        </div>
    );
};

export default React.memo(Month, (prev, next) =>
    prev.month === next.month &&
    prev.bgColor === next.bgColor &&
    prev.qEnabled === next.qEnabled &&
    prev.eEnabled === next.eEnabled);
