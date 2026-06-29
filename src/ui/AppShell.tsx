import { useEffect } from 'react'
import { GlobeScene } from '../core/globe/GlobeScene'
import { RegionSidebar } from './RegionSidebar'
import { StatePanel } from './StatePanel'
import { GlobeOverlay } from './GlobeOverlay'
import { GoaInclusionToggle } from './atlas/GoaInclusionToggle'
import { GlobeControls } from './GlobeControls'
import { useRegionStore } from '../core/store/useRegionStore'
import type { LoadedDataset } from '../core/dataset/types'
import type { WorldBoundariesCollection } from '../core/dataset/loadWorldBorders'

interface AppShellProps {
  dataset: LoadedDataset
  worldBoundaries: WorldBoundariesCollection
}

export function AppShell({ dataset, worldBoundaries }: AppShellProps) {
  const setDataset = useRegionStore((s) => s.setDataset)
  const selectedId = useRegionStore((s) => s.selectedId)
  const clearSelection = useRegionStore((s) => s.clearSelection)

  useEffect(() => {
    setDataset(dataset)
  }, [dataset, setDataset])

  useEffect(() => {
    if (!selectedId) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (
        target.closest('.region-detail-card') ||
        target.closest('.region-sidebar') ||
        target.closest('.sidebar-toggle') ||
        target.closest('.globe-controls') ||
        target.closest('.globe-controls-wrap') ||
        target.closest('.border-controls') ||
        target.closest('.ui-tweaks-panel') ||
        target.closest('.goa-toggle') ||
        target.closest('.globe-analysis-bar') ||
        target.closest('.globe-canvas') ||
        target.closest('.state-panel') ||
        target.closest('.metric-selector') ||
        target.closest('.globe-overlay')
      ) {
        return
      }
      clearSelection()
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [selectedId, clearSelection])

  return (
    <div className="app-shell">
      <RegionSidebar />
      <main className={`globe-stage${selectedId ? ' globe-stage--panel-open' : ''}`}>
        <div className="globe-analysis-bar">
          <GoaInclusionToggle />
        </div>
        <div className="globe-stage__viewport">
          <GlobeScene dataset={dataset} worldBoundaries={worldBoundaries} />
          <GlobeOverlay />
          <GlobeControls />
        </div>
      </main>
      <StatePanel />
    </div>
  )
}
