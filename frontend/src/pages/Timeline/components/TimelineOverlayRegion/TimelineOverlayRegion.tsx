import { AnimatePresence } from 'motion/react';
import DailyLog from './DailyLog/DailyLog';

interface ITimelineOverlayRegion {
    pastSelected: boolean;
    cBackIsActivated: boolean;
}

const TimelineOverlayRegion = (props: ITimelineOverlayRegion) => {
    const {
        pastSelected,
        cBackIsActivated
    } = props;
    return (
        <AnimatePresence>
            {!cBackIsActivated && pastSelected && <DailyLog key="daily-log" />}
        </AnimatePresence>
    )
}

export default TimelineOverlayRegion
