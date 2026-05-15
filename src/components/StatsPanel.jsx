import { statsData } from '../data/chartData'

const icons = {
  bar: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="1" y="8" width="3" height="7" fill="#22c55e"/>
      <rect x="6" y="5" width="3" height="10" fill="#22c55e"/>
      <rect x="11" y="2" width="3" height="13" fill="#22c55e"/>
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polyline points="1,12 6,6 10,9 15,3" fill="none" stroke="#22c55e" strokeWidth="2"/>
      <polyline points="11,3 15,3 15,7" fill="none" stroke="#22c55e" strokeWidth="2"/>
    </svg>
  ),
  wave: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polyline points="1,8 4,4 7,10 10,6 13,8 16,5" fill="none" stroke="#f97316" strokeWidth="2"/>
    </svg>
  ),
  star: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" fill="#eab308"/>
    </svg>
  ),
  warn: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polygon points="8,1 15,14 1,14" fill="none" stroke="#ef4444" strokeWidth="2"/>
      <line x1="8" y1="6" x2="8" y2="10" stroke="#ef4444" strokeWidth="2"/>
      <circle cx="8" cy="12" r="1" fill="#ef4444"/>
    </svg>
  ),
}

export default function StatsPanel() {
  return (
    <div className="stats-panel">
      {statsData.map(row => (
        <div key={row.label} className="stats-row">
          <div className="stats-label">
            {icons[row.icon]}
            <span>{row.label}</span>
          </div>
          <span className="stats-value" style={{ color: row.color }}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}