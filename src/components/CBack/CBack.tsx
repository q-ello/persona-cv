import Back from '../../assets/images/Back.svg'
import clsx from 'clsx'

interface ICBackProps
{
    isActivated: boolean,
    onClick: () => void
}

const CBack = ({isActivated, onClick}: ICBackProps) => {
    return (
        <div className={clsx("absolute bottom-5 right-100", isActivated && 'scale-120')} onClick={onClick} >
            <span className="bg-black w-12 h-12 font-helvetica font-black text-white text-3xl py-1 inline-block mr-1">C</span>
            <span
                className="inline-block font-helvetica font-black text-white text-4xl relative -translate-y-1 p-1 pt-1 -rotate-2"
            >
                <img src={Back} alt="" className='absolute scale-x-135 scale-y-110 -top-0.5 right-0 rotate-3'/>
                <span className='relative -rotate-5 inline-block translate-x-0.5'>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1'>B</span>
                </span>
                <span className='relative inline-block -translate-y-1 scale-x-90 rotate-3'>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1'>a</span>
                </span>
                <span className='relative inline-block -translate-y-1.5 -translate-x-0.5'>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1 rotate-10'>c</span>
                </span>
                <span className='relative inline-block rotate-7 -translate-x-1 -translate-y-0.5'>
                    <span className='inline-block -rotate-3 scale-y-110 translate-y-0.5 z-1'>k</span>
                </span>
            </span>
        </div>
    )
}

export default CBack
