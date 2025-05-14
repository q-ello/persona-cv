import React from 'react'
import { Link } from 'react-router-dom'

const MainMenu = () => {
  return (
    <div className='text-red-500'>
      MainMenu<br/>
      press start, settings and beatiful background<br/>
      reference: main menu persona<br/>
      <Link to="/timeline">Go to timeline</Link>
    </div>
  )
}

export default MainMenu
