import './App.css'
import { Route, Routes } from 'react-router-dom'
import MainMenu from './pages/MainMenu/MainMenu'
import Timeline from './pages/Timeline/Timeline'
import Confidants from './pages/Confidants/Confidants'
import Settings from './pages/Settings/Settings'
import Projects from './pages/Projects/Projects'
import { useEffect } from 'react'
import { soundManager } from './sound/soundManager'
import { UISounds } from './sound/sounds'

function App() {
  useEffect(() => {
    async function load() {
      await soundManager.init();
      await soundManager.loadSounds(UISounds);
    }
    load();

  }, [])

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
