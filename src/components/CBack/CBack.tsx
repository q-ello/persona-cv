import React from 'react'

const CBack = () => {
    return (
        <div className="absolute bottom-5 right-100">
            <span className="bg-black w-12 h-12 font-anime text-white text-3xl py-1 inline-block mr-1">c</span>
            <span
                className="inline-block font-helvetica font-black text-white text-4xl relative -translate-y-1"
            >
                <span className='relative -rotate-5 inline-block translate-x-0.5'>
                    <span className="bg-black top-0 left-0 bottom-0 right-0 absolute"></span>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1'>B</span>
                </span>
                <span className='relative inline-block -translate-y-1 scale-x-90 rotate-3'>
                    <span className="bg-black top-3 left-0 bottom-0 right-0 absolute -rotate-5"></span>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1'>a</span>
                </span>
                <span className='relative inline-block -translate-y-1.5 -translate-x-0.5'>
                    <span className="bg-black top-3 left-0 bottom-0 right-0 absolute -rotate-10"></span>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1 rotate-10'>c</span>
                </span>
                <span className='relative inline-block rotate-7 -translate-x-1 -translate-y-0.5'>
                    <span className="bg-black top-1 left-0 bottom-0 right-0 absolute"></span>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1'>k</span>
                </span>
            </span>
        </div>
    )
}

export default CBack
