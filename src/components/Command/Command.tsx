import './Command.css'

const Command = () => {
  return (
    <div className='text-9xl -rotate-15 text-white select-none'>
        {/* c */}
        <span className="font-cooper inline-block scale-125">C</span>
        {/* o */}
        <span className="font-bubblegum scale-y-75 inline-block translate-y-2">o</span>
        {/* m1 */}
        <span className="font-calaboose scale-x-75 scale-y-125 inline-block -mx-5 rotate-5">m</span>
        {/* m2 */}
        <span className="overflow-hidden inline-block leading-none translate-y-8 rotate-10 py-3">
          <span className="p-1 pb-3 font-cooper bg-white inline-block -rotate-20 -skew-x-5">
            <span className="text-black inline-block rotate-10 skew-x-5">M</span>
          </span>
        </span>
        {/* a */}
        <span className="font-cooper scale-125 inline-block persona-outline text-black -ml-5 -rotate-10 translate-y-2 z-10 relative">a</span>
        {/* n */}
        <span className="font-calaboose persona-reverse-outline inline-block scale-x-75 -ml-5 -translate-y-1 rotate-5">n</span>
        {/* d */}
        <span className="font-cooper inline-block -rotate-5 -ml-4 translate-y-3">D</span>
      </div>
  )
}

export default Command
