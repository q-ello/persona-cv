import { IPriority } from "@cv/shared";
import { motion } from "motion/react";
import PrioritiesNote from '../../../../../assets/images/priorities.svg'
import PrioritiesText from "./PrioritiesText";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useMemo } from "react";
import { localize } from "../../../../../services/localization/localization";

interface IPrioritiesProps {
  priorities: IPriority[];
  prioritiesLoading: boolean;
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

const Priorities = (props: IPrioritiesProps) => {
  const {
    priorities,
    prioritiesLoading,
  } = props;

  const randomTransforms = useMemo(() =>
    priorities?.map(obj => {
      const base = hashString(obj.objectName);
      return {
        x: pseudoRandom(base)() * 30,
        y: pseudoRandom(base + 1)() * 5 - 2,
        rot: pseudoRandom(base + 2)() * -5
      }
    }), [priorities, prioritiesLoading]);

  const idleDuration = useMemo(
    () => 6 + Math.random() * 3,
    []
  );

  const localizedProperties = useMemo(() => {
    return priorities?.map((priority, index) => {
      const isChecked = priority.checked;
      const objectName = priority.objectName;

      const objectNameComponent = isChecked || !priority.url
        ? (<span>{objectName}</span>)
        : (<Link to={priority.url} target="_blank" className="text-neutral-600 hover:text-red-800">{objectName}</Link>);
      return (
        <li
          key={priority.objectName}
          className={clsx("text-left", isChecked && "line-through text-neutral-500")}
          style={{ transform: `translateX(${randomTransforms[index].x}px) translateY(${randomTransforms[index].y}px) rotate(${randomTransforms[index].rot}deg) ` }}
        >
          {localize(`priority.${priority.priorityKey}`)} {objectNameComponent}
        </li>)
    }
    );
  }, [priorities, randomTransforms]);

  const localizedPrioritiesNothing = useMemo(() => {
    return localize("priorities.nothing");
  }, [])

  const localizedPrioritiesLabel = useMemo(() => {
    return localize("priorities.label");
  }, [])

  return (
    <div className='absolute right-50 bottom-15 -rotate-5 text-black pointer-events-auto'>
      <motion.div
        initial={{ translateX: 750, translateY: -500, rotate: -90 }}
        animate={{ translateX: [750, -5, 0], translateY: [-500, 3, 0], rotate: [-90, 15, 0], transition: { duration: 0.5, times: [0, 0.75, 1] } }}
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
            duration: idleDuration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <img
            src={PrioritiesNote}
            alt=""
            className={clsx('relative w-130 h-130')}
          />
          <div className="absolute top-0 left-0 bottom-0 right-0 pt-22">
            <PrioritiesText prioritiesLabel={localizedPrioritiesLabel as string}/>
            <div className="w-fit max-w-80 mx-auto mt-2 font-cooper font-bold -skew-x-3">
              {
                (priorities?.length > 0 || prioritiesLoading)
                  ? <ul className="list-disc marker:text-red-700 text-xl">
                    {localizedProperties}
                  </ul>
                  : <div className="-rotate-5 text-5xl text-neutral-500 pt-8 -skew-x-3">{localizedPrioritiesNothing}</div>
              }
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div >
  )
}

export default Priorities;