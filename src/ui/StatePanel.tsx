import { useEffect, useMemo, useRef } from 'react'
import { useRegionStore } from '../core/store/useRegionStore'
import { useAtlasStore } from '../core/store/useAtlasStore'
import { useActiveMetric } from '../core/metrics/useActiveMetric'
import {
  buildAtlasRows,
  computeNationalFromRows,
  filterAtlasRows,
  formatNumber,
  getIntensityPeers,
  getSelectedInsight,
  withRecalculatedIntensityRanks,
  withRecalculatedKEconomyRanks,
} from '../core/data/atlasRows'
import { GOA_REGION_ID } from '../core/constants'
import {
  formatMetricValue,
  getMetricColor,
} from '../core/metrics/metricColor'
import { animateHeroValue, animateStatePanel } from './animations'
import nationalData from '../../datasets/upi-states/national.json'
import type { NationalStats } from '../core/dataset/types'

type HeroTween = ReturnType<typeof animateHeroValue>

export function StatePanel() {
  const panelRef = useRef<HTMLElement>(null)
  const rowsRef = useRef<HTMLDivElement>(null)
  const heroValueRef = useRef<HTMLSpanElement>(null)
  const prevIdRef = useRef<string | null>(null)
  const heroTweenRef = useRef<HeroTween>(null)

  const selectedId = useRegionStore((s) => s.selectedId)
  const dataset = useRegionStore((s) => s.dataset)
  const setSelectedId = useRegionStore((s) => s.setSelectedId)
  const clearSelection = useRegionStore((s) => s.clearSelection)
  const setActiveTab = useAtlasStore((s) => s.setActiveTab)
  const includeGoa = useAtlasStore((s) => s.includeGoa)
  const activeMetric = useActiveMetric()

  const config = dataset?.config ?? null
  const selected =
    selectedId && dataset?.regions[selectedId]
      ? { id: selectedId, data: dataset.regions[selectedId] }
      : null

  const metricValue = activeMetric
    ? (selected?.data.metrics?.[activeMetric.key] ?? null)
    : null
  const heroColor =
    activeMetric && metricValue != null
      ? getMetricColor(metricValue, activeMetric)
      : 'var(--accent)'

  const baseNational = nationalData as unknown as NationalStats
  const rows = useMemo(() => {
    if (!dataset) return []
    const all = buildAtlasRows(dataset.regions)
    const filtered = filterAtlasRows(all, includeGoa)
    return withRecalculatedKEconomyRanks(withRecalculatedIntensityRanks(filtered))
  }, [dataset, includeGoa])
  const national = useMemo(
    () => (includeGoa ? baseNational : computeNationalFromRows(rows, baseNational)),
    [includeGoa, rows, baseNational],
  )

  useEffect(() => {
    const panel = panelRef.current
    const rows = rowsRef.current
      ? Array.from(rowsRef.current.querySelectorAll<HTMLElement>('.state-panel__row'))
      : []

    const id = selected?.id ?? null
    if (id && id !== prevIdRef.current) {
      animateStatePanel(panel, rows, true)
    } else if (!id && prevIdRef.current) {
      animateStatePanel(panel, rows, false)
    }
    prevIdRef.current = id
  }, [selected])

  useEffect(() => {
    if (!selected || !activeMetric) return
    heroTweenRef.current?.kill()
    if (metricValue == null) {
      if (heroValueRef.current) heroValueRef.current.textContent = '—'
      return
    }
    heroTweenRef.current = animateHeroValue(
      heroValueRef.current,
      0,
      metricValue,
      activeMetric.key === 'upi_txn_per_capita' || activeMetric.key === 'mgnrega_days_lakh_2324'
        ? 2
        : activeMetric.key === 'k_economy_score'
          ? 1
          : 0,
    )
    return () => {
      heroTweenRef.current?.kill()
    }
  }, [selected, activeMetric, metricValue])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSelection])

  if (!selected || !config || !dataset) return null

  const tableColumns = config.columns.filter((col) => col.key !== 'notes')
  const atlasRow = rows.find((r) => r.id === selected.id)
  const peers = atlasRow && (includeGoa || selected.id !== GOA_REGION_ID)
    ? getIntensityPeers(rows, atlasRow, 3)
    : []

  return (
    <aside
      ref={panelRef}
      className="state-panel"
      role="dialog"
      aria-label={`Details for ${selected.data.name}`}
    >
      <header className="state-panel__header">
        <div>
          <p className="state-panel__eyebrow">Region</p>
          <h2 className="state-panel__title">{selected.data.name}</h2>
        </div>
        <button
          type="button"
          className="state-panel__close"
          aria-label="Close panel"
          onClick={clearSelection}
        >
          ×
        </button>
      </header>

      {activeMetric ? (
        <section className="state-panel__hero" aria-label="Selected metric">
          <p className="state-panel__eyebrow">{activeMetric.label}</p>
          <div className="state-panel__hero-row">
            <span
              ref={heroValueRef}
              className="state-panel__value"
              style={{ color: heroColor }}
            >
              {formatMetricValue(metricValue, activeMetric)}
            </span>
            <span
              className="state-panel__swatch"
              style={{ background: heroColor, color: heroColor }}
              aria-hidden="true"
            />
          </div>
          <p className="state-panel__unit">{activeMetric.unit}</p>
        </section>
      ) : null}

      {atlasRow ? (
        <p className="state-panel__insight">{getSelectedInsight(atlasRow, national)}</p>
      ) : null}

      {peers.length > 0 ? (
        <section className="state-panel__peers">
          <p className="state-panel__eyebrow">Peers by intensity</p>
          {peers.map((peer) => (
            <button
              key={peer.id}
              type="button"
              className="state-panel__peer-btn"
              onClick={() => setSelectedId(peer.id)}
            >
              {peer.label}
              <span>{formatNumber(peer.transactionsPerCapita, 1)}</span>
            </button>
          ))}
        </section>
      ) : null}

      <div ref={rowsRef} className="state-panel__table">
        <div className="state-panel__row state-panel__row--head">
          <span>Metric</span>
          <span>Value</span>
        </div>
        {tableColumns.map((col) => (
          <div key={col.key} className="state-panel__row">
            <span className="state-panel__metric">{col.label}</span>
            <span className="state-panel__cell">
              {selected.data.fields[col.key] ?? '—'}
            </span>
          </div>
        ))}
      </div>

      <footer className="state-panel__footer">
        <button type="button" className="state-panel__profile-link" onClick={() => setActiveTab('detail')}>
          Full state profile →
        </button>
        <span>
          {config.meta && 'upi_reference_month' in config.meta
            ? `UPI ref. ${String(config.meta.upi_reference_month)}`
            : 'India UPI & K-Economy'}
        </span>
      </footer>
    </aside>
  )
}
