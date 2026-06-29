import { useState } from 'react'
import type { AtlasRow } from '../../core/data/atlasRows'
import { formatNumber } from '../../core/data/atlasRows'
import { useAtlasStore } from '../../core/store/useAtlasStore'
import { useRegionStore } from '../../core/store/useRegionStore'
import { ViewHeader } from './AtlasComponents'

interface ScatterViewProps {
  rows: AtlasRow[]
}

export function ScatterView({ rows }: ScatterViewProps) {
  const [hovered, setHovered] = useState<AtlasRow | null>(null)
  const setActiveTab = useAtlasStore((s) => s.setActiveTab)
  const selectedId = useRegionStore((s) => s.selectedId)
  const setSelectedId = useRegionStore((s) => s.setSelectedId)
  const chartRows = rows.filter((r) => r.hasData)

  const width = 900
  const height = 520
  const pad = { left: 72, right: 42, top: 38, bottom: 62 }
  const maxPopulation = Math.max(...chartRows.map((r) => r.population), 1)
  const maxIntensity = Math.max(...chartRows.map((r) => r.transactionsPerCapita), 1)
  const maxTransactions = Math.max(...chartRows.map((r) => r.upi_transactions_mn), 1)

  function x(row: AtlasRow) {
    return pad.left + (row.population / maxPopulation) * (width - pad.left - pad.right)
  }

  function y(row: AtlasRow) {
    return (
      height -
      pad.bottom -
      (row.transactionsPerCapita / maxIntensity) * (height - pad.top - pad.bottom)
    )
  }

  return (
    <section className="view-card">
      <ViewHeader kicker="Volume vs intensity" title="Large markets are not always the deepest users">
        Bubble size shows total UPI transactions. Vertical position shows transactions per projected
        resident.
      </ViewHeader>
      <div className="scatter-wrap">
        <svg
          className="scatter-plot"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Population versus UPI transactions per person"
        >
          <line
            x1={pad.left}
            y1={height - pad.bottom}
            x2={width - pad.right}
            y2={height - pad.bottom}
          />
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} />
          <text x={width / 2} y={height - 18} textAnchor="middle">
            Population, projected 2026
          </text>
          <text
            x={18}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${height / 2})`}
          >
            UPI transactions per person
          </text>
          {chartRows.map((row) => {
            const radius = 7 + Math.sqrt(row.upi_transactions_mn / maxTransactions) * 24
            const rankBand =
              (row.intensityRank ?? 99) <= 8
                ? 'high'
                : (row.intensityRank ?? 99) <= 24
                  ? 'mid'
                  : 'low'
            return (
              <circle
                key={row.id}
                className={`scatter-dot ${rankBand} ${row.id === selectedId ? 'is-selected' : ''}`}
                cx={x(row)}
                cy={y(row)}
                r={radius}
                onMouseEnter={() => setHovered(row)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelectedId(row.id)}
              />
            )
          })}
          {chartRows
            .filter((row) => row.id === selectedId || (row.intensityRank ?? 99) <= 5)
            .map((row) => (
              <text
                key={`label-${row.id}`}
                className="scatter-label"
                x={x(row)}
                y={y(row) - 18}
                textAnchor="middle"
              >
                {row.label}
              </text>
            ))}
        </svg>
        <div className="scatter-side">
          <h3>{hovered ? hovered.label : 'How to read it'}</h3>
          {hovered ? (
            <p>
              {formatNumber(hovered.population, 0)} people,{' '}
              {formatNumber(hovered.transactionsPerCapita, 1)} transactions per person,{' '}
              {formatNumber(hovered.upi_transactions_mn, 1)} mn total transactions.
            </p>
          ) : (
            <p>
              Upper bubbles are high-intensity states. Larger bubbles are high-volume states. The best
              insight comes from states that are one but not the other.
            </p>
          )}
          <button type="button" onClick={() => setActiveTab('detail')}>
            Open selected state
          </button>
        </div>
      </div>
    </section>
  )
}
