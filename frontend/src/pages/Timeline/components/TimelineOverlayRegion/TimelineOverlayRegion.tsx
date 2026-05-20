import { AnimatePresence } from 'motion/react';
import DailyLog from './DailyLog/DailyLog';
import { IPriority } from '@cv/shared';
import Priorities from './Priorities/Priorities';

interface ITimelineOverlayRegion {
    pastSelected: boolean;
    priorities: IPriority[];
    prioritiesLoading: boolean;
    cBackIsActivated: boolean;
}

const TimelineOverlayRegion = (props: ITimelineOverlayRegion) => {
    const {
        pastSelected,
        priorities,
        prioritiesLoading,
        cBackIsActivated
    } = props;
    return (
        <AnimatePresence>
            {!cBackIsActivated &&
                <Priorities
                    key="priorities"
                    priorities={priorities}
                    prioritiesLoading={prioritiesLoading}
                />}
            {!cBackIsActivated && pastSelected && <DailyLog key="daily-log" />}
        </AnimatePresence>
    )
}

export default TimelineOverlayRegion
