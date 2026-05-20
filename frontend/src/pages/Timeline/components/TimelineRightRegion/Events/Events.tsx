import { IEvent } from '@cv/shared';
import Event from './Event';

interface IEventsProps {
    events: IEvent[],
}

const Events = (props: IEventsProps) => {
    const { events } = props;
    return (
        <div className="absolute top-55 right-20 w-150 font-cooper font-bold text-3xl -rotate-3">
            {events.map((event, index) => (
                <Event key={index} eventName={event.eventEng} index={index} eventType={event.type}/>
            ))}
        </div>
    )
}

export default Events
