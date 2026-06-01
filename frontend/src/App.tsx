import './App.css'
import { Route, Routes } from 'react-router-dom'
import MainMenu from './pages/MainMenu/MainMenu'
import Timeline from './pages/Timeline/Timeline'
import Confidants from './pages/Confidants/Confidants'
import Settings from './pages/Settings/Settings'
import Projects from './pages/Projects/Projects'
import { useEffect } from 'react'
import { soundManager } from './services/sound/soundManager'
import { UISounds } from './services/sound/sounds'
import LanguageRedirect from './components/LanguageRedirect/LanguageRedirect'
import LanguageProvider from './components/LanguageProvider/LanguageProvider'

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
      <Route path='/' element={<LanguageRedirect />} />

      <Route path='/:lang' element={<LanguageProvider />}>
        <Route index element={<MainMenu />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="confidants" element={<Confidants />} />
        <Route path="settings" element={<Settings />} />
        <Route path="projects" element={<Projects />} />
      </Route>
      <Route path='*' element={<LanguageRedirect />} />
    </Routes>
  )
}

export default App
