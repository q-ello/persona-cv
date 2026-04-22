import { EEventType } from '../../types';
import clsx from 'clsx';

interface IEventProps {
    eventName: string,
    index: number,
    eventType: EEventType,
    pastSelected: boolean
}

const Event = (props: IEventProps) => {
    const { eventName, index, eventType, pastSelected } = props;
    return (
        <div className={clsx('flex items-center gap-4 mb-4 absolute', eventType === EEventType.Deadline ? pastSelected && 'text-red-900' || 'text-red-700' : 'text-black')} style={{left: `-${index * 25}px`, top: `${index * 1.75}em`}}>
            <div className='bg-black w-7 h-7 rounded-full flex items-center justify-center'>
                <div className={clsx("w-4.5 h-4.5 rounded-full", eventType === EEventType.Deadline ? pastSelected && 'bg-red-900' || 'bg-red-700' : pastSelected && 'bg-neutral-400' || 'bg-neutral-200')}></div>
            </div>
            {eventName}
        </div>
    )
}

export default Event
