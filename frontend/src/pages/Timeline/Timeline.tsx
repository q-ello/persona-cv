import { useCallback, useEffect, useRef, useState } from 'react'
import CBack from '../../components/CBack/CBack'
import './Timeline.css'
import { useNavigate } from 'react-router-dom'
import { soundManager } from '../../services/sound/soundManager'
import { timelineApi } from '../../services/api/api'
import useDateNavigation from './hooks/useDateNavigation'
import useCellPosition from './hooks/useCellPosition'
import useTimelineData from './hooks/useTimelineData'
import TimelineLeftRegion from './components/TimelineLeftRegion/TimelineLeftRegion'
import TimelineRightRegion from './components/TimelineRightRegion/TimelineRightRegion'
import TimelineScene from './components/TimelineScene/TimelineScene'
import TimelineOverlayRegion from './components/TimelineOverlayRegion/TimelineOverlayRegion'

const Timeline = () => {
  const {
    today,
    selectedDate,
    setSelectedDate,
    previousDate,
    pastSelected,
    isOnMaxFutureMonth,
    isOnMaxPastMonth,
    onMonthChanged,
    handleKeyNav
  } = useDateNavigation();

  const { gridRef, registerCell, selectedPos, todayPos } = useCellPosition(selectedDate, today);

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  const { events } = useTimelineData(year, month);

  const navigate = useNavigate();
  const [cBackActivated, setCBackActivated] = useState<boolean>(false);

  const goBack = useCallback(() => {
    setCBackActivated(true)
    soundManager.play('cancel', () => navigate('/'))
  }, [navigate]);

  const goBackRef = useRef(goBack);
  goBackRef.current = goBack;

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'c') {
      goBackRef.current();
      return;
    }
    handleKeyNav(event.key);
  }, [handleKeyNav]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  //sound on date change
  useEffect(() => {
    if (!selectedDate) return;

    if (selectedDate.getTime() !== previousDate.current.getTime()) {
      soundManager.play("cursor");
      previousDate.current = selectedDate;
    }
  }, [selectedDate]);

  useEffect(() => {
    timelineApi.getObjectives();
  }, []);

  return (
    <TimelineScene>
      <TimelineLeftRegion
        gridRef={gridRef}
        selectedDate={selectedDate}
        today={today}
        todayPos={todayPos}
        selectedPos={selectedPos}
        events={events}
        registerCell={registerCell}
        setSelectedDate={setSelectedDate}
      />
      <TimelineRightRegion
        pastSelected={pastSelected}
        selectedDate={selectedDate}
        isOnMaxPastMonth={isOnMaxPastMonth}
        isOnMaxFutureMonth={isOnMaxFutureMonth}
        onMonthChanged={onMonthChanged}
        events={events}
      />
      <TimelineOverlayRegion pastSelected={pastSelected} />

      {/* <div className="absolute top-10 left-10">
          <FontHelper text='Showa Day' size={2} imgSize={[600, 200]} imgPosition={[90, 25]} imgUrl={img_event} />
        </div> */}
      {/* c back */}
      <CBack isActivated={cBackActivated} onClick={goBack} />
    </TimelineScene>
  )
}

export default Timeline;