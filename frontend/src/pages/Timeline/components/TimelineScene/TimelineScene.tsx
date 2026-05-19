interface ITimelineSceneProps {
    children: React.ReactNode
}

const TimelineScene = (props: ITimelineSceneProps) => {
    const {
        children
    } = props;
    return (
        <div className='w-full cursor-default select-none'>
            <div className="relative w-screen h-screen overflow-hidden">
                {children}
            </div>
        </div>
    )
}

export default TimelineScene
