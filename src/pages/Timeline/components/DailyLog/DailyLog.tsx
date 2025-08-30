import CenterLog from '../../../../assets/images/center log.svg'
import RightLog from '../../../../assets/images/right log.svg'
import LeftLog from '../../../../assets/images/left log.svg'
import DailyLogText from './DailyLogText'
import { motion } from 'motion/react'

const getRandomTransform = (range: number) => {
    return { translateX: Math.floor(Math.random() * (range * 2 + 1)) - range, rotate: Math.floor(Math.random() * range + 1), translateY: Math.floor(Math.random() * (range * 2 + 1)) }
}

const DailyLog = () => {
    return (
        <div className='absolute right-25 -bottom-35 -rotate-10 scale-90'>
            {/* left */}
            <motion.img
                src={LeftLog} alt=""
                className='absolute top-0 left-0 bottom-0 right-0'
                animate={getRandomTransform(5)}
                initial={{ translateX: 350, rotate: 10, transitionDuration: 200 }}
                exit={{ translateX: [0, 20, -80], rotate: [0, 5, -5], translateY: 80, transition: { duration: 0.2, times: [0, 0.2, 1] } }} />
            {/* right */}
            <motion.img src={RightLog} alt=""
                className='absolute top-0 left-0 bottom-0 right-0'
                animate={getRandomTransform(7)}
                initial={{ translateX: 250, rotate: 13, transitionDuration: 200 }}
                exit={{ translateX: [0, 20, -90], rotate: [0, 20, -10], translateY: 80, transition: { duration: 0.2, times: [0, 0.3, 1] } }} />
            {/* center */}
            <motion.div className=""
                initial={{ translateX: 300, rotate: 15, translateY: 50 }}
                animate={getRandomTransform(7)}
                exit={{ translateX: [0, 15, -100], translateY: 80, rotate: [0, 10, -10], transition: { duration: 0.2, times: [0, 0.25, 1] } }}>
                <img src={CenterLog} alt="" className='relative' />
                <div className="absolute top-0 left-0 bottom-0 right-0 p-10">
                    <DailyLogText />
                </div>
            </motion.div>
        </div>
    )
}

export default DailyLog
