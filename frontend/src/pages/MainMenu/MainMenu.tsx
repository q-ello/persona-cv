import img from '../../assets/images/image.png'
import img_log from '../../assets/images/image log.png'
import img_event from '../../assets/images/image event.png'
import LocalizedLink from '../../components/LocalizedLink/LocalizedLink'

const MainMenu = () => {
  return (
    <div>
      <div className="relative text-white px-35">
        <img src={img_event} alt="" />
      </div>
      MainMenu<br />
      press start, settings and beatiful background<br />
      reference: main menu persona<br />
      <LocalizedLink to="/timeline">Go to timeline</LocalizedLink>
    </div>
  )
}

export default MainMenu
