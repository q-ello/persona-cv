import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { soundManager } from '../../sound/soundManager'
import { EEventState, EEventType, IEvent, IHoliday } from '../../../../shared/types/event'

// just manual map
const monthNames : Map<string, string[]> = new Map([
  ["ru", ['ЯНВ', 'ФЕВ', 'МАРТ', 'АПР', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']],
  ["eng", ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']]
])
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const maxPastDate = new Date(2023, 0, 1);

const Timeline = () => {
  // date data
  const today = new Date()
  const maxFutureDate = useMemo(() => {
    const date = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    date.setDate(date.getDate() - 1)
    return date;
  }, [today])

  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const previousDate = useRef(selectedDate)

  // #region positions
  const [rects, setRects] = useState<Map<string, DOMRect>>(new Map())
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const gridRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      setOffset({ x: rect.left, y: rect.top });
    }
  }, []);

  const registerCell = (dateKey: string, rect: DOMRect) => {
    setRects(prev => {
      const newMap = new Map(prev);
      newMap.set(dateKey, rect);
      return newMap;
    });
  }

  const selectedPos = useMemo(() => {
    if (!selectedDate) return null;
    const rect = rects.get(selectedDate.toDateString());
    if (!rect) return null;
    return {
      x: rect.left - offset.x,
      y: rect.top - offset.y,
      w: rect.width,
      h: rect.height
    };
  }, [selectedDate, rects, offset]);

  const todayPos = useMemo(() => {
    if (!rects.has(today.toDateString())) return null;

    const rect = rects.get(today.toDateString());
    if (!rect) return null;
    return {
      x: rect.left - offset.x,
      y: rect.top - offset.y,
      w: rect.width,
      h: rect.height
    };
  }, [rects, offset, today]);
// #endregion

  const pastSelected = useMemo(() => selectedDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0), [selectedDate])
  const navigate = useNavigate();

  const [events, setEvents] = useState<Map<string, IEvent[]>>(new Map())

  // for c back
  const [cBackActivated, setCBackActivated] = useState<boolean>(false)

  const goBack = () => {
    setCBackActivated(true)
    soundManager.play('cancel', () => navigate('/'))
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'c') {
      goBack()
      return;
    }

    setSelectedDate(prev => {
      let d = new Date(prev);

      if (event.key === 'w' || event.key === 'ArrowUp') {
        d.setDate(d.getDate() - 7)
      }

      if (event.key === 'a' || event.key === 'ArrowLeft') {
        d.setDate(d.getDate() - 1)
      }

      if (event.key === 's' || event.key === 'ArrowDown') {
        d.setDate(d.getDate() + 7)
      }

      if (event.key === 'd' || event.key === 'ArrowRight') {
        d.setDate(d.getDate() + 1)
      }

      if (event.key === 'e') {
        d = moveMonth(d, 1);
      }

      if (event.key === 'q') {
        d = moveMonth(d, -1);
      }

      return clampDate(d);
    })
  }, [selectedDate, goBack, maxPastDate, maxFutureDate]);

  // #region useeffect
  // we want to handle key presses
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // fetching events
  useEffect(() => {
    //TODO events 
  
  }, [])

  //sound for selection
  useEffect(() => {
    if (!selectedDate) return;

    if (selectedDate.getTime() !== previousDate.current.getTime()) {
        soundManager.play("cursor");
        previousDate.current = selectedDate;
    }
  }, [selectedDate])

  useEffect(() => {
    const fetchObjectives = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timeline/objectives`);

      console.log(response)
    }

    fetchObjectives();
  }, []);

  // #endregion

  const clampDate = (date: Date): Date => {
    if (date < maxPastDate) return maxPastDate;
    if (date > maxFutureDate) return maxFutureDate;
    return date;
  }

  const moveMonth = (date: Date, delta: number): Date => {
    const day = date.getDate();
    const newMonth = date.getMonth() + delta;

    const daysInTargetMonth = new Date(date.getFullYear(), newMonth + 1, 0).getDate();
    if (day > daysInTargetMonth) {
      date.setDate(daysInTargetMonth);
    } else {
      date.setDate(day);
    }

    date.setMonth(newMonth);
    return date;
  }

  const onMonthChanged = (direction: number) => {
    setSelectedDate(prev => {
      let d = new Date(prev);
      d = moveMonth(d, direction);
      return clampDate(d);
    });
  }

  const isOnMaxPastMonth = useMemo(() => {
    return selectedDate.getFullYear() === maxPastDate.getFullYear() && selectedDate.getMonth() === maxPastDate.getMonth()
  }, [selectedDate])

  const isOnMaxFutureMonth = useMemo(() => {
    return selectedDate.getFullYear() === maxFutureDate.getFullYear() && selectedDate.getMonth() === maxFutureDate.getMonth()
  }, [selectedDate])

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
        {selectedDate && events.has(selectedDate.toLocaleDateString()) && <Events events={events.get(selectedDate.toLocaleDateString())!} pastSelected={pastSelected} />}

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