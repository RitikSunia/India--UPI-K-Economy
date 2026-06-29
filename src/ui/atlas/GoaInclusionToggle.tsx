import { useAtlasStore } from '../../core/store/useAtlasStore'

export function GoaInclusionToggle() {
  const includeGoa = useAtlasStore((s) => s.includeGoa)
  const setIncludeGoa = useAtlasStore((s) => s.setIncludeGoa)

  return (
    <label className="goa-toggle" title="Goa is India's smallest state by area and population but ranks #1 on UPI intensity — excluding it can change rankings and scatter plots.">
      <input
        type="checkbox"
        checked={includeGoa}
        onChange={(e) => setIncludeGoa(e.target.checked)}
      />
      <span className="goa-toggle__label">Include Goa in analysis</span>
      <span className="goa-toggle__hint">
        {includeGoa ? 'On — Goa included in charts & aggregates' : 'Off — Goa excluded from data views'}
      </span>
    </label>
  )
}
