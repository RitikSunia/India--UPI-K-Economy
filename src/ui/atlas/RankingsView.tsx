import { useMemo, useState } from 'react'
import type { AtlasRow } from '../../core/data/atlasRows'
import {
  formatMetricDisplay,
  formatNumber,
  RANKING_METRICS,
  sortRowsByMetric,
} from '../../core/data/atlasRows'
import { useAtlasStore } from '../../core/store/useAtlasStore'
import { useRegionStore } from '../../core/store/useRegionStore'
import { ViewHeader } from './AtlasComponents'

interface RankingsViewProps {
  rows: AtlasRow[]
}

export function RankingsView({ rows }: RankingsViewProps) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('upi_txn_per_capita')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [chartMode, setChartMode] = useState<'both' | 'top' | 'bottom'>('both')
  const setActiveTab = useAtlasStore((s) => s.setActiveTab)
  const selectedId = useRegionStore((s) => s.selectedId)
  const setSelectedId = useRegionStore((s) => s.setSelectedId)

  const sorted = useMemo(() => {
    const base = sortRowsByMetric(rows, sortKey)
    const filtered = base.filter((r) =>
      r.label.toLowerCase().includes(query.trim().toLowerCase()),
    )
    return sortDir === 'asc' ? [...filtered].reverse() : filtered
  }, [rows, sortKey, sortDir, query])

  const chartRows = sorted.slice(0, 10)
  const bottomRows = [...sorted].reverse().slice(0, 10)
  const maxValue = Math.max(...sorted.map((r) => r.transactionsPerCapita), 1)

  function selectState(id: string) {
    setSelectedId(id)
    setActiveTab('detail')
  }

  function accessor(row: AtlasRow) {
    switch (sortKey) {
      case 'upi_value_per_capita':
        return row.valuePerCapita
      case 'upi_transactions_mn':
        return row.upi_transactions_mn
      case 'volume_share':
        return row.volumeShare
      default:
        return row.transactionsPerCapita
    }
  }

  return (
    <section className="view-card">
      <ViewHeader kicker="State rankings" title="Compare precision, not just geography">
        Sort, search, and inspect each state across UPI volume, value, per-capita intensity, and
        national share.
      </ViewHeader>
      <div className="table-controls">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search state or UT"
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          {RANKING_METRICS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      <div className="chart-toggle">
        {(['both', 'top', 'bottom'] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={chartMode === key ? 'is-active' : ''}
            onClick={() => setChartMode(key)}
          >
            {key === 'both' ? 'Both' : key === 'top' ? 'Top 10' : 'Bottom 10'}
          </button>
        ))}
      </div>

      <div className="rank-chart-grid">
        {(chartMode === 'both' || chartMode === 'top') && (
          <RankBarChart
            title="Top 10"
            rows={chartRows}
            accessor={accessor}
            maxValue={maxValue}
            sortKey={sortKey}
            selectedId={selectedId}
            onSelect={selectState}
          />
        )}
        {(chartMode === 'both' || chartMode === 'bottom') && (
          <RankBarChart
            title="Bottom 10"
            rows={bottomRows}
            accessor={accessor}
            maxValue={maxValue}
            sortKey={sortKey}
            selectedId={selectedId}
            onSelect={selectState}
          />
        )}
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>State</th>
              <th>Rank</th>
              <th>Population</th>
              <th>UPI tx</th>
              <th>UPI value</th>
              <th>Tx/person</th>
              <th>Value/person</th>
              <th>Tx share</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className={row.id === selectedId ? 'is-selected' : ''}>
                <td>
                  <button type="button" onClick={() => selectState(row.id)}>
                    {row.label}
                  </button>
                </td>
                <td>#{row.intensityRank}</td>
                <td>{formatNumber(row.population, 0)}</td>
                <td>{formatNumber(row.upi_transactions_mn, 1)} mn</td>
                <td>₹{formatNumber(row.upi_value_cr, 0)} cr</td>
                <td>{formatNumber(row.transactionsPerCapita, 1)}</td>
                <td>₹{formatNumber(row.valuePerCapita, 0)}</td>
                <td>{formatNumber(row.volumeShare, 1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function RankBarChart({
  title,
  rows,
  accessor,
  maxValue,
  sortKey,
  selectedId,
  onSelect,
}: {
  title: string
  rows: AtlasRow[]
  accessor: (r: AtlasRow) => number
  maxValue: number
  sortKey: string
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const chartMax = Math.max(...rows.map(accessor), maxValue, 1)
  return (
    <div className="rank-chart">
      <h3>{title}</h3>
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          className={row.id === selectedId ? 'is-selected' : ''}
          onClick={() => onSelect(row.id)}
        >
          <span>{row.label}</span>
          <i style={{ width: `${Math.max(4, (accessor(row) / chartMax) * 100)}%` }} />
          <b>{formatMetricDisplay(sortKey, accessor(row))}</b>
        </button>
      ))}
    </div>
  )
}
