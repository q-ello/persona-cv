import { useCallback, useEffect, useMemo, useState } from 'react'
import CalendarGrid from './components/CalendarGrid/CalendarGrid'
import CBack from '../../components/CBack/CBack'
import Command from '../../components/Command/Command'
import FontHelper from '../../components/FontHelper/FontHelper'
import './Timeline.css'
import Month from './components/Month/Month'
import Year from './components/Year/Year'
import DailyLog from './components/DailyLog/DailyLog'
import clsx from 'clsx'
import { AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import cancelAudio from './../../assets/audio/cancel.wav'
import { EEventState, EEventType, IEvent } from './types'

// just manual map
const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
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
  const pastSelected = useMemo(() => selectedDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0), [selectedDate])
  const navigate = useNavigate();

  // events data
  const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
  const [events, setEvents] = useState<Map<string, IEvent[]>>(new Map())

  // for c back
  const cancelSound = new Audio(cancelAudio)
  const [cBackActivated, setCBackActivated] = useState<boolean>(false)

  const goBack = () => {
    setCBackActivated(true)
    cancelSound.play()
    cancelSound.onended = () => { navigate('/') }
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'c') {
      goBack()
      return;
    }

    if (selectedDate.toLocaleDateString() === maxPastDate.toLocaleDateString() && (event.key === 'w' || event.key === 'a' || event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
      console.log('yep');
      return;
    }

    console.log(selectedDate.toLocaleDateString(), maxFutureDate.toLocaleDateString());

    if (selectedDate.toLocaleDateString() === maxFutureDate.toLocaleDateString() && (event.key === 's' || event.key === 'd' || event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
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

      return clampDate(d);
    })
  }, [selectedDate, goBack, maxPastDate, maxFutureDate]);

  // we want to handle key presses
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // fetching events
  useEffect(() => {
    const common_id = import.meta.env.VITE_GOOGLE_COMMON_CALENDAR_ID || ''
    const deadlines_id = import.meta.env.VITE_GOOGLE_DEADLINES_CALENDAR_ID || ''
    const eventsMap = new Map<string, IEvent[]>()

    const addToMap = (key: string, event: IEvent) => {
      if (eventsMap.has(key)) eventsMap.get(key)?.push(event)
      else eventsMap.set(key, [event])
    }

    // get events from different calendars
    const fetchEvents = async (calendarId: string, eventType: EEventType) => {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${API_KEY}`)

      const data = await response.json()

      if (!data.items) return

      data.items.forEach((item: any) => {
        const eventEng: string = item.summary
        const eventRu: string = item.description ?? eventEng

        // if there is a time the date is for a day

        if (item.start.dateTime) {
          const eventStart: Date = new Date(item.start.dateTime)
          const eventState: EEventState = EEventState.Single
          const newEvent: IEvent = { eventEng, eventRu, type: eventType, state: eventState }
          const date = eventStart.toLocaleDateString()
          addToMap(date, newEvent)
        }
        // if event is going for days we need to add every day into the map
        else if (item.start.date) {
          const eventStart = new Date(item.start.date)
          // event end is exclusive
          const eventEnd = new Date(item.end.date)

          eventEnd.setDate(eventEnd.getDate() - 1)

          const eventState: EEventState = eventStart.toDateString() === eventEnd.toDateString() ? EEventState.Single : EEventState.Start
          const newEvent: IEvent = { eventEng, eventRu, type: eventType, state: eventState }
          const date = eventStart.toLocaleDateString()
          addToMap(date, newEvent)

          //if the start end end are the same then it is a single event, no need to make everything else
          if (eventStart.toDateString() === eventEnd.toDateString()) {
            return
          }

          let d: Date = eventStart
          d.setDate(d.getDate() + 1)
          while (d.toDateString() != eventEnd.toDateString()) {
            const middleEvent = { eventEng, eventRu, type: eventType, state: EEventState.Middle }
            addToMap(d.toLocaleDateString(), middleEvent)
            d.setDate(d.getDate() + 1)
          }

          const finalEvent = { eventEng, eventRu, type: eventType, state: EEventState.End }
          addToMap(d.toLocaleDateString(), finalEvent)
        }

        setEvents(eventsMap)
      })
    }

    fetchEvents(common_id, EEventType.Common)
    fetchEvents(deadlines_id, EEventType.Deadline)
  }, [])

  const clampDate = (date: Date): Date => {
    if (date < maxPastDate) return maxPastDate;
    if (date > maxFutureDate) return maxFutureDate;
    return date;
  }

  const isOnMaxPastMonth = useMemo(() => {
    return selectedDate.getFullYear() === maxPastDate.getFullYear() && selectedDate.getMonth() === maxPastDate.getMonth()
  }, [selectedDate])

  const isOnMaxFutureMonth = useMemo(() => {
    return selectedDate.getFullYear() === maxFutureDate.getFullYear() && selectedDate.getMonth() === maxFutureDate.getMonth()
  }, [selectedDate])

  const dateRotate = useMemo(() => {
    return `rotate(${pastSelected ? -3 : Math.floor(Math.random() * -5)}deg)`
  }, [pastSelected, selectedDate])

  return (
    <div className='w-full cursor-default select-none'>
      <div className="relative w-screen h-screen overflow-hidden">
        {/* black screen */}
        <div className="absolute top-0 left-[-10%] w-[80%] h-full bg-black -skew-x-[23deg] overflow-hidden">
          <div className="container top-0 right-0 left-0 right-0 absolute skew-x-[23deg] h-screen">
            {/* Command */}
            <div className="-bottom-7 absolute right-75 pb-15">
              <Command />
              <div className="absolute bg-black opacity-75 top-0 left-0 right-0 bottom-0 w-full h-full "></div>
            </div>
            {/* calendar grid*/}
            <CalendarGrid year={selectedDate.getFullYear()} month={selectedDate.getMonth()} events={events} />
          </div>
        </div>
        {/* white screen */}
        <div className={clsx("absolute top-0 right-[-10%] w-[50%] h-full -skew-x-[23deg]", pastSelected && 'bg-neutral-400' || 'bg-white')}></div>
        {/* month */}
        <Month month={monthNames[selectedDate.getMonth()]} bgColor={pastSelected ? 'bg-neutral-400' : 'bg-white'} qEnabled={!isOnMaxPastMonth} eEnabled={!isOnMaxFutureMonth} />
        {/* year */}
        <Year year={selectedDate.getFullYear()} />

        {/* date */}
        <div className={clsx("absolute text-3xl top-40 right-68 bg-black font-arsenal font-bold pl-25 pr-15 py-3 scale-y-90", pastSelected && 'text-neutral-400' || 'text-white')} style={{ transform: dateRotate }}>
          <span className='inline-block w-32'>{selectedDate.toLocaleDateString()}</span>&nbsp;&nbsp;&nbsp;({weekdayNames[selectedDate.getDay()]})
        </div>
        {/* which plans do you want to view */}
        <div className={clsx("absolute text-black font-helvetica text-2xl bottom-23 left-20 right-0 -skew-y-5 -skew-x-5 font-black scale-x-95 -rotate-5", pastSelected && 'grey-outline' || 'white-outline')}>
          Which plans do you want to view?
        </div>
        {/* logs if it is the past */}
        <AnimatePresence>
          {pastSelected && <DailyLog />}
        </AnimatePresence>
        {/* <div className="absolute top-10 left-10">
          <FontHelper text='' size={0} imgSize={[500, 100]} imgPosition={[30, 100]} imgUrl={imgLongEvent}/>
        </div> */}
        {/* c back */}
        <CBack isActivated={cBackActivated} onClick={goBack} />
      </div>
    </div>
  )
}

export default Timeline