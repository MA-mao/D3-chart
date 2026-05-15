import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { allChartsData } from '../data/chartData'

const MARGIN = { top: 30, right: 72, bottom: 36, left: 10 }
const INNER_H = 360

export default function Chart({ activeView, settings, isPlaying, setIsPlaying, activeChartIdx }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const playRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [floatingLabels, setFloatingLabels] = useState([])
  const [dims, setDims] = useState({ width: 900 })
  const settingsRef = useRef(settings)
  const dimsRef = useRef(dims)

  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { dimsRef.current = dims }, [dims])

  const totalH = INNER_H + MARGIN.top + MARGIN.bottom
  const chartInfo = allChartsData[activeChartIdx] || allChartsData[0]
  const currentData = chartInfo.data

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (let e of entries) setDims({ width: e.contentRect.width })
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setTooltip(null)
    setFloatingLabels([])
    clearInterval(playRef.current)
    setIsPlaying(false)
    if (activeView === 'Bars') drawBars(dims.width, null)
    else if (activeView === 'Table') drawTable(dims.width)
    else if (activeView === 'Range') drawRange(dims.width)
    else if (activeView === 'Play') startPlay()
  }, [activeView, settings, dims, activeChartIdx])

  function getColors() {
    const c = settings.customColor || '#16a34a'
    const r = parseInt(c.slice(1,3),16)
    const g = parseInt(c.slice(3,5),16)
    const b = parseInt(c.slice(5,7),16)
    return { past: `rgba(${r},${g},${b},0.5)`, future: c }
  }

  function drawBars(width, upTo, skipAnim = false) {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const s = settingsRef.current
    const colors = getColors()
    const innerW = width - MARGIN.left - MARGIN.right

    const x = d3.scaleBand()
      .domain(currentData.map(d => d.year))
      .range([0, innerW]).padding(0.50)

    const maxVal = d3.max(currentData, d => d.value)
    const yMax = maxVal < 10 ? Math.ceil(maxVal*1.3*10)/10 : Math.ceil(maxVal*1.2/50)*50
    const y = d3.scaleLinear().domain([0, yMax]).range([INNER_H, 0])
    const bw = x.bandwidth()

    const futureIdx = currentData.findIndex(d => d.year >= chartInfo.futureStart)
    const futureX = futureIdx >= 0 ? x(currentData[futureIdx].year) : null

    svg.attr('width', width).attr('height', totalH)
    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const yTicks = y.ticks(5)

    // Grid
    if (s.showGrid) {
      yTicks.forEach(tick => {
        g.append('line').attr('x1',0).attr('x2',innerW).attr('y1',y(tick)).attr('y2',y(tick))
          .attr('stroke','#e5e7eb').attr('stroke-width',1)
      })
      currentData.forEach(d => {
        g.append('line').attr('x1',x(d.year)).attr('x2',x(d.year)).attr('y1',0).attr('y2',INNER_H)
          .attr('stroke','#e5e7eb').attr('stroke-width',1)
      })
      g.append('line').attr('x1',innerW).attr('x2',innerW).attr('y1',0).attr('y2',INNER_H).attr('stroke','#e5e7eb')
      g.append('line').attr('x1',0).attr('x2',innerW).attr('y1',0).attr('y2',0).attr('stroke','#e5e7eb')
    }

    // Future region
    if (futureX !== null) {
      g.append('rect').attr('x',futureX).attr('y',0)
        .attr('width',innerW-futureX).attr('height',INNER_H).attr('fill','#f0fdf4')
      g.append('line').attr('x1',futureX).attr('x2',innerW).attr('y1',0).attr('y2',0)
        .attr('stroke','#16a34a').attr('stroke-width',2)
      g.append('polygon').attr('points',`${innerW},0 ${innerW+10},0 ${innerW},12`).attr('fill','#16a34a')
      g.append('text').attr('x',futureX-6).attr('y',14).attr('text-anchor','end')
        .attr('font-size',10).attr('fill','#9ca3af').text('Past')
      g.append('text').attr('x',futureX+6).attr('y',14).attr('text-anchor','start')
        .attr('font-size',10).attr('fill','#16a34a').attr('font-weight','500').text('Future')
    }

    // Y axis
    yTicks.forEach(tick => {
      const lbl = tick>=1000 ? `$${(tick/1000).toFixed(1)}T` : `$${tick}B`
      g.append('text').attr('x',innerW+6).attr('y',y(tick)+4)
        .attr('font-size',10).attr('fill','#9ca3af').text(lbl)
    })

    // Last bar info
    const lastD = currentData[currentData.length-1]
    const lastY = y(lastD.value)
    const lastLbl = lastD.value>=1000 ? `$${(lastD.value/1000).toFixed(1)}T` : `$${lastD.value}B`

    // Draw bars
    const visibleData = upTo !== null ? currentData.filter((_,i)=>i<=upTo) : currentData
    visibleData.forEach((d, i) => {
      const bx = x(d.year), by = y(d.value), bh = INNER_H-by
      const fill = d.year >= chartInfo.futureStart ? colors.future : colors.past
      const r = 4
      g.append('path')
        .attr('d',`M${bx},${by+r} Q${bx},${by} ${bx+r},${by} L${bx+bw-r},${by} Q${bx+bw},${by} ${bx+bw},${by+r} L${bx+bw},${by+bh} L${bx},${by+bh} Z`)
        .attr('fill',fill).attr('opacity', skipAnim?1:0)
        .transition().duration(skipAnim?0:550).delay(skipAnim?0:i*38)
        .attr('opacity',1)

      if (s.showLabels && by>20) {
        const fs = Math.max(8,Math.min(11,bw*0.24))
        const lbl = d.value>=1000?`$${(d.value/1000).toFixed(1)}T`:`$${d.value}B`
        g.append('text').attr('x',bx+bw/2).attr('y',by-(s.showPercent?14:5))
          .attr('text-anchor','middle').attr('font-size',fs).attr('font-weight','600').attr('fill','#111').text(lbl)
      }
      if (s.showPercent && d.yoy!==undefined && by>20) {
        const fs = Math.max(7,Math.min(10,bw*0.21))
        g.append('text').attr('x',bx+bw/2).attr('y',by-3)
          .attr('text-anchor','middle').attr('font-size',fs)
          .attr('fill',d.yoy<0?'#dc2626':'#16a34a')
          .text(`${d.yoy>0?'+':''}${d.yoy}%`)
      }
    })

    // X axis
    currentData.forEach(d => {
      g.append('text').attr('x',x(d.year)+bw/2).attr('y',INNER_H+24)
        .attr('text-anchor','middle').attr('font-size',10).attr('fill','#6b7280').text(d.year)
    })

    // Default: show last bar label
    setFloatingLabels([{ top: lastY+MARGIN.top, value: lastLbl, dim: false }])

    // Hover
    if (upTo===null) {
      const hs = { col:null, hl:null, vl:null }
      currentData.forEach(d => {
        const bx = x(d.year), yVal = y(d.value), cx = bx+bw/2
        const valLbl = d.value>=1000?`$${(d.value/1000).toFixed(1)}T`:`$${d.value}B`

        g.append('rect').attr('x',bx).attr('y',0).attr('width',bw).attr('height',INNER_H)
          .attr('fill','transparent').style('cursor','crosshair')
          .on('mouseenter', function() {
            if (hs.col) hs.col.remove()
            hs.col = g.insert('rect',':first-child')
              .attr('x',bx).attr('y',0).attr('width',bw).attr('height',INNER_H)
              .attr('fill','rgba(0,0,0,0.04)')

            if (hs.hl) hs.hl.remove()
            hs.hl = g.append('line')
              .attr('x1',0).attr('x2',innerW).attr('y1',yVal).attr('y2',yVal)
              .attr('stroke','#6b7280').attr('stroke-width',1).attr('stroke-dasharray','5,3')

            if (hs.vl) hs.vl.remove()
            hs.vl = g.append('line')
              .attr('x1',cx).attr('x2',cx).attr('y1',yVal).attr('y2',INNER_H)
              .attr('stroke','#6b7280').attr('stroke-width',1).attr('stroke-dasharray','5,3')

            // 2 floating labels
            setFloatingLabels([
              { top: lastY+MARGIN.top, value: lastLbl, dim: true },
              { top: yVal+MARGIN.top, value: valLbl, dim: false },
            ])

            if (s.showTooltip) setTooltip({ bx, bw, yVal, d, innerW, width })
          })
          .on('mouseleave', function() {
            if (hs.col) { hs.col.remove(); hs.col=null }
            if (hs.hl) { hs.hl.remove(); hs.hl=null }
            if (hs.vl) { hs.vl.remove(); hs.vl=null }
            setFloatingLabels([{ top: lastY+MARGIN.top, value: lastLbl, dim: false }])
            setTooltip(null)
          })
      })
    }
  }

  function drawTable(width) {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    setFloatingLabels([])
    const rowH = 34, tH = (currentData.length+1)*rowH+10
    svg.attr('width',width).attr('height',tH)
    const g = svg.append('g').attr('transform','translate(0,5)')
    const colW = width/3
    const cols = ['Period','Value','YoY %']

    cols.forEach((col,i) => {
      g.append('rect').attr('x',i*colW).attr('y',0).attr('width',colW).attr('height',rowH).attr('fill','#f9fafb')
      g.append('line').attr('x1',i*colW).attr('x2',i*colW).attr('y1',0).attr('y2',tH).attr('stroke','#e5e7eb')
      g.append('text').attr('x',i*colW+colW/2).attr('y',rowH/2+5)
        .attr('text-anchor','middle').attr('font-size',13).attr('font-weight','600').attr('fill','#374151').text(col)
    })
    g.append('line').attr('x1',width-1).attr('x2',width-1).attr('y1',0).attr('y2',tH).attr('stroke','#e5e7eb')

    currentData.forEach((d,i) => {
      const ry = (i+1)*rowH
      g.append('rect').attr('x',0).attr('y',ry).attr('width',width).attr('height',rowH)
        .attr('fill', d.year>=chartInfo.futureStart?'#f0fdf4':i%2===0?'#fff':'#f9fafb')
      g.append('line').attr('x1',0).attr('x2',width).attr('y1',ry).attr('y2',ry).attr('stroke','#e5e7eb')
      const vl = d.value>=1000?`$${(d.value/1000).toFixed(1)}T`:`$${d.value}B`
      const vals = [`${d.year}`, vl, d.yoy!==undefined?`${d.yoy>0?'+':''}${d.yoy}%`:'—']
      vals.forEach((val,j) => {
        g.append('text').attr('x',j*colW+colW/2).attr('y',ry+rowH/2+5)
          .attr('text-anchor','middle').attr('font-size',12)
          .attr('fill',j===2&&d.yoy!==undefined?(d.yoy<0?'#dc2626':'#16a34a'):'#374151')
          .attr('font-weight',j===2?'600':'400').text(val)
      })
    })
  }

  function drawRange(width) {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    setFloatingLabels([])
    const s = settingsRef.current
    const colors = getColors()
    const innerW = width-MARGIN.left-MARGIN.right
    svg.attr('width',width).attr('height',totalH)
    const g = svg.append('g').attr('transform',`translate(${MARGIN.left},${MARGIN.top})`)
    const maxVal = d3.max(currentData, d=>d.value)
    const yMax = maxVal<10?Math.ceil(maxVal*1.3):Math.ceil(maxVal*1.2/50)*50
    const x = d3.scaleLinear().domain([0,currentData.length-1]).range([0,innerW])
    const y = d3.scaleLinear().domain([0,yMax]).range([INNER_H,0])
    const yTicks = y.ticks(5)

    if (s.showGrid) {
      yTicks.forEach(tick => {
        g.append('line').attr('x1',0).attr('x2',innerW).attr('y1',y(tick)).attr('y2',y(tick)).attr('stroke','#e5e7eb')
      })
    }
    yTicks.forEach(tick => {
      const lbl = tick>=1000?`$${(tick/1000).toFixed(1)}T`:`$${tick}B`
      g.append('text').attr('x',innerW+6).attr('y',y(tick)+4).attr('font-size',10).attr('fill','#9ca3af').text(lbl)
    })

    const area = d3.area().x((_,i)=>x(i)).y0(INNER_H).y1(d=>y(d.value)).curve(d3.curveMonotoneX)
    const line = d3.line().x((_,i)=>x(i)).y(d=>y(d.value)).curve(d3.curveMonotoneX)
    g.append('path').datum(currentData).attr('d',area).attr('fill',colors.past).attr('opacity',0.3)
    g.append('path').datum(currentData).attr('d',line).attr('fill','none').attr('stroke',colors.future).attr('stroke-width',2.5)
    currentData.forEach((d,i) => {
      g.append('circle').attr('cx',x(i)).attr('cy',y(d.value)).attr('r',4)
        .attr('fill',colors.future).attr('stroke','#fff').attr('stroke-width',2)
    })
    const step = Math.ceil(currentData.length/6)
    currentData.forEach((d,i) => {
      if (i%step===0||i===currentData.length-1) {
        g.append('text').attr('x',x(i)).attr('y',INNER_H+20)
          .attr('text-anchor','middle').attr('font-size',10).attr('fill','#6b7280').text(d.year)
      }
    })
  }

  function startPlay() {
    clearInterval(playRef.current)
    setIsPlaying(true)
    setFloatingLabels([])
    let i = 0
    drawBars(dimsRef.current.width, 0, true)
    playRef.current = setInterval(() => {
      i++
      if (i>=currentData.length) {
        clearInterval(playRef.current)
        setTimeout(() => { setIsPlaying(false); drawBars(dimsRef.current.width,null,false) }, 600)
        return
      }
      drawBars(dimsRef.current.width, i, true)
    }, 500)
  }

  useEffect(() => () => clearInterval(playRef.current), [])

  const getTipPos = () => {
    if (!tooltip) return {}
    const { bx, bw, yVal, width } = tooltip
    const cx = bx+MARGIN.left+bw/2
    const tipW = 195
    let left = cx-tipW/2
    if (left<4) left=4
    if (left+tipW>width-4) left=width-tipW-4
    return { left, top: Math.max(4, yVal+MARGIN.top+8), width: tipW }
  }

  const tipPos = getTipPos()

  return (
    <div className="chart-outer" ref={containerRef}>
      {/* Floating right labels */}
      {floatingLabels.map((fl, idx) => (
        <div key={idx} style={{
          position: 'absolute', right: 0, top: fl.top,
          background: '#16a34a', color: '#fff',
          fontSize: 10, fontWeight: 600, padding: '2px 7px',
          borderRadius: 3, pointerEvents: 'none', zIndex: 10,
          transform: 'translateY(-50%)', whiteSpace: 'nowrap',
          opacity: fl.dim ? 0.6 : 1,
          transition: 'top 0.1s ease',
        }}>
          {fl.value}
        </div>
      ))}

      {/* Tooltip */}
      {tooltip && settings.showTooltip && (
        <div className="tooltip" style={{
          left: tipPos.left, top: tipPos.top, width: tipPos.width,
          transition: 'left 0.08s ease, top 0.08s ease',
        }}>
          <div className="tooltip-row">
            <span className="tooltip-label">Date:</span>
            <span className="tooltip-value">Dec 31, {tooltip.d.year}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">{chartInfo.title}:</span>
            <span className="tooltip-value">
              {tooltip.d.value>=1000?`$${(tooltip.d.value/1000).toFixed(1)}T`:`$${tooltip.d.value}B`}
            </span>
          </div>
          {tooltip.d.yoy!==undefined && (
            <div className="tooltip-row">
              <span className="tooltip-label">% YoY:</span>
              <span className="tooltip-value" style={{ color: tooltip.d.yoy<0?'#dc2626':'#16a34a' }}>
                {tooltip.d.yoy>0?'+':''}{tooltip.d.yoy}%
              </span>
            </div>
          )}
        </div>
      )}

      <svg ref={svgRef} style={{ display: 'block', width: '100% ' }} />
    </div>
  )
}