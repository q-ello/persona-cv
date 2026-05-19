import { RefObject } from 'react'
import Command from '../../../../components/Command/Command';
import Today from './Today/Today';
import { SelectedPlate } from './SelectedPlate/SelectedPlate';
import CalendarGrid from './CalendarGrid/CalendarGrid';
import { ICellPosition } from '../../hooks/useCellPosition';
import { IEvent } from '@cv/shared';

interface ITimelineLeftRegionProps {
    gridRef: (el: HTMLDivElement | null) => void;
    selectedDate: Date;
    today: Date;

    todayPos: ICellPosition | null;
    selectedPos: ICellPosition | null;

    events: Map<string, IEvent[]>;

    registerCell: (dateKey: string, rect: DOMRect) => void
    setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
}

const TimelineLeftRegion = (props: ITimelineLeftRegionProps) => {
    const {
        gridRef,
        selectedDate,
        today,

        todayPos,
        selectedPos,

        events,

        registerCell,
        setSelectedDate,
    } = props;
    return (
        <>
            {/* black screen */}
            <div className="absolute top-0 left-[-10%] w-[80%] h-full bg-black -skew-x-[23deg] overflow-hidden" >
                <div className="container top-0 right-0 left-0 right-0 absolute skew-x-[23deg] h-screen" ref={gridRef}>
                    {/* Command */}
                    <div className="-bottom-7 absolute right-75 pb-15 opacity-25">
                        <Command />
                    </div>
                    {/* Today */}
                    {selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() &&
                        <Today position={todayPos} number={today.getDate().toString()} />}
                    {/* box for calendar grid and selected plate */}
                    <div>
                        {/* selected plate */}
                        <SelectedPlate position={selectedPos} />
                        {/* calendar grid*/}
                        <CalendarGrid
                            year={selectedDate.getFullYear()}
                            month={selectedDate.getMonth()}
                            events={events}
                            onCellLayout={registerCell}
                            onDateHovered={setSelectedDate}
                        />
                    </div>
                </div>
            </div >
        </>
    )
}

export default TimelineLeftRegion
