import './App.css'
import { useState, useRef, useEffect } from 'react'
import Navbar from './components/Navbar'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import Chart from './components/Chart'
import BottomNav from './components/BottomNav'
import ManyCharts from './components/ManyCharts'
import Settings from './components/Settings'
import EbitdaIntro from './components/EbitdaIntro'

const chartsList = [
  'Annual EBITDA',
  'Annual Revenue',
  'Annual EPS Diluted',
  'Annual EPS Basic',
  'Quarterly Revenue',
  'Annual Earnings',
]

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [activeNav, setActiveNav] = useState('Analysis')
  const [activeView, setActiveView] = useState('Bars')
  const [showSettings, setShowSettings] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeChartIdx, setActiveChartIdx] = useState(0)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })
  const settingsBtnRef = useRef(null)
  const settingsDropRef = useRef(null)

  const [settings, setSettings] = useState({
    showLabels: true,
    showPercent: true,
    showTooltip: true,
    showGrid: true,
    customColor: '#16a34a',
  })

  const handleSettingsClick = () => {
    if (settingsBtnRef.current) {
      const rect = settingsBtnRef.current.getBoundingClientRect()
      setDropPos({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      })
    }
    setShowSettings(prev => !prev)
  }

  useEffect(() => {
    const handler = (e) => {
      if (
        settingsDropRef.current && !settingsDropRef.current.contains(e.target) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(e.target)
      ) setShowSettings(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (showIntro) {
    return <EbitdaIntro onFinish={() => setShowIntro(false)} />
  }

  return (
    <div className="app-container">
      <Navbar activeNav={activeNav} setActiveNav={(n) => { setShowSettings(false); setActiveNav(n) }} />

      {activeNav === 'ManyCharts' ? (
        <ManyCharts onSelectChart={(idx) => { setActiveChartIdx(idx); setActiveNav('Analysis') }} />
      ) : (
        <div className="main-wrapper">
          <Header
            activeView={activeView}
            setActiveView={(v) => { setActiveView(v); setShowSettings(false) }}
            showSettings={showSettings}
            onSettingsClick={handleSettingsClick}
            isPlaying={isPlaying}
            activeChartIdx={activeChartIdx}
            chartsList={chartsList}
            settingsBtnRef={settingsBtnRef}
          />

          {showSettings && (
            <div ref={settingsDropRef} style={{ position: 'fixed', top: dropPos.top, right: dropPos.right, zIndex: 300 }}>
              <Settings settings={settings} setSettings={setSettings} />
            </div>
          )}

          <div className="chart-section">
            <StatsPanel activeChartIdx={activeChartIdx} />
            <Chart
              activeView={activeView}
              settings={settings}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              activeChartIdx={activeChartIdx}
            />
          </div>

          <BottomNav
            activeChartIdx={activeChartIdx}
            chartsList={chartsList}
            onPrev={() => setActiveChartIdx(i => Math.max(0, i - 1))}
            onNext={() => setActiveChartIdx(i => Math.min(chartsList.length - 1, i + 1))}
          />
        </div>
      )}
    </div>
  )
}