import { IWeekdayTransform } from "../CalendarGrid"

interface IWeekDayProps {
    day: string[],
    transformData: IWeekdayTransform;
}

const WeekDay = (props: IWeekDayProps) => {
    const { day, transformData } = props
    return (
        <div className="text-5xl h-[50px] font-black font-inter tracking-tighter skew-x-3">
            {day.map((char, index) => (
                <span
                className='inline-block'
                    key={index}
                    style={{
                        scale: `${transformData.scale[index][0]} ${transformData.scale[index][1]}`,
                        translate: `${transformData.translation[index][0]}px ${transformData.translation[index][1]}px`,
                        rotate: `${transformData.rotation[index]}deg`
                    }}
                    >
                    {char}
                </span>
            ))}
        </div>
    )
}

export default WeekDay
