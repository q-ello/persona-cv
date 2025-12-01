import React, { useEffect, useMemo, useState, useRef } from 'react'
import WeekDay from '../WeekDay/WeekDay'
import clsx from 'clsx'
import { IEvent, IHoliday, EWeekday, EEventState, EEventType } from '../../types';
import './CalendarGrid.css'

interface ICalendarProps {
    year: number,
    month: number,
    events?: Map<string, IEvent[]>,
    onDateHovered?: (date: Date) => void,
    onCellLayout?: (date: string, rect: DOMRect) => void
}

async function getHolidays(year: number): Promise<IHoliday[]> {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/RU`);
    return await res.json();
}

const formatNumber = (num: number) => {
    return ("0" + num).slice(-2);
}

const CalendarGrid = (props: ICalendarProps) => {
    const [holidayDates, setHolidayDates] = useState<IHoliday[]>([]);

    const { year, month, events, onDateHovered, onCellLayout } = props
    const daysNumbers: string[] = useMemo(() => {
        const days: string[] = []
        const firstWeekDay = new Date(year, month, 1).getUTCDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        for (let i = 0; i < firstWeekDay; i++)
            days.push('')

        for (let i = 0; i < daysInMonth; i++)
            days.push((i + 1).toString())
        return days
    }, [year, month])

    const now = new Date()

    const dayColors = new Map([
        [EWeekday.Weekday, ['--color-neutral-400', '--color-neutral-200']],
        [EWeekday.Saturday, ['--color-teal-700', '--color-teal-500']],
        [EWeekday.Holiday, ['--color-red-900', '--color-red-700']]
    ])

    useEffect(() => {
        const fetchHolidays = async () => {
            const holidays = await getHolidays(year);
            setHolidayDates(holidays);
        };
        fetchHolidays();
    }, [year])

    return (
        <div className="grid-container h-full w-full py-20 pl-80 pr-70 -rotate-5 text-center -skew-y-1">
            <div className="grid grid-cols-7">
                {/* headers */}
                <WeekDay day={['S', 'u', 'N']} rotates={[-5, 0, 5]} translates={[[0, 0], [0, -5], [3, 0]]} scales={[[1, 1.3], [1, 1.3], [1, 1.2]]} />
                <WeekDay day={['M', 'o', 'N']} rotates={[-3, -2, 3]} translates={[[0, 0], [2, 0], [0, 0]]} scales={[[1, 1.3], [1, 1.3], [1, 1.3]]} />
                <WeekDay day={['T', 'U', 'E']} rotates={[-4, 2, 0]} translates={[[5, 0], [0, 4], [-3, 0]]} scales={[[1, 1.3], [0.9, 1.2], [0.8, 1.2]]} />
                <WeekDay day={['W', 'e', 'D']} rotates={[-4, 0, 2]} translates={[[5, 0], [0, 3], [-4, 0]]} scales={[[0.9, 1.3], [1, 1.3], [0.9, 1.3]]} />
                <WeekDay day={['T', 'H', 'u']} rotates={[0, -2, -4]} translates={[[3, 0], [0, 5], [0, 0]]} scales={[[1, 1.3], [0.9, 1.2], [1, 1.3]]} />
                <WeekDay day={['F', 'R', 'i']} rotates={[-3, -2, 0]} translates={[[0, 5], [0, 0], [0, 4]]} scales={[[0.9, 1.2], [0.8, 1.1], [1, 1.2]]} />
                <WeekDay day={['S', 'A', 'T']} rotates={[-3, 0, 6]} translates={[[6, 0], [0, 9], [-15, 0]]} scales={[[0.9, 1.3], [0.7, 1], [0.8, 1.2]]} />
                {/* days */}
                {daysNumbers.map((number, index) => {
                    if (!number) return <div key={index}></div>;
                    const ref = useRef<HTMLDivElement>(null);

                    useEffect(() => {
                        if (ref.current) {
                            onCellLayout?.(new Date(year, month, parseInt(number, 10)).toDateString(), ref.current.getBoundingClientRect());
                        }
                    }, [ref.current]);

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

                    // check if there is a deadline on this date
                    const isDeadline = (events?.get(date.toLocaleDateString())?.some(e => e.type === EEventType.Deadline) && isFuture) ?? false;
                    if (isDeadline) {
                        dayType = EWeekday.Holiday
                    }

                    // if it is a holiday then it is red
                    const isHoliday = holidayDates.some(h => h.date === `${year}-${formatNumber(month + 1)}-${formatNumber(+number)}`)
                    if (isHoliday) {
                        dayType = EWeekday.Holiday
                    }

                    const eventState: EEventState = events?.get(date.toLocaleDateString())?.reduce((val, curr) => curr.state === EEventState.Middle ? curr : val).state ?? (isHoliday ? EEventState.Single : EEventState.None)

                    const renderEvent = (eventState: EEventState) => {
                        switch (eventState) {
                            case EEventState.End:
                                return (
                                    <div className={clsx('flex relative h-[15px] items-center', number.length === 2 && number[0] >= '2' && 'left-3')}>
                                        <div className={clsx("bg-neutral-200 w-4 h-2 w-full mx-auto",)}></div>
                                        <div className={clsx("bg-neutral-200 w-[15px] h-[15px] rounded-full mx-auto mx-auto shrink-0")}></div>
                                        <div className={clsx("w-full h-2 mx-auto")}></div>
                                    </div>
                                )
                            case EEventState.Middle:
                                return (
                                    <div className={clsx('flex relative h-[15px] items-center', number.length === 2 && number[0] >= '2' && 'left-3')}>
                                        <div className={clsx("bg-neutral-200 w-full h-2 mx-auto mx-auto shrink-0")}></div>
                                    </div>
                                )
                            case EEventState.None:
                                return
                            case EEventState.Start:
                                return (
                                    <div className={clsx('flex relative h-[15px] items-center', number.length === 2 && number[0] >= '2' && 'left-3')}>
                                        <div className={clsx("w-50 h-2 mx-auto")}></div>
                                        <div className={clsx("bg-neutral-200 w-[15px] h-[15px] rounded-full mx-auto shrink-0")}></div>
                                        <div className={clsx("bg-neutral-200 w-full h-2 mx-auto")}></div>
                                    </div>
                                )
                            case EEventState.Single:
                                return (<div className={clsx("relative bg-neutral-200 w-[15px] h-[15px] rounded-full mx-auto", number.length === 2 && number[0] >= '2' && 'left-3')}></div>)
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
                                            '--x': `${Math.random() * (i) * 10 - i * 4}px`,
                                            '--y': `${Math.random() * (i) * 10 - i * 4}px`,
                                            color: `var(${(dayColors.get(dayType) ?? ['--color-neutral-400', '--color-neutral-200'])[Number(isFuture)]})`,
                                            opacity: 1 - i / 5
                                        } as React.CSSProperties
                                    }
                                >
                                    {number}
                                </div>))
                            }
                        </div>
                        {renderEvent(eventState)}
                    </div>)
                }
                )}
            </div>
        </div >
    )
}

export default CalendarGrid
