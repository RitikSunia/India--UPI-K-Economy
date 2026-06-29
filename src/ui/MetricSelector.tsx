import { useRegionStore } from '../core/store/useRegionStore'

export function MetricSelector() {
  const metrics = useRegionStore((s) => s.dataset?.config.metrics)
  const activeMetricKey = useRegionStore((s) => s.activeMetricKey)
  const setActiveMetricKey = useRegionStore((s) => s.setActiveMetricKey)

  if (!metrics?.length) return null

  return (
    <div className="metric-selector" role="group" aria-label="Choropleth metric">
      <span className="metric-selector__label">Color by</span>
      <div className="metric-selector__options">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            type="button"
            className={`metric-selector__btn${activeMetricKey === metric.key ? ' active' : ''}`}
            aria-pressed={activeMetricKey === metric.key}
            onClick={() => setActiveMetricKey(metric.key)}
          >
            {metric.label}
          </button>
        ))}
      </div>
    </div>
  )
}
