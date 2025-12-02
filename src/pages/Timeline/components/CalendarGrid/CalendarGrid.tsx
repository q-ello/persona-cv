import { useMemo } from 'react'
import WeekDay from '../WeekDay/WeekDay'
import { IEvent } from '../../types';
import './CalendarGrid.css'
import DayCell from './DayCell';
import React from 'react';

interface ICalendarProps {
    year: number,
    month: number,
    events?: Map<string, IEvent[]>,
    onDateHovered?: (date: Date) => void,
    onCellLayout?: (date: string, rect: DOMRect) => void
}

const CalendarGrid = (props: ICalendarProps) => {
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
                    return <DayCell key={index} index={index} number={number} year={year} month={month} now={now} events={events} onDateHovered={onDateHovered} onCellLayout={onCellLayout} />
                }
                )}
            </div>
        </div >
    )
}

export default React.memo(CalendarGrid, (prev, next) => {
    return prev.year === next.year && prev.month === next.month && prev.events === next.events;
})
