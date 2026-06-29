import type { MetricDef } from '../dataset/types'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

export function interpolateRamp(ramp: string[], t: number): string {
  if (!ramp.length) return '#46d6b2'
  if (ramp.length === 1) return ramp[0]
  const clamped = Math.min(1, Math.max(0, t))
  const segments = ramp.length - 1
  const scaled = clamped * segments
  const idx = Math.min(Math.floor(scaled), segments - 1)
  const localT = scaled - idx
  return lerpColor(ramp[idx], ramp[idx + 1], localT)
}

export function getMetricColor(
  value: number | null | undefined,
  metric: MetricDef,
): string {
  if (value == null || Number.isNaN(value)) return '#7c93a3'
  const [min, max] = metric.domain
  const t = max === min ? 0.5 : (value - min) / (max - min)
  return interpolateRamp(metric.ramp, t)
}

export function metricGradient(metric: MetricDef): string {
  return `linear-gradient(90deg, ${metric.ramp.join(', ')})`
}

export function formatMetricValue(
  value: number | null | undefined,
  metric: MetricDef,
): string {
  if (value == null || Number.isNaN(value)) return '—'
  const decimals =
    metric.key === 'k_economy_score'
      ? 1
      : metric.key === 'upi_txn_per_capita'
        ? 2
        : metric.key === 'mgnrega_days_lakh_2324'
          ? 2
          : 0
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDomainValue(value: number, metric: MetricDef): string {
  if (metric.key === 'mgnrega_days_lakh_2324' && value >= 100) {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  }
  if (metric.key === 'upi_txn_per_capita') {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 1 })
  }
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
