import { useRegionStore } from '../store/useRegionStore'
import type { MetricDef } from '../dataset/types'

export function useActiveMetric(): MetricDef | null {
  const dataset = useRegionStore((s) => s.dataset)
  const activeMetricKey = useRegionStore((s) => s.activeMetricKey)
  const metrics = dataset?.config.metrics
  if (!metrics?.length) return null
  if (activeMetricKey) {
    const found = metrics.find((m) => m.key === activeMetricKey)
    if (found) return found
  }
  return metrics.find((m) => m.default) ?? metrics[0]
}
