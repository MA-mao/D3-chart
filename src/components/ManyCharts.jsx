import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { allChartsData } from '../data/chartData'

const MicrosoftLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
    <rect x="13" y="0" width="11" height="11" fill="#7FBA00"/>
    <rect x="0" y="13" width="11" height="11" fill="#00A4EF"/>
    <rect x="13" y="13" width="11" height="11" fill="#FFB900"/>
  </svg>
)

function MiniChart({ chartInfo, onClick }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = 300, H = 160
    const m = { top: 28, right: 48, bottom: 20, left: 6 }
    const iW = W - m.left - m.right
    const iH = H - m.top - m.bottom

    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', 'auto')
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const x = d3.scaleBand()
      .domain(chartInfo.data.map(d => d.year))
      .range([0, iW]).padding(0.2)

    const maxVal = d3.max(chartInfo.data, d => d.value)
    const yMax = maxVal < 10 ? Math.ceil(maxVal * 1.3) : Math.ceil(maxVal * 1.2 / 10) * 10
    const y = d3.scaleLinear().domain([0, yMax]).range([iH, 0])
    const bw = x.bandwidth()

    // Future region
    const futureIdx = chartInfo.data.findIndex(d =>
      chartInfo.isQuarterly ? d.year >= chartInfo.futureStart : d.year >= chartInfo.futureStart
    )
    if (futureIdx > 0) {
      const futureX = x(chartInfo.data[futureIdx].year)
      g.append('rect').attr('x', futureX).attr('y', 0)
        .attr('width', iW - futureX).attr('height', iH).attr('fill', '#f0fdf4')
      g.append('line').attr('x1', futureX).attr('x2', iW).attr('y1', 0).attr('y2', 0)
        .attr('stroke', '#16a34a').attr('stroke-width', 1.5)
      g.append('polygon').attr('points', `${iW},0 ${iW + 7},0 ${iW},7`).attr('fill', '#16a34a')
      g.append('text').attr('x', futureX - 3).attr('y', -3)
        .attr('text-anchor', 'end').attr('font-size', 6).attr('fill', '#9ca3af').text('Past')
      g.append('text').attr('x', futureX + 3).attr('y', -3)
        .attr('text-anchor', 'start').attr('font-size', 6).attr('fill', '#16a34a').text('Future')
    }

    // Grid
    y.ticks(3).forEach(tick => {
      g.append('line').attr('x1', 0).attr('x2', iW).attr('y1', y(tick)).attr('y2', y(tick))
        .attr('stroke', '#e5e7eb').attr('stroke-width', 0.5)
      const label = tick >= 1000 ? `$${(tick/1000).toFixed(0)}T` : tick >= 1 ? `$${tick}B` : `$${tick}`
      g.append('text').attr('x', iW + 3).attr('y', y(tick) + 3).attr('font-size', 5.5).attr('fill', '#9ca3af').text(label)
    })

    // Bars
    chartInfo.data.forEach((d, i) => {
      const bx = x(d.year)
      const by = y(d.value)
      const bh = iH - by
      const isFuture = d.year >= chartInfo.futureStart
      const fill = isFuture ? '#16a34a' : '#4ade80'
      const r = 1.5

      g.append('path')
        .attr('d', `M${bx},${by+r} Q${bx},${by} ${bx+r},${by} L${bx+bw-r},${by} Q${bx+bw},${by} ${bx+bw},${by+r} L${bx+bw},${by+bh} L${bx},${by+bh} Z`)
        .attr('fill', fill).attr('opacity', 0)
        .transition().duration(400).delay(i * 20).attr('opacity', 1)

      // Value + yoy on bar
      if (bh > 10 && bw > 6) {
        const valLabel = d.value >= 1000 ? `$${(d.value/1000).toFixed(1)}T`
          : d.value >= 1 ? `$${d.value}B` : `$${d.value}`
        g.append('text').attr('x', bx + bw/2).attr('y', by - 7)
          .attr('text-anchor', 'middle').attr('font-size', 5).attr('font-weight', '600').attr('fill', '#111')
          .text(valLabel)
        if (d.yoy !== undefined) {
          g.append('text').attr('x', bx + bw/2).attr('y', by - 2)
            .attr('text-anchor', 'middle').attr('font-size', 4.5)
            .attr('fill', d.yoy < 0 ? '#dc2626' : '#16a34a')
            .text(`${d.yoy > 0 ? '+' : ''}${d.yoy}%`)
        }
      }
    })

    // Floating right label
    const lastD = chartInfo.data[chartInfo.data.length - 1]
    const lastY = y(lastD.value)
    const lastLabel = lastD.value >= 1000 ? `$${(lastD.value/1000).toFixed(1)}T`
      : lastD.value >= 1 ? `$${lastD.value}B` : `$${lastD.value}`
    g.append('rect').attr('x', iW + 1).attr('y', lastY - 5).attr('width', 40).attr('height', 10).attr('rx', 2).attr('fill', '#16a34a')
    g.append('text').attr('x', iW + 21).attr('y', lastY + 3)
      .attr('text-anchor', 'middle').attr('font-size', 5.5).attr('fill', '#fff').attr('font-weight', '600')
      .text(lastLabel)

    // X axis
    const step = Math.ceil(chartInfo.data.length / 5)
    chartInfo.data.forEach((d, i) => {
      if (i % step === 0 || i === chartInfo.data.length - 1) {
        g.append('text').attr('x', x(d.year) + bw/2).attr('y', iH + 13)
          .attr('text-anchor', 'middle').attr('font-size', 5.5).attr('fill', '#9ca3af').text(d.year)
      }
    })
  }, [chartInfo])

  const handleDownload = (e) => {
    e.stopPropagation()
    const clone = svgRef.current.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const svgStr = new XMLSerializer().serializeToString(clone)
    const canvas = document.createElement('canvas')
    canvas.width = 600; canvas.height = 320
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 600, 320)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 600, 320)
      const a = document.createElement('a')
      a.download = `${chartInfo.title.replace(/\s+/g, '-')}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
  }

  const iconStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '3px 5px', borderRadius: 4, display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#6b7280'
  }

  return (
    <div className="mini-chart-card" onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MicrosoftLogo />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{chartInfo.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button style={{ ...iconStyle, color: '#16a34a' }} onClick={e => e.stopPropagation()}>
            <svg width="12" height="12" viewBox="0 0 16 16"><rect x="1" y="8" width="3" height="7" fill="#16a34a"/><rect x="6" y="5" width="3" height="10" fill="#16a34a"/><rect x="11" y="2" width="3" height="13" fill="#16a34a"/></svg>
          </button>
          <button style={iconStyle} onClick={e => e.stopPropagation()}>
            <svg width="12" height="12" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1" fill="none" stroke="#6b7280" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" fill="none" stroke="#6b7280" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" fill="none" stroke="#6b7280" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" fill="none" stroke="#6b7280" strokeWidth="1.5"/></svg>
          </button>
          <button style={iconStyle} onClick={handleDownload}>
            <svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 2v8M5 8l3 3 3-3M2 13h12" stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
          </button>
          <button style={iconStyle} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>⋮</span>
          </button>
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{chartInfo.subtitle}</p>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}

export default function ManyCharts({ onSelectChart }) {
  return (
    <div>
      <div className="many-charts-header">
        <h2>All Charts</h2>
        <p>Select a chart to analyze in detail</p>
      </div>
      <div className="many-charts-grid">
        {allChartsData.map((chart, idx) => (
          <MiniChart key={chart.id} chartInfo={chart} onClick={() => onSelectChart(idx)} />
        ))}
      </div>
    </div>
  )
}