export default function Tooltip({ tooltip, dimensions }) {
  if (!tooltip) return null

  const { bx, bw, yVal, d, margin, width } = tooltip

  const tipW = 210
  const centerX = bx + bw / 2 + margin.left
  let left = centerX - tipW / 2
  if (left < 4) left = 4
  if (left + tipW > width - 4) left = width - tipW - 4
  const top = Math.max(4, yVal + margin.top - 95)

  return (
    <div
      className="tooltip"
      style={{ left, top, width: tipW }}
    >
      <div className="tooltip-row">
        <span className="tooltip-label">Date:</span>
        <span className="tooltip-value">Dec 31, {d.year}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Annual EBITDA:</span>
        <span className="tooltip-value">${d.value}B</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">% YoY:</span>
        <span
          className="tooltip-value"
          style={{ color: d.yoy < 0 ? '#dc2626' : '#16a34a' }}
        >
          {d.yoy > 0 ? '+' : ''}{d.yoy}%
        </span>
      </div>
    </div>
  )
}