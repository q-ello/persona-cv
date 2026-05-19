import { getGeneralString } from '@cv/shared';
import clsx from 'clsx'
import React, { useMemo } from 'react';

interface IDatePlateProps {
    pastSelected: boolean,
    selectedDate: Date,
    dayName: string | undefined
}

const DatePlate = (props: IDatePlateProps) => {
    const { pastSelected, selectedDate, dayName } = props;

    const dateRotate = useMemo(() =>
        `rotate(${pastSelected ? -3 : Math.floor(Math.random() * -5)}deg)`,
        [pastSelected, getGeneralString(selectedDate)]);

    return (
        <div className={clsx("absolute text-3xl top-40 right-68 bg-black font-arsenal font-bold pl-25 pr-15 py-3 scale-y-90", pastSelected && 'text-neutral-400' || 'text-white')} style={{ transform: dateRotate }}>
            <span className='inline-block w-32'>{selectedDate.toLocaleDateString()}</span>&nbsp;&nbsp;&nbsp;({dayName ?? dayName})
        </div>
    )
}

export default React.memo(DatePlate)
