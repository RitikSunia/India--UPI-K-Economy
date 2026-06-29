import { useRegionStore } from '../core/store/useRegionStore'

export function GlobeTitle() {
  const config = useRegionStore((s) => s.dataset?.config)
  if (!config) return null

  return (
    <div className="globe-title" aria-hidden="false">
      {config.subtitle ? (
        <p className="globe-title__subtitle">{config.subtitle}</p>
      ) : null}
      <h1 className="globe-title__heading">{config.title}</h1>
    </div>
  )
}
