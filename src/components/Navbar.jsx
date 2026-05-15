export default function Navbar({ activeNav, setActiveNav }) {
  return (
    <nav className="navbar">
      <button
        className={`navbar-btn ${activeNav === 'ManyCharts' ? 'active' : ''}`}
        onClick={() => setActiveNav('ManyCharts')}
      >
        <svg width="13" height="13" viewBox="0 0 14 14">
          <rect x="0" y="4" width="3" height="9" fill="currentColor"/>
          <rect x="5" y="2" width="3" height="11" fill="currentColor"/>
          <rect x="10" y="0" width="3" height="13" fill="currentColor"/>
        </svg>
        Many Charts
      </button>
      <button
        className={`navbar-btn ${activeNav === 'Analysis' ? 'active' : ''}`}
        onClick={() => setActiveNav('Analysis')}
      >
        <svg width="13" height="13" viewBox="0 0 14 14">
          <polyline points="1,11 5,5 8,8 13,2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        Analysis
      </button>
    </nav>
  )
}