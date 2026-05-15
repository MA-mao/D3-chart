const MicrosoftLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
    <rect x="13" y="0" width="11" height="11" fill="#7FBA00"/>
    <rect x="0" y="13" width="11" height="11" fill="#00A4EF"/>
    <rect x="13" y="13" width="11" height="11" fill="#FFB900"/>
  </svg>
)

const buttons = [
  { label: 'Bars', icon: '▦' },
  { label: 'Table', icon: '⊞' },
  { label: 'Range', icon: '⊡' },
  { label: 'Play', icon: '▶' },
  { label: 'Settings', icon: '⋮' },
]

const subtitles = [
  'Annual EBITDA Projected To Reach $337B By 2030',
  'Annual Revenue Projected To Reach $644B By 2030',
  'Annual EPS Diluted Projected To Reach $33.4 By 2030',
  'Annual EPS Basic Projected To Reach $33.4 By 2030',
  'Quarterly Revenue Projected To Reach $88B By Jun 2027',
  'Annual Earnings Projected To Reach $249B By 2030',
]

export default function Header({
  activeView, setActiveView, showSettings, onSettingsClick,
  isPlaying, activeChartIdx, chartsList, settingsBtnRef
}) {
  const title = chartsList?.[activeChartIdx] || 'Annual EBITDA'
  const subtitle = subtitles[activeChartIdx] || subtitles[0]

  return (
    <div className="header-row">
      <div className="header-left">
        <h1>
          <MicrosoftLogo />
          {title}
          <span className="chevron">▾</span>
        </h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="top-buttons">
        {buttons.map(btn => {
          const isActive = btn.label === 'Settings' ? showSettings : activeView === btn.label
          return (
            <button
              key={btn.label}
              ref={btn.label === 'Settings' ? settingsBtnRef : null}
              className={`top-btn ${isActive ? 'active' : ''}`}
              onClick={() => btn.label === 'Settings' ? onSettingsClick() : setActiveView(btn.label)}
            >
              {btn.label === 'Play' && isPlaying
                ? <><span>⏸</span> Pause</>
                : <><span>{btn.icon}</span> {btn.label}</>
              }
            </button>
          )
        })}
      </div>
    </div>
  )
}