import { useAnalysisRows } from './useAnalysisRows'
import { GoaInclusionToggle } from './GoaInclusionToggle'
import type { MacroData, NationalStats } from '../../core/dataset/types'
import type { LoadedDataset } from '../../core/dataset/types'
import type { WorldBoundariesCollection } from '../../core/dataset/loadWorldBorders'
import { ATLAS_TABS, useAtlasStore } from '../../core/store/useAtlasStore'
import { AppShell } from '../AppShell'
import { KEconomyView } from './KEconomyView'
import { MethodologyView } from './MethodologyView'
import { OverviewView } from './OverviewView'
import { RankingsView } from './RankingsView'
import { ScatterView } from './ScatterView'
import { StateDetailView } from './StateDetailView'

interface AtlasAppProps {
  dataset: LoadedDataset
  national: NationalStats
  macro: MacroData
  worldBoundaries: WorldBoundariesCollection
}

export function AtlasApp({ dataset, national, macro, worldBoundaries }: AtlasAppProps) {
  const activeTab = useAtlasStore((s) => s.activeTab)
  const setActiveTab = useAtlasStore((s) => s.setActiveTab)
  const { rows, analysisNational } = useAnalysisRows(dataset.regions, national)

  return (
    <div className="atlas-app">
      <header className="atlas-header">
        <div className="atlas-brand">
          <p className="atlas-brand__kicker">India UPI & K-Economy</p>
          <h1 className="atlas-brand__title">Interactive Atlas</h1>
        </div>
        <nav className="atlas-nav" aria-label="Atlas sections">
          {ATLAS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`atlas-nav__btn${activeTab === tab.key ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab !== 'map' && (
        <div className="atlas-toolbar">
          <GoaInclusionToggle />
        </div>
      )}

      <main className={`atlas-main${activeTab === 'map' ? ' atlas-main--globe' : ''}`}>
        {activeTab === 'overview' && (
          <OverviewView rows={rows} national={analysisNational} />
        )}
        {activeTab === 'map' && (
          <AppShell dataset={dataset} worldBoundaries={worldBoundaries} />
        )}
        {activeTab === 'rankings' && <RankingsView rows={rows} />}
        {activeTab === 'scatter' && <ScatterView rows={rows} />}
        {activeTab === 'detail' && (
          <StateDetailView rows={rows} national={analysisNational} />
        )}
        {activeTab === 'methodology' && <MethodologyView />}
        {activeTab === 'k-economy' && <KEconomyView rows={rows} macro={macro} />}
      </main>
    </div>
  )
}
