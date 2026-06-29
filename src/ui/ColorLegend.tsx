import { useActiveMetric } from '../core/metrics/useActiveMetric'
import {
  formatDomainValue,
  metricGradient,
} from '../core/metrics/metricColor'

export function ColorLegend() {
  const metric = useActiveMetric()
  if (!metric) return null

  const [min, max] = metric.domain

  return (
    <div className="color-legend" aria-label={`${metric.label} scale`}>
      <p className="color-legend__label">{metric.label}</p>
      <div
        className="color-legend__bar"
        style={{ background: metricGradient(metric) }}
        role="img"
        aria-hidden="true"
      />
      <div className="color-legend__ticks">
        <span>{formatDomainValue(min, metric)}</span>
        <span>{metric.unit}</span>
        <span>{formatDomainValue(max, metric)}</span>
      </div>
    </div>
  )
}
