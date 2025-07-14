import React, { useMemo } from 'react'
import WeekDay from '../WeekDay/WeekDay'
import clsx from 'clsx'

enum EWeekday {
    Weekday,
    Saturday,
    Sunday
}

interface ICalendarProps {
    year: number,
    month: number,
}

const CalendarGrid = (props: ICalendarProps) => {
    const { year, month } = props
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
        [EWeekday.Weekday, '--color-neutral'],
        [EWeekday.Saturday, '--color-teal'],
        [EWeekday.Sunday, '--color-red']
    ])

    const futureColors = new Map([
        [EWeekday.Weekday, 200],
        [EWeekday.Saturday, 500],
        [EWeekday.Sunday, 700]
    ])

    return (
        <div className="grid-container h-full w-full py-20 pl-80 pr-70 -rotate-5 text-center -skew-y-1">
            <div className="grid grid-cols-7">
                <WeekDay day={['S', 'u', 'N']} rotates={[-5, 0, 5]} translates={[[0, 0], [0, -5], [3, 0]]} scales={[[1, 1.3], [1, 1.3], [1, 1.2]]} />
                <WeekDay day={['M', 'o', 'N']} rotates={[-3, -2, 3]} translates={[[0, 0], [2, 0], [0, 0]]} scales={[[1, 1.3], [1, 1.3], [1, 1.3]]} />
                <WeekDay day={['T', 'U', 'E']} rotates={[-4, 2, 0]} translates={[[5, 0], [0, 4], [-3, 0]]} scales={[[1, 1.3], [0.9, 1.2], [0.8, 1.2]]} />
                <WeekDay day={['W', 'e', 'D']} rotates={[-4, 0, 2]} translates={[[5, 0], [0, 3], [-4, 0]]} scales={[[0.9, 1.3], [1, 1.3], [0.9, 1.3]]} />
                <WeekDay day={['T', 'H', 'u']} rotates={[0, -2, -4]} translates={[[3, 0], [0, 5], [0, 0]]} scales={[[1, 1.3], [0.9, 1.2], [1, 1.3]]} />
                <WeekDay day={['F', 'R', 'i']} rotates={[-3, -2, 0]} translates={[[0, 5], [0, 0], [0, 4]]} scales={[[0.9, 1.2], [0.8, 1.1], [1, 1.2]]} />
                <WeekDay day={['S', 'A', 'T']} rotates={[-3, 0, 6]} translates={[[6, 0], [0, 9], [-15, 0]]} scales={[[0.9, 1.3], [0.7, 1], [0.8, 1.2]]} />
                {daysNumbers.map((number, index) => {
                    if (!number) return <div key={index}></div>;
                    let dayType: EWeekday;
                    switch (index % 7) {
                        case 6:
                            dayType = EWeekday.Saturday
                            break
                        case 0:
                            dayType = EWeekday.Sunday
                            break
                        default:
                            dayType = EWeekday.Weekday
                    }
                    const date = new Date(year, month, parseInt(number, 10))
                    const isFuture = date > now
                    const isToday = date.toDateString() == now.toDateString()
                    return (<div
                        className={clsx('font-milker text-9xl h-[120px] tracking-tight relative', {
                            'scale-[0.7_1]': number.length === 2,
                            'tracking-widest': number[0] === '1'
                        })}
                        key={index}
                        style={{
                            // letterSpacing: `${number[0] === '1' ? '0.1em' : ''}`,
                            color: `var(${dayColors.get(dayType)}-${(futureColors.get(dayType) ?? 0) + (isFuture ? 0 : 200)})`
                        }}>
                        {number}
                        {isToday &&
                            < div className="text-neutral-300 font-moon text-7xl absolute bottom-1 whitespace-nowrap left-1/2 -translate-x-1/2 flex tracking-tighter -rotate-2">
                                TO<span className='font-helvetica font-black scale-x-60 inline-block -mx-2 -translate-y-1'>D</span>AY
                            </div>}
                    </div>)
                }
                )}
            </div>
        </div >
    )
}

export default CalendarGrid
