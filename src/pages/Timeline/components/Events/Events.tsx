import { IEvent } from '../../types'
import Event from './Event';

interface IEventsProps {
    events: IEvent[],
    pastSelected: boolean
}

const Events = (props: IEventsProps) => {
    const { events, pastSelected } = props;
    return (
        <div className="absolute top-55 right-20 w-150 font-cooper font-bold text-3xl -rotate-3">
            {events.map((event, index) => (
                <Event key={index} eventName={event.eventEng} index={index} pastSelected={pastSelected} eventType={event.type}/>
            ))}
        </div>
    )
}

export default Events
