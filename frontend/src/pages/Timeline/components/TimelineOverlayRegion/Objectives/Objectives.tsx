import { IObjective } from "@cv/shared";
import { motion } from "motion/react";
import ObjectivesNote from '../../../../../assets/images/objectives.svg'
import ObjectivesText from "./ObjectivesText";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useMemo } from "react";

interface IObjectivesProps {
  objectives: IObjective[];
  objectivesLoading: boolean;
}

//seeded randomness. for now here, maybe will move somewhere else
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pseudoRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const Objectives = (props: IObjectivesProps) => {
  const {
    objectives,
    objectivesLoading
  } = props;

  const randomTransforms = useMemo(() =>
    objectives?.map(obj => {
      const base = hashString(obj.object);
      return {
        x: pseudoRandom(base)() * 30,
        y: pseudoRandom(base + 1)() * 5 - 2,
        rot: pseudoRandom(base + 2)() * -5
      }
    }), [objectives, objectivesLoading]);

  return (
    <div className='absolute right-40 top-70 -rotate-5 text-black'>
      <motion.div
        initial={{ translateX: 750, translateY: -500, rotate: -90 }}
        animate={{ translateX: [750, -5, 0], translateY: [-500, 3, 0], rotate: [-90, 15, 0], transition: { duration: 0.5, delay: 0.2, times: [0, 0.75, 1] } }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        exit={{ translateX: [0, -30, -500], translateY: [0, 0, 800], rotate: [0, -10, 90], transition: { duration: 0.8, times: [0, 0.2, 1] } }}>
        <motion.div
          style={{
            transformOrigin: "50% 18%"
          }}
          animate={{
            rotate: [-0.7, 1.2, -0.4, 0.3, 0],
            y: [0, -1, 0.5, -0.5, 0]
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <img
            src={ObjectivesNote}
            alt=""
            className='relative w-130 h-130'
          />
          <div className="absolute top-0 left-0 bottom-0 right-0 pt-22">
            <ObjectivesText />
            <div className="w-fit max-w-80 mx-auto mt-2 font-cooper font-bold -skew-x-3">
              {
                (objectives?.length > 0 || objectivesLoading)
                && <ul className="list-disc marker:text-red-700 text-xl">
                  {objectives?.map((objective, index) =>
                    <li
                      key={objective.object}
                      className={clsx("text-left")}
                      style={{ transform: `translateX(${randomTransforms[index].x}px) translateY(${randomTransforms[index].y}px) rotate(${randomTransforms[index].rot}deg) ` }}
                    >
                      {objective.nameEng} <Link to={objective.url} target="_blank" className="text-neutral-600 hover:text-red-800">{objective.object}</Link>
                    </li>)}
                </ul>
                || <div className="-rotate-5 text-5xl text-neutral-500 pt-10 -skew-x-3">Nothing to do so far</div>
              }
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div >
  )
}

export default Objectives;