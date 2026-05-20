import { AnimatePresence } from 'motion/react';
import DailyLog from './DailyLog/DailyLog';
import { IObjective } from '@cv/shared';
import Objectives from './Objectives/Objectives';

interface ITimelineOverlayRegion {
    pastSelected: boolean;
    objectives: IObjective[];
    objectivesLoading: boolean;
}

const TimelineOverlayRegion = (props: ITimelineOverlayRegion) => {
    const {
        pastSelected,
        objectives,
        objectivesLoading
    } = props;
    return (
        <>
            {/* logs if it is the past */}
            <AnimatePresence>
                {pastSelected && <DailyLog />}
            </AnimatePresence>
            <AnimatePresence>
                {!pastSelected && <Objectives objectives={objectives} objectivesLoading={objectivesLoading}/>}
            </AnimatePresence>
        </>
    )
}

export default TimelineOverlayRegion
