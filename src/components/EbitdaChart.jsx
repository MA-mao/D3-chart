import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const data = [
  { year: 2014, value: 33.6, yoy: 8 },
  { year: 2015, value: 25.2, yoy: -25 },
  { year: 2016, value: 33.5, yoy: 33 },
  { year: 2017, value: 40.9, yoy: 22 },
  { year: 2018, value: 49.5, yoy: 21 },
  { year: 2019, value: 58.1, yoy: 17 },
  { year: 2020, value: 68.4, yoy: 18 },
  { year: 2021, value: 85.1, yoy: 24 },
  { year: 2022, value: 100, yoy: 18 },
  { year: 2023, value: 105, yoy: 5 },
  { year: 2024, value: 133, yoy: 27 },
  { year: 2025, value: 160, yoy: 20 },
  { year: 2026, value: 172, yoy: 7 },
  { year: 2027, value: 198, yoy: 15 },
  { year: 2028, value: 231, yoy: 17 },
  { year: 2029, value: 273, yoy: 18 },
  { year: 2030, value: 337, yoy: 23 },
]

const FUTURE_START = 2026

export default function EbitdaChart() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const w = entry.contentRect.width
        setDimensions({ width: w, height: Math.max(300, w * 0.5) })
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const margin = { top: 40, right: 60, bottom: 50, left: 20 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, innerW])
      .padding(0.25)

    const y = d3.scaleLinear()
      .domain([0, 380])
      .range([innerH, 0])

    // Future shaded region
    const futureX = x(FUTURE_START)
    g.append('rect')
      .attr('x', futureX)
      .attr('y', 0)
      .attr('width', innerW - futureX)
      .attr('height', innerH)
      .attr('fill', '#f0faf0')

    // Past / Future labels
    g.append('text')
      .attr('x', futureX - 10)
      .attr('y', 16)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('fill', '#999')
      .text('Past')

    g.append('text')
      .attr('x', futureX + 10)
      .attr('y', 16)
      .attr('text-anchor', 'start')
      .attr('font-size', 11)
      .attr('fill', '#4caf50')
      .text('Future')

    // Grid lines
    const yTicks = [0, 50, 100, 150, 200, 250, 300, 350]
    yTicks.forEach(tick => {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick))
        .attr('stroke', '#e8e8e8')
        .attr('stroke-width', 1)
    })

    // Y axis right side
    yTicks.forEach(tick => {
      g.append('text')
        .attr('x', innerW + 5)
        .attr('y', y(tick) + 4)
        .attr('font-size', 10)
        .attr('fill', '#999')
        .text(`$${tick}B`)
    })

    // Defs for rounded bars
    const defs = svg.append('defs')

    // Bars
    const barGroups = g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')

    barGroups.each(function (d) {
      const grp = d3.select(this)
      const bx = x(d.year)
      const bw = x.bandwidth()
      const by = y(d.value)
      const bh = innerH - y(d.value)
      const isFuture = d.year >= FUTURE_START
      const color = isFuture ? '#2e7d32' : '#66bb6a'
      const r = 4

      // Rounded top bar path
      grp.append('path')
        .attr('d', `
          M ${bx},${by + r}
          Q ${bx},${by} ${bx + r},${by}
          L ${bx + bw - r},${by}
          Q ${bx + bw},${by} ${bx + bw},${by + r}
          L ${bx + bw},${by + bh}
          L ${bx},${by + bh}
          Z
        `)
        .attr('fill', color)
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .delay((_, i) => i * 40)
        .attr('opacity', 1)

      // Value label on top
      grp.append('text')
        .attr('x', bx + bw / 2)
        .attr('y', by - 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', Math.max(8, Math.min(11, bw * 0.28)))
        .attr('font-weight', '600')
        .attr('fill', '#222')
        .text(`$${d.value}B`)

      // YoY label
      grp.append('text')
        .attr('x', bx + bw / 2)
        .attr('y', by - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', Math.max(7, Math.min(10, bw * 0.25)))
        .attr('fill', d.yoy < 0 ? '#e53935' : '#2e7d32')
        .text(`${d.yoy > 0 ? '+' : ''}${d.yoy}%`)
    })

    // X axis labels
    g.selectAll('.x-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', d => x(d.year) + x.bandwidth() / 2)
      .attr('y', innerH + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', Math.max(8, Math.min(12, innerW / data.length * 0.6)))
      .attr('fill', '#555')
      .text(d => d.year)

    // Hover overlay bars
    const hoverRef = { line: null, rightLabel: null }

    g.selectAll('.hover-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'hover-bar')
      .attr('x', d => x(d.year))
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        const bx = x(d.year)
        const bw = x.bandwidth()
        const yVal = y(d.value)

        // Dashed line
        if (hoverRef.line) hoverRef.line.remove()
        hoverRef.line = g.append('line')
          .attr('x1', 0).attr('x2', innerW)
          .attr('y1', yVal).attr('y2', yVal)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,3')

        // Right floating label
        if (hoverRef.rightLabel) hoverRef.rightLabel.remove()
        const rlG = g.append('g')
        hoverRef.rightLabel = rlG
        rlG.append('rect')
          .attr('x', innerW + 2)
          .attr('y', yVal - 10)
          .attr('width', 52)
          .attr('height', 18)
          .attr('fill', '#2e7d32')
          .attr('rx', 3)
        rlG.append('text')
          .attr('x', innerW + 28)
          .attr('y', yVal + 3)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('fill', '#fff')
          .text(`$${d.value}B`)

        setTooltip({
          x: bx + bw / 2,
          y: yVal,
          d,
          margin
        })
      })
      .on('mouseleave', function () {
        if (hoverRef.line) { hoverRef.line.remove(); hoverRef.line = null }
        if (hoverRef.rightLabel) { hoverRef.rightLabel.remove(); hoverRef.rightLabel = null }
        setTooltip(null)
      })

  }, [dimensions])

  return (
    <div style={{ padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🟩</span> Annual EBITDA <span style={{ fontSize: 18 }}>⌄</span>
          </h2>
          <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Annual EBITDA Projected To Reach $337B By 2030</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Bars', 'Table', 'Range', 'Play', 'Settings'].map((btn, i) => (
            <button key={btn} style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid #ddd',
              background: i === 0 ? '#2e7d32' : '#fff',
              color: i === 0 ? '#fff' : '#333',
              fontSize: 12, cursor: 'pointer', fontWeight: 500
            }}>{btn}</button>
          ))}
        </div>
      </div>

      {/* Stats Panel */}
      <div style={{
        display: 'inline-block', border: '1px solid #e0e0e0',
        borderRadius: 8, padding: '10px 16px', marginBottom: 12, fontSize: 13
      }}>
        {[
          { label: 'Annual EBITDA', value: '$172B', color: '#222' },
          { label: 'Last Year Growth', value: '+7.1%', color: '#2e7d32' },
          { label: 'Last 3 Years Avg Growth', value: '+21.1%', color: '#2e7d32' },
          { label: 'Next 3 Years Avg', value: '+19.8%', color: '#2e7d32' },
          { label: 'Trend', value: 'Strong Growth', color: '#2e7d32' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 32, marginBottom: 4 }}>
            <span style={{ color: '#555' }}>{row.label}</span>
            <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: tooltip.x + tooltip.margin.left,
            top: tooltip.y + tooltip.margin.top - 70,
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#777' }}>Date:</span>
              <span style={{ fontWeight: 600 }}>Dec 31, {tooltip.d.year}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#777' }}>Annual EBITDA:</span>
              <span style={{ fontWeight: 600 }}>${tooltip.d.value}B</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#777' }}>% YoY:</span>
              <span style={{ fontWeight: 600, color: tooltip.d.yoy < 0 ? '#e53935' : '#2e7d32' }}>
                {tooltip.d.yoy > 0 ? '+' : ''}{tooltip.d.yoy}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <button style={{
          flex: 1, minWidth: 140, padding: '14px 20px', borderRadius: 10,
          border: '1px solid #ddd', background: '#fff', cursor: 'pointer', textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>← BACK</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Annual Revenue</div>
          <div style={{ fontSize: 11, color: '#999' }}>Is the business growing fast?</div>
        </button>
        <button style={{
          flex: 1, minWidth: 140, padding: '14px 20px', borderRadius: 10,
          border: 'none', background: '#2e7d32', color: '#fff', cursor: 'pointer', textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>NEXT →</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Annual Earnings</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>What is the real profit?</div>
        </button>
      </div>
    </div>
  )
}