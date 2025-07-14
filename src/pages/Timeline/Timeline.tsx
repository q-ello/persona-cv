import { useEffect, useMemo, useState } from 'react'
import CalendarGrid from '../../components/CalendarGrid/CalendarGrid'
import CBack from '../../components/CBack/CBack'
import Command from '../../components/Command/Command'
import FontHelper from '../../components/FontHelper/FontHelper'
import './Timeline.css'

const Timeline = () => {
  const today = new Date()
  const [year, setYear] = useState<number>(today.getFullYear())
  const [month, setMonth] = useState<number>(today.getMonth())
  const [day, setDay] = useState<number>(today.getDate())
  const [weekday, setWeekday] = useState<number>(today.getUTCDay())

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
            <CalendarGrid year={year} month={month}/>
          </div>
        </div>
        {/* white screen */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-full bg-white -skew-x-[23deg]"></div>
        {/* month */}
        <div className="absolute bg-white -rotate-20 -top-28 right-158 skew-x-6 pt-50 w-50 h-73 overflow-hiden">
          <div className="rotate-20 -skew-x-6 flex justify-center gap-4">
            <div className="bg-white py-1.5 px-7 flex items-center">
              <div className="bg-stone-500 w-[30px] h-[30px]">
                <div className="text-2xl font-arsenal font-black text-black -translate-y-1">Q</div>
              </div>
            </div>
            <div className="text-black text-4xl font-helvetica font-black cursor-default select-none rotate-1 -skew-x-3 scale-y-120 -tracking-[0.06em]">
              {monthNames[month]}
            </div>
            <div className="bg-white py-1.5 px-7 flex item-center -translate-y-0.5 translate-x-3">
              <div className="bg-black w-[30px] h-[30px]">
                <div className="text-2xl font-arsenal font-black text-white -translate-y-0.5">E</div>
              </div>
            </div>
          </div>
        </div>

      {/* date */}
      <div className="absolute text-white text-3xl top-40 right-80 bg-black font-arsenal font-bold -rotate-5 pl-25 pr-15 py-3 scale-y-90">
        {month + 1}/{day}/{year % 100} &nbsp;({weekdayNames[weekday]})
      </div>
      {/* which plans do you want to view */}
      <div className="absolute text-black font-helvetica text-2xl bottom-23 left-20 right-0 -skew-y-5 -skew-x-5 font-black scale-x-95 -rotate-5 white-outline">
        Which plans do you want to view?
      </div>
      {/* <div className="absolute top-10 left-10">
        <FontHelper text='Q E' size={2} imgSize={[400, 100]} imgPosition={[70, 7]} />
      </div> */}
      {/* c back */}
      <CBack />
    </div>
    </div>
  )
}

export default Timeline