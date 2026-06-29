import type { LoadedDataset, NationalStats, RegionsMap } from '../dataset/types'
import { GOA_REGION_ID } from '../constants'

export interface AtlasRow {
  id: string
  upiIso: string
  label: string
  population: number
  upi_transactions_mn: number
  upi_value_cr: number
  transactionsPerCapita: number
  valuePerCapita: number
  volumeShare: number
  kEconomyScore: number | null
  kEconomyRank: number | null
  intensityRank: number | null
  wagePerDay: number | null
  mgnregaDays: number | null
  hasData: boolean
}

export function buildAtlasRows(regions: RegionsMap): AtlasRow[] {
  return Object.entries(regions)
    .map(([id, data]) => {
      const m = data.metrics ?? {}
      return {
        id,
        upiIso: data.upiIso ?? id.replace('-', ''),
        label: data.name,
        population: m.population_2026 ?? 0,
        upi_transactions_mn: m.upi_transactions_mn ?? 0,
        upi_value_cr: m.upi_value_cr ?? 0,
        transactionsPerCapita: m.upi_txn_per_capita ?? 0,
        valuePerCapita: m.upi_value_per_capita ?? 0,
        volumeShare: m.volume_share ?? 0,
        kEconomyScore: m.k_economy_score ?? null,
        kEconomyRank: m.k_economy_rank != null ? Number(m.k_economy_rank) : null,
        intensityRank: m.intensity_rank ?? null,
        wagePerDay: m.wage_per_day_rs ?? null,
        mgnregaDays: m.mgnrega_days_lakh_2324 ?? null,
        hasData: m.upi_txn_per_capita != null,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Drop Goa when the analysis toggle excludes it. */
export function filterAtlasRows(rows: AtlasRow[], includeGoa: boolean): AtlasRow[] {
  if (includeGoa) return rows
  return rows.filter((r) => r.id !== GOA_REGION_ID)
}

/** Recompute intensity rank among rows with UPI data (1 = highest txn/capita). */
export function withRecalculatedIntensityRanks(rows: AtlasRow[]): AtlasRow[] {
  const ranked = [...rows]
    .filter((r) => r.hasData)
    .sort((a, b) => b.transactionsPerCapita - a.transactionsPerCapita)

  const rankById = new Map(ranked.map((r, i) => [r.id, i + 1]))

  return rows.map((r) => ({
    ...r,
    intensityRank: rankById.get(r.id) ?? null,
  }))
}

/** Recompute K-Economy rank among rows with a score (1 = highest score). */
export function withRecalculatedKEconomyRanks(rows: AtlasRow[]): AtlasRow[] {
  const ranked = [...rows]
    .filter((r) => r.kEconomyScore != null)
    .sort((a, b) => (b.kEconomyScore ?? 0) - (a.kEconomyScore ?? 0))

  const rankById = new Map(ranked.map((r, i) => [r.id, i + 1]))

  return rows.map((r) => ({
    ...r,
    kEconomyRank: rankById.get(r.id) ?? null,
  }))
}

/** National aggregates from a row subset (e.g. when Goa is excluded). */
export function computeNationalFromRows(
  rows: AtlasRow[],
  base: NationalStats,
): NationalStats {
  const withData = rows.filter((r) => r.hasData)
  const totalPop = withData.reduce((s, r) => s + r.population, 0)
  const totalTxn = withData.reduce((s, r) => s + r.upi_transactions_mn, 0)
  const totalValue = withData.reduce((s, r) => s + r.upi_value_cr, 0)
  const topFiveVolumeShare = [...withData]
    .sort((a, b) => b.volumeShare - a.volumeShare)
    .slice(0, 5)
    .reduce((s, r) => s + r.volumeShare, 0)

  return {
    totalTransactionsMn: totalTxn,
    totalValueCr: totalValue,
    totalPopulation: totalPop,
    txPerCapita: totalPop > 0 ? (totalTxn * 1_000_000) / totalPop : 0,
    valuePerCapita: totalPop > 0 ? (totalValue * 10_000_000) / totalPop : 0,
    stateCount: withData.length,
    upiReferenceMonth: base.upiReferenceMonth,
    topFiveVolumeShare,
  }
}

export function getSelectedRow(rows: AtlasRow[], selectedId: string | null): AtlasRow | null {
  if (!selectedId) return rows[0] ?? null
  return rows.find((r) => r.id === selectedId) ?? null
}

export function getIntensityPeers(rows: AtlasRow[], selected: AtlasRow, count = 4): AtlasRow[] {
  return rows
    .filter((r) => r.hasData && r.id !== selected.id)
    .sort(
      (a, b) =>
        Math.abs(a.transactionsPerCapita - selected.transactionsPerCapita) -
        Math.abs(b.transactionsPerCapita - selected.transactionsPerCapita),
    )
    .slice(0, count)
}

export function getSelectedInsight(row: AtlasRow, national: NationalStats): string {
  const intensity = row.transactionsPerCapita >= national.txPerCapita ? 'above' : 'below'
  const volumeNote =
    row.volumeShare >= 5 ? 'large national volume share' : 'smaller national volume share'
  return `${row.label} sits ${intensity} the national UPI transactions-per-person average while carrying a ${volumeNote}. This separates digital payment depth from simple market size.`
}

export function sortRowsByMetric(rows: AtlasRow[], metricKey: string): AtlasRow[] {
  const accessor = METRIC_ACCESSORS[metricKey] ?? METRIC_ACCESSORS.upi_txn_per_capita
  return [...rows].filter((r) => r.hasData).sort((a, b) => accessor(b) - accessor(a))
}

export const METRIC_ACCESSORS: Record<string, (r: AtlasRow) => number> = {
  upi_txn_per_capita: (r) => r.transactionsPerCapita,
  upi_value_per_capita: (r) => r.valuePerCapita,
  upi_transactions_mn: (r) => r.upi_transactions_mn,
  volume_share: (r) => r.volumeShare,
  k_economy_score: (r) => r.kEconomyScore ?? 0,
}

export const RANKING_METRICS = [
  { key: 'upi_txn_per_capita', label: 'Transactions per person' },
  { key: 'upi_value_per_capita', label: 'Value per person' },
  { key: 'upi_transactions_mn', label: 'UPI transactions' },
  { key: 'volume_share', label: 'National transaction share' },
] as const

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatMetricDisplay(key: string, value: number): string {
  switch (key) {
    case 'upi_txn_per_capita':
      return formatNumber(value, 1)
    case 'upi_value_per_capita':
      return `₹${formatNumber(value, 0)}`
    case 'upi_transactions_mn':
      return `${formatNumber(value, 1)} mn`
    case 'volume_share':
      return `${formatNumber(value, 1)}%`
    default:
      return formatNumber(value, 1)
  }
}

export type AtlasBundle = LoadedDataset & {
  national: NationalStats
}
