import './App.css'
import { Route, Routes } from 'react-router-dom'
import MainMenu from './pages/MainMenu/MainMenu'
import Timeline from './pages/Timeline/Timeline'
import Confidants from './pages/Confidants/Confidants'
import Settings from './pages/Settings/Settings'
import Projects from './pages/Projects/Projects'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/confidants" element={<Confidants />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/projects" element={<Projects/>}/>
    </Routes>
  )
}

export default App
