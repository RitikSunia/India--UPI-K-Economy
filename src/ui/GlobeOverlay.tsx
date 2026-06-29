import { GlobeTitle } from './GlobeTitle'
import { MetricSelector } from './MetricSelector'
import { ColorLegend } from './ColorLegend'

export function GlobeOverlay() {
  return (
    <div className="globe-overlay" aria-hidden={false}>
      <div className="globe-overlay__top">
        <GlobeTitle />
        <MetricSelector />
      </div>
      <ColorLegend />
    </div>
  )
}
