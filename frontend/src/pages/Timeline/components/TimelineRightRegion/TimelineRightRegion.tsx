import clsx from 'clsx'
import Month from './Month/Month'
import Year from './Year/Year'
import DatePlate from './DatePlate/DatePlate'
import Events from './Events/Events'
import { getGeneralString, IEvent } from '@cv/shared'

interface ITimelineRightRegionProps {
    pastSelected: boolean;
    selectedDate: Date;
    isOnMaxPastMonth: boolean;
    isOnMaxFutureMonth: boolean;
    onMonthChanged: (direction: number) => void;
    events: Map<string, IEvent[]>;
}

// just manual map
const monthNames: Map<string, string[]> = new Map([
    ["ru", ['ЯНВ', 'ФЕВ', 'МАРТ', 'АПР', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']],
    ["eng", ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']]
]);
const weekdayNames: Map<string, string[]> = new Map([
    ["ru", ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']],
    ["eng", ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']]
]);

const TimelineRightRegion = (props: ITimelineRightRegionProps) => {
    const {
        pastSelected,
        selectedDate,
        isOnMaxPastMonth,
        isOnMaxFutureMonth,
        onMonthChanged,
        events
    } = props;
    return (
        <>
            {/* white screen */}
            <div className={clsx("absolute top-0 right-[-10%] w-[50%] h-full -skew-x-[23deg]", pastSelected && 'bg-neutral-400' || 'bg-white')
            }></div >
            {/* month */}
            <Month
                month={monthNames.get("eng")?.[selectedDate.getMonth()] ?? "???"}
                bgColor={pastSelected ? 'bg-neutral-400' : 'bg-white'}
                qEnabled={!isOnMaxPastMonth}
                eEnabled={!isOnMaxFutureMonth}
                onMonthChanged={onMonthChanged}
            />
            {/* year */}
            <Year year={selectedDate.getFullYear()} />

            {/* date */}
            {selectedDate &&
                <DatePlate
                    pastSelected={pastSelected}
                    selectedDate={selectedDate}
                    dayName={weekdayNames.get("eng")?.[selectedDate.getDay()]}
                />}

            {/* events */}
            {selectedDate && events.has(getGeneralString(selectedDate)) && <Events events={events.get(getGeneralString(selectedDate))!} pastSelected={pastSelected} />}

            {/* which plans do you want to view */}
            <div className={clsx("absolute text-black font-helvetica text-2xl bottom-23 left-20 right-0 -skew-y-5 -skew-x-5 font-black scale-x-95 -rotate-5", pastSelected && 'grey-outline' || 'white-outline')}>
                Which plans do you want to view?
            </div>
        </>
    )
}

export default TimelineRightRegion
