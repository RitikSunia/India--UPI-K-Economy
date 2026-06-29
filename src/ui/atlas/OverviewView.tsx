import { useMemo } from 'react'
import type { AtlasRow } from '../../core/data/atlasRows'
import {
  formatNumber,
  getSelectedInsight,
  getSelectedRow,
  sortRowsByMetric,
} from '../../core/data/atlasRows'
import type { NationalStats } from '../../core/dataset/types'
import { useAtlasStore } from '../../core/store/useAtlasStore'
import { useRegionStore } from '../../core/store/useRegionStore'
import { KpiCard, ViewHeader } from './AtlasComponents'

interface OverviewViewProps {
  rows: AtlasRow[]
  national: NationalStats
}

export function OverviewView({ rows, national }: OverviewViewProps) {
  const setActiveTab = useAtlasStore((s) => s.setActiveTab)
  const selectedId = useRegionStore((s) => s.selectedId)
  const metricRows = useMemo(() => sortRowsByMetric(rows, 'upi_txn_per_capita'), [rows])
  const top = metricRows[0]
  const bottom = metricRows[metricRows.length - 1]
  const selected = getSelectedRow(rows, selectedId) ?? metricRows[0]

  return (
    <section className="view-card">
      <ViewHeader kicker="UPI K-Economy Atlas" title="UPI adoption is national, but intensity is uneven">
        State-level UPI data shows where digital payments are largest in absolute terms and where they
        run deepest on a per-person basis.
      </ViewHeader>
      <div className="kpi-grid">
        <KpiCard
          label="Total UPI transactions"
          value={`${formatNumber(national.totalTransactionsMn / 1000, 1)} bn`}
          note={`State file total · ref. ${national.upiReferenceMonth}.`}
        />
        <KpiCard
          label="Total UPI value"
          value={`₹${formatNumber(national.totalValueCr, 0)} cr`}
          note="Aggregate transaction value."
        />
        <KpiCard
          label="National intensity"
          value={formatNumber(national.txPerCapita, 1)}
          note="Monthly transactions per projected resident."
        />
        <KpiCard
          label="Highest intensity"
          value={top?.label ?? '—'}
          note={`${formatNumber(top?.transactionsPerCapita ?? 0, 1)} txn/person.`}
        />
        <KpiCard
          label="Lowest intensity"
          value={bottom?.label ?? '—'}
          note={`${formatNumber(bottom?.transactionsPerCapita ?? 0, 1)} txn/person.`}
        />
        <KpiCard
          label="Top 5 volume share"
          value={`${formatNumber(national.topFiveVolumeShare, 1)}%`}
          note="Share of all state-level UPI transactions."
        />
      </div>
      <div className="story-callout">
        <b>Core reading</b>
        <p>
          Big states can dominate total transaction volume because they have more people and firms.
          Per-capita intensity asks a sharper question: where is UPI woven more deeply into everyday
          payments?
        </p>
        <button type="button" onClick={() => setActiveTab('map')}>
          Explore the globe
        </button>
      </div>
      {selected ? (
        <div className="mini-profile">
          <span>Currently selected</span>
          <strong>{selected.label}</strong>
          <p>{getSelectedInsight(selected, national)}</p>
        </div>
      ) : null}
    </section>
  )
}
