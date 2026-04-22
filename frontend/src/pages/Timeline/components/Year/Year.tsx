import React from 'react'

interface IYearProps {
    year: number
}

const Year = ({ year }: IYearProps) => {
    const scales = [[0.9, 0.9], [0.8, 1], [0.8, 0.9], [1, 0.9]]
    const translates = [[20, 0], [10, 5], [-5, 0], [-15, 10]]
    const rotates = [10, 20, 5, -5]
  return (
    <div className="absolute top-5 right-70 font-milker text-8xl text-black -rotate-7 skew-8 tracking-tighter">
        {year.toString().split('').map((char, index) => (
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

export default React.memo(Year)