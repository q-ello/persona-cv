import React, { useMemo } from 'react';

type PersonaTextProps = {
  text: string;
  rotateRange?: number;     // e.g., 5 means -5 to +5 degrees
  shiftRange?: number;      // e.g., 5 means -5px to +5px
  className?: string;
  scaleRange?: number
};

export const PersonaText: React.FC<PersonaTextProps> = ({
  text,
  rotateRange = 5,
  shiftRange = 3,
  className = 'persona-text',
  scaleRange = 0.1
}) => {
  // Precompute random styles once using useMemo
  const randomizedStyles = useMemo(() => {
    const specialLetter = Math.floor(Math.random() * text.split('').length)
    return text.split('').map((_, index) => ({
        font: index == specialLetter ? 'earwig' : 'badaboom',
        rotate: Math.floor(Math.random() * (rotateRange * 2 + 1)) - rotateRange,
        shift: Math.floor(Math.random() * (shiftRange * 2 + 1)) - shiftRange,
        scale: Math.random() * (scaleRange * 2) - scaleRange + 1,
    }));
  }, [text, rotateRange, shiftRange, scaleRange]);

  return (
    <div className={`${className}`}>
      {text.toUpperCase().split('').map((char, i) => (
        <span
          key={i}
          className={`
            ${char == ' ' ? '' : 'inline-block'}
            font-${randomizedStyles[i].font} 
          `}
            style={
                {
                    transform: `rotate(${randomizedStyles[i].rotate}deg) translateY(${randomizedStyles[i].shift}px) scale(${randomizedStyles[i].scale})`
                }
            }
        >
          {char}
        </span>
      ))}
    </div>
  );
};
