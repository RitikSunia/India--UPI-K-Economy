import { useMemo } from 'react'
import type { AtlasRow } from '../../core/data/atlasRows'
import { formatNumber } from '../../core/data/atlasRows'
import type { MacroData } from '../../core/dataset/types'
import { KpiCard, MiniBar, Sparkline, ViewHeader } from './AtlasComponents'

interface KEconomyViewProps {
  rows: AtlasRow[]
  macro: MacroData
}

const INDICATORS = [
  { name: 'UPI participation', note: 'Per-capita transactions by state.' },
  { name: 'Real wages', note: 'MGNREGA wage rate by state, FY 2022–23.' },
  { name: 'MGNREGA demand', note: 'Person-days by state, FY 2023–24.' },
  { name: 'GDP growth', note: 'Annual GDP growth 2015–2024 (World Bank).' },
  { name: 'CPI rural-urban gap', note: 'Monthly rural & urban CPI series.' },
  { name: 'Sensex', note: 'Monthly BSE Sensex average.' },
]

export function KEconomyView({ rows, macro }: KEconomyViewProps) {
  const cpiRural = useMemo(
    () =>
      macro.monthly
        .filter((r) => r.cpi_rural_general != null)
        .map((r) => Number(r.cpi_rural_general)),
    [macro],
  )
  const cpiUrban = useMemo(
    () =>
      macro.monthly
        .filter((r) => r.cpi_urban_general != null)
        .map((r) => Number(r.cpi_urban_general)),
    [macro],
  )
  const sensexVals = useMemo(
    () =>
      macro.monthly
        .filter((r) => r.sensex_monthly_avg != null && Number(r.sensex_monthly_avg) > 1000)
        .map((r) => Number(r.sensex_monthly_avg)),
    [macro],
  )
  const gdpRecent = macro.gdp_annual.slice(-8)
  const gdpMax = Math.max(...macro.gdp_annual.map((r) => Math.abs(r.gdp_growth_pct)), 10)

  const latestCpi = [...macro.monthly].reverse().find((r) => r.cpi_rural_general && r.cpi_urban_general)
  const cpiGap =
    latestCpi && latestCpi.cpi_rural_general != null && latestCpi.cpi_urban_general != null
      ? Number(latestCpi.cpi_rural_general) - Number(latestCpi.cpi_urban_general)
      : null
  const latestSensex = sensexVals.at(-1) ?? null
  const latestGdp = macro.gdp_annual.at(-1) ?? null

  const top10 = [...rows]
    .filter((r) => r.kEconomyScore != null && r.kEconomyRank != null)
    .sort((a, b) => (a.kEconomyRank ?? 99) - (b.kEconomyRank ?? 99))
    .slice(0, 10)

  return (
    <section className="view-card">
      <ViewHeader kicker="K-Economy Dashboard" title="Full six-indicator view">
        State scores combine UPI intensity, rural wages, and MGNREGA demand. National macro context
        adds CPI, Sensex, and GDP growth.
      </ViewHeader>

      <div className="economy-grid">
        {INDICATORS.map((card) => (
          <article key={card.name} className="economy-card is-ready">
            <span>✓ Available</span>
            <h3>{card.name}</h3>
            <p>{card.note}</p>
          </article>
        ))}
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="CPI Rural–Urban Gap"
          value={cpiGap != null ? `${cpiGap > 0 ? '+' : ''}${cpiGap.toFixed(1)} pts` : '—'}
          note="Rural minus Urban (latest month)"
        />
        <div className="kpi-card kpi-card--spark">
          <Sparkline data={cpiRural} color="#c97d2a" />
          <Sparkline data={cpiUrban} color="#235b9f" />
        </div>
        <KpiCard
          label="BSE Sensex"
          value={latestSensex ? `₹${(latestSensex / 1000).toFixed(0)}k` : '—'}
          note="Monthly average (latest)"
        />
        <div className="kpi-card kpi-card--spark">
          <Sparkline data={sensexVals} color="#235b9f" width={180} height={44} />
        </div>
        <KpiCard
          label="GDP Growth (latest)"
          value={latestGdp ? `${latestGdp.gdp_growth_pct.toFixed(1)}%` : '—'}
          note={`India annual GDP growth, ${latestGdp?.year ?? '—'}`}
        />
        <div className="kpi-card kpi-card--bars">
          {gdpRecent.map((r) => (
            <MiniBar
              key={r.year}
              label={String(r.year)}
              value={r.gdp_growth_pct}
              max={gdpMax + 1}
              color={r.gdp_growth_pct >= 0 ? '#2e7d58' : '#cb4b57'}
            />
          ))}
        </div>
      </div>

      <div className="story-callout">
        <b>State K-Economy Rankings (Top 10)</b>
        <p>Score = 40% UPI per capita + 30% rural wage + 30% inverse MGNREGA demand.</p>
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th>Rank</th>
              <th>State</th>
              <th>Score</th>
              <th>UPI/person</th>
              <th>Wage ₹/day</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((row) => (
              <tr key={row.id}>
                <td>#{row.kEconomyRank}</td>
                <td>{row.label}</td>
                <td>{formatNumber(row.kEconomyScore ?? 0, 1)}</td>
                <td>{formatNumber(row.transactionsPerCapita, 1)}</td>
                <td>{row.wagePerDay != null ? formatNumber(row.wagePerDay, 0) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
