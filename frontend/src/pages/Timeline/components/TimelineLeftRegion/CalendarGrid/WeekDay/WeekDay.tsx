interface IWeekDayProps {
    day: string[],
    scales: number[][],
    translates: number[][],
    rotates: number[]
}

const WeekDay = (props: IWeekDayProps) => {
    const { day, scales, translates, rotates } = props
    return (
        <div className="text-5xl h-[50px] font-black font-helvetica tracking-tighter skew-x-3">
            {day.map((char, index) => (
                <span
                className='inline-block'
                    key={index}
                    style={{
                        scale: `${scales[index][0]} ${scales[index][1]}`,
                        translate: `${translates[index][0]}px ${translates[index][1]}px`,
                        rotate: `${rotates[index]}deg`
                    }}
                    >
                    {char}
                </span>
            ))}
        </div>
    )
}

export default WeekDay
