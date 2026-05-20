import { EEventType } from '@cv/shared';
import clsx from 'clsx';

interface IEventProps {
    eventName: string,
    index: number,
    eventType: EEventType,
}

const Event = (props: IEventProps) => {
    const { eventName, index, eventType } = props;
    return (
        <div className={clsx('flex items-center gap-4 mb-4 absolute', eventType === EEventType.Deadline ? 'text-red-700' : 'text-black')} style={{left: `-${index * 25}px`, top: `${index * 1.75}em`}}>
            <div className='bg-black w-7 h-7 rounded-full flex items-center justify-center'>
                <div className={clsx("w-4.5 h-4.5 rounded-full", eventType === EEventType.Deadline ? 'bg-red-700' : 'bg-neutral-200')}></div>
            </div>
            {eventName}
        </div>
    )
}

export default Event
