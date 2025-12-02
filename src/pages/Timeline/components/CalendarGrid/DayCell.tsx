import { useEffect, useRef } from "react";
import { EEventState, EEventType, EWeekday, IEvent } from "../../types";
import { clsx } from "clsx";

interface IDayCellProps {
    index: number,
    number: string,
    year: number,
    month: number,
    now: Date,
    events?: Map<string, IEvent[]>,
    onDateHovered?: (date: Date) => void,
    onCellLayout?: (date: string, rect: DOMRect) => void
}

const dayColors = new Map([
    [EWeekday.Weekday, ['--color-neutral-400', '--color-neutral-200']],
    [EWeekday.Saturday, ['--color-teal-700', '--color-teal-500']],
    [EWeekday.Holiday, ['--color-red-900', '--color-red-700']]
])

const DayCell = (props: IDayCellProps) => {
    const { index, number, year, month, now, events, onDateHovered, onCellLayout } = props;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const date = new Date(year, month, parseInt(number, 10));
            onCellLayout?.(date.toDateString(), ref.current.getBoundingClientRect());
        }
    }, [year, month, number]);

    let dayType: EWeekday;
    // get a color from the day of the week
    switch (index % 7) {
        case 6:
            dayType = EWeekday.Saturday
            break
        case 0:
            dayType = EWeekday.Holiday
            break
        default:
            dayType = EWeekday.Weekday
    }
    const date = new Date(year, month, parseInt(number, 10))
    const isFuture = date > now

    const isDeadline = (events?.get(date.toLocaleDateString())?.some(e => e.type === EEventType.Deadline) && isFuture) ?? false;
    const isHoliday = events?.get(date.toLocaleDateString())?.some(e => e.type === EEventType.Holiday) ?? false;
    if (isHoliday || isDeadline) {
        dayType = EWeekday.Holiday
    }

    const eventState: EEventState = events?.get(date.toLocaleDateString())?.reduce((val, curr) => curr.state === EEventState.Middle ? curr : val).state ?? (isHoliday ? EEventState.Single : EEventState.None)

    const renderEvent = (eventState: EEventState, isFuture: boolean) => {
        const eventColor = isFuture && 'bg-neutral-200' || 'bg-neutral-400';

        switch (eventState) {
            case EEventState.End:
                return (
                    <div className={clsx('flex relative h-[15px] items-center', number.length === 2 && number[0] >= '2' && 'left-3')}>
                        <div className={clsx("w-4 h-2 w-full mx-auto", eventColor)}></div>
                        <div className={clsx("w-[15px] h-[15px] rounded-full mx-auto mx-auto shrink-0", eventColor)}></div>
                        <div className={clsx("w-full h-2 mx-auto")}></div>
                    </div>
                )
            case EEventState.Middle:
                return (
                    <div className={clsx('flex relative h-[15px] items-center', number.length === 2 && number[0] >= '2' && 'left-3')}>
                        <div className={clsx("w-full h-2 mx-auto mx-auto shrink-0", eventColor)}></div>
                    </div>
                )
            case EEventState.None:
                return
            case EEventState.Start:
                return (
                    <div className={clsx('flex relative h-[15px] items-center', number.length === 2 && number[0] >= '2' && 'left-3')}>
                        <div className={clsx("w-50 h-2 mx-auto")}></div>
                        <div className={clsx("w-[15px] h-[15px] rounded-full mx-auto shrink-0", eventColor)}></div>
                        <div className={clsx("w-full h-2 mx-auto", eventColor)}></div>
                    </div>
                )
            case EEventState.Single:
                return (<div className={clsx("relative w-[15px] h-[15px] rounded-full mx-auto", eventColor, number.length === 2 && number[0] >= '2' && 'left-3')}></div>)
        }
    }

    return (<div className='h-[120px] relative' ref={ref} key={index} onMouseEnter={() => { onDateHovered?.(date) }}>
        <div className={clsx('font-milker text-9xl tracking-tight relative', {
            'tracking-widest': number[0] === '1',
        })}>
            <div
                className={clsx({ 'scale-[0.7_1] isolate': number.length === 2 })}
                style={{
                    color: `var(${(dayColors.get(dayType) ?? ['--color-neutral-400', '--color-neutral-200'])[Number(isFuture)]})`
                }}>
                {number}
            </div>
            {/* render deadline */}
            {isDeadline &&
                [0, 1, 2, 3, 4].map(i => (<div key={i} className={clsx(`absolute inset-0 deadline-layer`, {
                    'scale-[0.7_1]': number.length === 2
                })}
                    style={
                        {
                            '--x': `${Math.random() * (i) * 8 - i * 3}px`,
                            '--y': `${Math.random() * (i) * 8 - i * 3}px`,
                            color: `var(${(dayColors.get(dayType) ?? ['--color-neutral-400', '--color-neutral-200'])[Number(isFuture)]})`,
                            opacity: 1 - i / 5
                        } as React.CSSProperties
                    }
                >
                    {number}
                </div>))
            }
        </div>
        {renderEvent(eventState, isFuture)}
    </div>)
};
export default DayCell;