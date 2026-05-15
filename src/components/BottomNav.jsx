const subtitles = {
  'Annual EBITDA': 'Is the business profitable?',
  'Annual Revenue': 'Is the business growing fast?',
  'Annual EPS Diluted': 'Earnings per share diluted',
  'Annual EPS Basic': 'Earnings per share basic',
  'Quarterly Revenue': 'Quarterly revenue growth',
  'Annual Earnings': 'What is the real profit?',
}

export default function BottomNav({ activeChartIdx, chartsList, onPrev, onNext }) {
  const prevChart = activeChartIdx > 0 ? chartsList[activeChartIdx - 1] : null
  const nextChart = activeChartIdx < chartsList.length - 1 ? chartsList[activeChartIdx + 1] : null

  return (
    <div className="bottom-nav">
      <button
        className="bottom-btn back"
        onClick={onPrev}
        disabled={!prevChart}
        style={{ opacity: prevChart ? 1 : 0.4, cursor: prevChart ? 'pointer' : 'default' }}
      >
        <div className="btn-direction">← BACK</div>
        <div className="btn-title">{prevChart || '—'}</div>
        <div className="btn-sub">{subtitles[prevChart] || ''}</div>
      </button>

      <button
        className="bottom-btn next"
        onClick={onNext}
        disabled={!nextChart}
        style={{ opacity: nextChart ? 1 : 0.4, cursor: nextChart ? 'pointer' : 'default' }}
      >
        <div className="btn-direction">NEXT →</div>
        <div className="btn-title">{nextChart || '—'}</div>
        <div className="btn-sub">{subtitles[nextChart] || ''}</div>
      </button>
    </div>
  )
}