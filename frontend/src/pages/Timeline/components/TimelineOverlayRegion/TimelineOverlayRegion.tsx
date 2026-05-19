import { AnimatePresence } from 'motion/react';
import DailyLog from './DailyLog/DailyLog';

interface ITimelineOverlayRegion {
    pastSelected: boolean
}

const TimelineOverlayRegion = (props: ITimelineOverlayRegion) => {
    const {
        pastSelected
    } = props;
    return (
        <>
            {/* logs if it is the past */}
            <AnimatePresence>
                {pastSelected && <DailyLog />}
            </AnimatePresence>
        </>
    )
}

export default TimelineOverlayRegion
