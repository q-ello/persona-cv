import { useCallback, useEffect, useMemo, useState } from 'react'
import CalendarGrid from './components/CalendarGrid/CalendarGrid'
import CBack from '../../components/CBack/CBack'
import Command from '../../components/Command/Command'
// import FontHelper from '../../components/FontHelper/FontHelper'
import './Timeline.css'
import Month from './components/Month/Month'
import Year from './components/Year/Year'
import DailyLog from './components/DailyLog/DailyLog'
import clsx from 'clsx'
import { AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import cancelAudio from './../../assets/audio/cancel.wav'
// import image from './../../assets/images/image.png'

const Timeline = () => {
  const today = new Date()
  const [year, setYear] = useState<number>(today.getFullYear())
  const [month, setMonth] = useState<number>(today.getMonth())
  const [day, setDay] = useState<number>(today.getDate())
  // const [day, setDay] = useState<number>(29)
  const [weekday, setWeekday] = useState<number>(today.getUTCDay())
  const [cBackActivated, setCBackActivated] = useState<boolean>(false)

  const cancelSound = new Audio(cancelAudio)

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const pastSelected = useMemo(() => new Date(year, month, day).setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0), [year, month, day])

  const navigate = useNavigate();

  const goBack = () => {
    setCBackActivated(true)
    cancelSound.play()
    cancelSound.onended = () => {navigate('/')}
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'c')
    {
      
      goBack()
    }
    // do stuff with stateVariable and event
  }, []);

  // we want to handle key presses
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

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
            <CalendarGrid year={year} month={month} />
          </div>
        </div>
        {/* white screen */}
        <div className={clsx("absolute top-0 right-[-10%] w-[50%] h-full -skew-x-[23deg]", pastSelected && 'bg-neutral-400' || 'bg-white')}></div>
        {/* month */}
        <Month month={monthNames[month]} bgColor={pastSelected ? 'bg-neutral-400' : 'bg-white'} />
        {/* year */}
        <Year year={year} />

        {/* date */}
        <div className={clsx("absolute  text-3xl top-40 right-80 bg-black font-arsenal font-bold -rotate-5 pl-25 pr-15 py-3 scale-y-90", pastSelected && 'text-neutral-400' || 'text-white')}>
          {month + 1}/{day}/{year % 100} &nbsp;({weekdayNames[weekday]})
        </div>
        {/* which plans do you want to view */}
        <div className={clsx("absolute text-black font-helvetica text-2xl bottom-23 left-20 right-0 -skew-y-5 -skew-x-5 font-black scale-x-95 -rotate-5", pastSelected && 'grey-outline' || 'white-outline')}>
          Which plans do you want to view?
        </div>
        {/* logs if it is the past */}
        <AnimatePresence>
          {pastSelected && <DailyLog />}
        </AnimatePresence>
        <div className="absolute top-10 left-10">
        {/* <FontHelper text='c' size={2} imgSize={[400, 100]} imgPosition={[90, 100]} imgUrl={image}/> */}
      </div>
        {/* c back */}
        <CBack isActivated={cBackActivated} onClick={goBack}/>
      </div>
      <button className='absolute top-100 right-20' onClick={() => {setYear(2025)}}>Set year 2025</button>
      <button className='absolute top-120 right-20' onClick={() => {setYear(2026)}}>Set year 2026</button>
    </div>
  )
}

export default Timeline