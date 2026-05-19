import { useCallback, useEffect, useRef, useState } from 'react'
import CalendarGrid from './components/CalendarGrid/CalendarGrid'
import CBack from '../../components/CBack/CBack'
import Command from '../../components/Command/Command'
import './Timeline.css'
import Month from './components/Month/Month'
import Year from './components/Year/Year'
import DailyLog from './components/DailyLog/DailyLog'
import clsx from 'clsx'
import { AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { SelectedPlate } from './components/SelectedPlate/SelectedPlate'
import Today from './components/Today/Today'
import DatePlate from './components/DatePlate/DatePlate'
import Events from './components/Events/Events'
import { soundManager } from '../../services/sound/soundManager'
import { getGeneralString } from '@cv/shared'
import { timelineApi } from '../../services/api/api'
import useDateNavigation from './hooks/useDateNavigation'
import useCellPosition from './hooks/useCellPosition'
import useTimelineData from './hooks/useTimelineData'

// just manual map
const monthNames: Map<string, string[]> = new Map([
  ["ru", ['ЯНВ', 'ФЕВ', 'МАРТ', 'АПР', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']],
  ["eng", ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']]
]);
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    <div className='w-full cursor-default select-none'>
      <div className="relative w-screen h-screen overflow-hidden">
        {/* black screen */}
        <div className="absolute top-0 left-[-10%] w-[80%] h-full bg-black -skew-x-[23deg] overflow-hidden">
          <div className="container top-0 right-0 left-0 right-0 absolute skew-x-[23deg] h-screen" ref={gridRef}>
            {/* Command */}
            <div className="-bottom-7 absolute right-75 pb-15 opacity-25">
              <Command />
            </div>
            {selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() && <Today position={todayPos} number={today.getDate().toString()} />}
            <div className="">
              <SelectedPlate position={selectedPos} />
              {/* calendar grid*/}
              <CalendarGrid
                year={selectedDate.getFullYear()}
                month={selectedDate.getMonth()}
                events={events}
                onCellLayout={registerCell}
                onDateHovered={setSelectedDate}
              />
            </div>
          </div>
        </div>
        {/* white screen */}
        <div className={clsx("absolute top-0 right-[-10%] w-[50%] h-full -skew-x-[23deg]", pastSelected && 'bg-neutral-400' || 'bg-white')}></div>
        {/* month */}
        <Month month={monthNames.get("eng")?.[selectedDate.getMonth()] ?? "???"} bgColor={pastSelected ? 'bg-neutral-400' : 'bg-white'} qEnabled={!isOnMaxPastMonth} eEnabled={!isOnMaxFutureMonth} onMonthChanged={onMonthChanged} />
        {/* year */}
        <Year year={selectedDate.getFullYear()} />

        {/* date */}
        {selectedDate && <DatePlate pastSelected={pastSelected} selectedDate={selectedDate} dayName={weekdayNames[selectedDate.getDay()]} />}

        {/* events */}
        {selectedDate && events.has(getGeneralString(selectedDate)) && <Events events={events.get(getGeneralString(selectedDate))!} pastSelected={pastSelected} />}

        {/* which plans do you want to view */}
        <div className={clsx("absolute text-black font-helvetica text-2xl bottom-23 left-20 right-0 -skew-y-5 -skew-x-5 font-black scale-x-95 -rotate-5", pastSelected && 'grey-outline' || 'white-outline')}>
          Which plans do you want to view?
        </div>
        {/* logs if it is the past */}
        <AnimatePresence>
          {pastSelected && <DailyLog />}
        </AnimatePresence>

        {/* <div className="absolute top-10 left-10">
          <FontHelper text='Showa Day' size={2} imgSize={[600, 200]} imgPosition={[90, 25]} imgUrl={img_event} />
        </div> */}
        {/* c back */}
        <CBack isActivated={cBackActivated} onClick={goBack} />
      </div>
    </div>
  )
}

export default Timeline;