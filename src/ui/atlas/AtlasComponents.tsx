import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  note: string
}

export function KpiCard({ label, value, note }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <b>{value}</b>
      <p>{note}</p>
    </article>
  )
}

interface ViewHeaderProps {
  kicker: string
  title: string
  children?: ReactNode
}

export function ViewHeader({ kicker, title, children }: ViewHeaderProps) {
  return (
    <div className="view-header">
      <p className="panel-kicker">{kicker}</p>
      <h2>{title}</h2>
      {children ? <p className="view-header__lead">{children}</p> : null}
    </div>
  )
}

interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

export function Sparkline({ data, color, width = 180, height = 40 }: SparklineProps) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const last = pts.split(' ').pop()?.split(',') ?? ['0', '0']

  return (
    <svg width={width} height={height} className="sparkline" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

interface MiniBarProps {
  value: number
  max: number
  color: string
  label?: string
}

export function MiniBar({ value, max, color, label }: MiniBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="mini-bar">
      {label ? <span className="mini-bar__label">{label}</span> : null}
      <div className="mini-bar__track">
        <div className="mini-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="mini-bar__value">{value.toFixed(1)}%</span>
    </div>
  )
}
