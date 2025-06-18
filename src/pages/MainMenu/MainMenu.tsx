import { Link } from 'react-router-dom'
import img from '../../assets/images/image.png'

const MainMenu = () => {
  return (
    <div>
      <div className="relative text-white px-35">
        <img src={img} alt="" />
      </div>
      MainMenu<br />
      press start, settings and beatiful background<br />
      reference: main menu persona<br />
      <Link to="/timeline">Go to timeline</Link>
    </div>
  )
}

export default MainMenu
