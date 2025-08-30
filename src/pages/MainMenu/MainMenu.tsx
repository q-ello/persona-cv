import { Link } from 'react-router-dom'
import img from '../../assets/images/image.png'
import img_log from '../../assets/images/image log.png'

const MainMenu = () => {
  return (
    <div>
      <div className="relative text-white px-35">
        <img src={img_log} alt="" />
      </div>
      MainMenu<br />
      press start, settings and beatiful background<br />
      reference: main menu persona<br />
      <Link to="/timeline">Go to timeline</Link>
    </div>
  )
}

export default MainMenu
