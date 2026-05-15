import { useState, useRef } from 'react'

const presetColors = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b', '#9ca3af',
  '#16a34a', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04',
  '#0891b2', '#0d9488', '#db2777', '#9333ea', '#047857', '#1d4ed8',
]

function ColorPicker({ color, onChange }) {
  const canvasRef = useRef(null)
  const [hue, setHue] = useState(120)
  const [pos, setPos] = useState({ x: 0.8, y: 0.2 })
  const [hex, setHex] = useState(color || '#16a34a')
  const [rgb, setRgb] = useState({ r: 22, g: 163, b: 74 })
  const isDragging = useRef(false)
  const isHueDragging = useRef(false)

  function hsvToRgb(h, s, v) {
    h = h / 360
    let r, g, b
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
    switch (i % 6) {
      case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break
      case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break
      case 4: r=t; g=p; b=v; break; case 5: r=v; g=p; b=q; break
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) }
  }

  function toHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2,'0')).join('')
  }

  function updateColor(h, s, v) {
    const { r, g, b } = hsvToRgb(h, s, v)
    const hexVal = toHex(r, g, b)
    setRgb({ r, g, b }); setHex(hexVal); onChange(hexVal)
  }

  function handleCanvas(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setPos({ x, y }); updateColor(hue, x, 1 - y)
  }

  function handleHue(e) {
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newHue = Math.round(x * 360)
    setHue(newHue); updateColor(newHue, pos.x, 1 - pos.y)
  }

  const canvasStyle = {
    width: '100%', height: 130, borderRadius: 4, cursor: 'crosshair', display: 'block',
    background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, hsl(${hue},100%,50%))`,
  }

  return (
    <div style={{ width: 210, userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Gradient box */}
      <div
        style={{ ...canvasStyle, position: 'relative', marginBottom: 8 }}
        onMouseDown={(e) => { isDragging.current = true; handleCanvas(e) }}
        onMouseMove={(e) => { if (isDragging.current) handleCanvas(e) }}
        onMouseUp={() => { isDragging.current = false }}
        onMouseLeave={() => { isDragging.current = false }}
      >
        <div style={{
          position: 'absolute',
          left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
          transform: 'translate(-50%,-50%)',
          width: 12, height: 12, borderRadius: '50%',
          border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Hue slider */}
      <div
        style={{
          height: 12, borderRadius: 6, marginBottom: 10, cursor: 'pointer',
          position: 'relative', userSelect: 'none',
          background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
        }}
        onMouseDown={(e) => { isHueDragging.current = true; handleHue(e) }}
        onMouseMove={(e) => { if (isHueDragging.current) handleHue(e) }}
        onMouseUp={() => { isHueDragging.current = false }}
        onMouseLeave={() => { isHueDragging.current = false }}
      >
        <div style={{
          position: 'absolute', left: `${(hue/360)*100}%`, top: '50%',
          transform: 'translate(-50%,-50%)', width: 14, height: 14,
          borderRadius: '50%', border: '2px solid #fff',
          background: `hsl(${hue},100%,50%)`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Hex + RGB */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: 3, background: hex, border: '1px solid #e5e7eb', flexShrink: 0 }} />
        <input value={hex} onChange={e => {
          setHex(e.target.value)
          if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
            const r = parseInt(e.target.value.slice(1,3),16)
            const g = parseInt(e.target.value.slice(3,5),16)
            const b = parseInt(e.target.value.slice(5,7),16)
            setRgb({ r, g, b }); onChange(e.target.value)
          }
        }} style={{ width: 65, fontSize: 10, padding: '2px 4px', border: '1px solid #e5e7eb', borderRadius: 3, fontFamily: 'monospace' }} />
        {['r','g','b'].map(ch => (
          <input key={ch} type="number" min="0" max="255" value={rgb[ch]}
            onChange={e => {
              const val = Math.max(0, Math.min(255, +e.target.value))
              const nr = { ...rgb, [ch]: val }
              setRgb(nr); const hx = toHex(nr.r, nr.g, nr.b); setHex(hx); onChange(hx)
            }}
            style={{ width: 34, fontSize: 10, padding: '2px 3px', border: '1px solid #e5e7eb', borderRadius: 3, textAlign: 'center' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, paddingLeft: 28 }}>
        {['HEX','R','G','B'].map((l,i) => (
          <span key={l} style={{ fontSize: 9, color: '#9ca3af', width: i===0?65:34, textAlign: 'center' }}>{l}</span>
        ))}
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {presetColors.map(c => (
          <div key={c} onClick={() => { setHex(c); onChange(c) }} style={{
            width: 16, height: 16, borderRadius: 3, background: c, cursor: 'pointer',
            border: hex===c ? '2px solid #111' : '1px solid #e5e7eb',
          }} />
        ))}
      </div>
    </div>
  )
}

export default function Settings({ settings, setSettings }) {
  const [showPicker, setShowPicker] = useState(false)
  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '12px 14px', minWidth: 185, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      userSelect: 'none', WebkitUserSelect: 'none',
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#111' }}>Settings</h3>

      {[
        { key: 'showLabels', label: 'Show Labels' },
        { key: 'showPercent', label: 'Show % Changes' },
        { key: 'showTooltip', label: 'Show Tooltip' },
        { key: 'showGrid', label: 'Grid' },
      ].map(item => (
        <div
          key={item.key}
          onClick={() => toggle(item.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 8, fontSize: 12.5, color: '#374151',
            cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none',
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 3, flexShrink: 0,
            border: settings[item.key] ? 'none' : '1.5px solid #d1d5db',
            background: settings[item.key] ? '#16a34a' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {settings[item.key] && (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          {item.label}
        </div>
      ))}

      {/* Color */}
      <div
        onClick={() => setShowPicker(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 4, fontSize: 12.5, color: '#374151',
          cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: settings.customColor || '#16a34a',
          border: '1.5px solid #e5e7eb', flexShrink: 0,
        }} />
        Color
      </div>

      {showPicker && (
        <div style={{ marginTop: 10 }}>
          <ColorPicker
            color={settings.customColor || '#16a34a'}
            onChange={(c) => setSettings(prev => ({ ...prev, customColor: c }))}
          />
        </div>
      )}
    </div>
  )
}