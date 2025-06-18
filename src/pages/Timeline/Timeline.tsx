import Command from '../../components/Command/Command'
import FontHelper from '../../components/FontHelper/FontHelper'
import './Timeline.css'

const Timeline = () => {
  return (
    <div className='w-full'>
      <div className="relative w-screen h-screen overflow-hidden">
        {/* black screen */}
        <div className="absolute top-0 left-[-10%] w-[80%] h-full bg-black -skew-x-[23deg] overflow-hidden">
          <div className="skew-x-[23deg] -bottom-5 absolute right-35 pb-15">
            <Command />
            <div className="absolute bg-black opacity-75 top-0 left-0 right-0 bottom-0 w-full h-full "></div>
          </div>
        </div>
        {/* white screen */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-full bg-white -skew-x-[23deg]"></div>
        <div className="absolute text-black font-helvetica text-2xl bottom-23 left-20 right-0 -skew-y-5 -skew-x-5 font-black scale-x-95 -rotate-5 white-outline">
          Which plans do you want to view?
        </div>
      </div>
    </div>
  )
}

export default Timeline