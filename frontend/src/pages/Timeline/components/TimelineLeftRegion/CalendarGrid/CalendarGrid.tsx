import { useMemo } from 'react'
import './CalendarGrid.css'
import DayCell from './DayCell/DayCell';
import React from 'react';
import { IEvent } from '@cv/shared';
import WeekDay from './WeekDay/WeekDay';
import { localize } from '../../../../../services/localization/localization';

interface ICalendarProps {
    year: number,
    month: number,
    events?: Map<string, IEvent[]>,
    onDateHovered?: (date: Date) => void,
    onCellLayout?: (date: string, rect: DOMRect) => void
}

export interface IWeekdayTransform {
    rotation: number[];
    translation: number[][];
    scale: number[][];
}

const CalendarGrid = (props: ICalendarProps) => {
    const { year, month, events, onDateHovered, onCellLayout } = props;
    const daysNumbers: string[] = useMemo(() => {
        const days: string[] = []
        const firstWeekDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        for (let i = 0; i < firstWeekDay; i++)
            days.push('')

        for (let i = 0; i < daysInMonth; i++)
            days.push((i + 1).toString())
        return days
    }, [year, month]);

    const now = new Date();

    const weekdayTransformData: IWeekdayTransform[] = [
        {
            rotation: [-5, 0, 5],
            translation: [[0, 0], [0, -5], [3, 0]],
            scale: [[1, 1.3], [1, 1.3], [1, 1.2]]
        },
        {
            rotation: [-3, 2, 3],
            translation: [[0, 0], [2, 0], [0, 0]],
            scale: [[1, 1.3], [1, 1.3], [1, 1.3]]
        },
        {
            rotation: [-4, 2, 0],
            translation: [[5, 0], [0, 4], [-3, 0]],
            scale: [[1, 1.3], [0.9, 1.2], [0.8, 1.2]]
        },
        {
            rotation: [-4, 0, 2],
            translation: [[5, 0], [0, 3], [-4, 0]],
            scale: [[0.9, 1.3], [1, 1.3], [0.9, 1.3]]
        },
        {
            rotation: [0, -2, -4],
            translation: [[3, 0], [0, 5], [0, 0]],
            scale: [[1, 1.3], [0.9, 1.2], [1, 1.3]]
        },
        {
            rotation: [-3, -2, 0],
            translation: [[0, 5], [0, 0], [0, 4]],
            scale: [[0.9, 1.2], [0.8, 1.1], [1, 1.2]]
        },
        {
            rotation: [-3, 0, 6],
            translation: [[6, 0], [0, 9], [-15, 0]],
            scale: [[0.9, 1.3], [0.7, 1], [0.8, 1.2]]
        },
    ]

    return (
        <div className="grid-container h-full w-full py-20 pl-80 pr-70 -rotate-5 text-center -skew-y-1">
            <div className="grid grid-cols-7">
                {/* headers */}
                {[0, 1, 2, 3, 4, 5, 6].map(index =>
                    <WeekDay day={localize("date.weekdays.calendar")[index].split("")} transformData={weekdayTransformData[index]} key={index}/>
                )}
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
