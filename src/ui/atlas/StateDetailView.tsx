import type { AtlasRow } from '../../core/data/atlasRows'
import {
  formatNumber,
  getIntensityPeers,
  getSelectedInsight,
  getSelectedRow,
} from '../../core/data/atlasRows'
import type { NationalStats } from '../../core/dataset/types'
import { useAtlasStore } from '../../core/store/useAtlasStore'
import { useRegionStore } from '../../core/store/useRegionStore'
import { KpiCard, ViewHeader } from './AtlasComponents'

interface StateDetailViewProps {
  rows: AtlasRow[]
  national: NationalStats
}

export function StateDetailView({ rows, national }: StateDetailViewProps) {
  const selectedId = useRegionStore((s) => s.selectedId)
  const setSelectedId = useRegionStore((s) => s.setSelectedId)
  const setActiveTab = useAtlasStore((s) => s.setActiveTab)
  const selected = getSelectedRow(rows, selectedId)

  if (!selected) {
    return (
      <section className="view-card">
        <ViewHeader kicker="State profile" title="Select a state">
          Choose a state from Rankings, the globe, or the sidebar to view its full profile.
        </ViewHeader>
        <button type="button" className="secondary-action" onClick={() => setActiveTab('map')}>
          Open interactive globe
        </button>
      </section>
    )
  }

  const peers = getIntensityPeers(rows, selected)
  const intensityDelta = selected.transactionsPerCapita - national.txPerCapita
  const valueDelta = selected.valuePerCapita - national.valuePerCapita

  return (
    <section className="view-card">
      <ViewHeader kicker="State profile" title={selected.label}>
        {getSelectedInsight(selected, national)}
      </ViewHeader>
      <div className="kpi-grid">
        <KpiCard
          label="Intensity rank"
          value={`#${selected.intensityRank ?? '—'} of ${rows.length}`}
          note="Ranked by monthly UPI transactions per person."
        />
        <KpiCard
          label="Transactions/person"
          value={formatNumber(selected.transactionsPerCapita, 1)}
          note={`${formatNumber(intensityDelta, 1)} vs national average.`}
        />
        <KpiCard
          label="Value/person"
          value={`₹${formatNumber(selected.valuePerCapita, 0)}`}
          note={`₹${formatNumber(valueDelta, 0)} vs national average.`}
        />
        <KpiCard
          label="National tx share"
          value={`${formatNumber(selected.volumeShare, 1)}%`}
          note="Share of state-level UPI transactions."
        />
      </div>
      <div className="detail-panel">
        <div>
          <h3>State totals</h3>
          <p>Population: {formatNumber(selected.population, 0)}</p>
          <p>Transactions: {formatNumber(selected.upi_transactions_mn, 1)} mn</p>
          <p>Value: ₹{formatNumber(selected.upi_value_cr, 0)} cr</p>
          <p>K-Economy score: {selected.kEconomyScore ?? '—'}</p>
        </div>
        <div>
          <h3>Nearest peers by intensity</h3>
          {peers.map((row) => (
            <button key={row.id} type="button" onClick={() => setSelectedId(row.id)}>
              {row.label} <span>{formatNumber(row.transactionsPerCapita, 1)}</span>
            </button>
          ))}
        </div>
      </div>
      <button className="secondary-action" type="button" onClick={() => setActiveTab('map')}>
        See on globe
      </button>
    </section>
  )
}
