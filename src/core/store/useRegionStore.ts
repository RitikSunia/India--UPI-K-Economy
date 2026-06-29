import { create } from 'zustand'
import type { DatasetConfig, LoadedDataset, RegionData } from '../dataset/types'

export type MapStyle = 'realistic' | 'political' | 'night'
export type LineStyle = 'solid' | 'dashed' | 'dotted'
export type StateFillMode = 'metric' | 'manual'

export interface BorderLayerSettings {
  enabled: boolean
  color: string
  width: number
  opacity: number
  style: LineStyle
}

export interface BorderSettings {
  countries: BorderLayerSettings
  indiaStates: BorderLayerSettings
  showStateFills: boolean
  stateFillOpacity: number
  stateFillColor: string
  stateFillMode: StateFillMode
  stateFillColors: Record<string, string>
}

export const DEFAULT_BORDER_SETTINGS: BorderSettings = {
  countries: {
    enabled: true,
    color: '#4a5568',
    width: 1,
    opacity: 0.55,
    style: 'solid',
  },
  indiaStates: {
    enabled: true,
    color: '#46d6b2',
    width: 2,
    opacity: 0.95,
    style: 'solid',
  },
  showStateFills: true,
  stateFillOpacity: 0.12,
  stateFillColor: '#46d6b2',
  stateFillMode: 'metric',
  stateFillColors: {},
}

interface RegionStore {
  dataset: LoadedDataset | null
  selectedId: string | null
  hoveredId: string | null
  introComplete: boolean
  sidebarOpen: boolean
  screenPosition: { x: number; y: number } | null
  mapStyle: MapStyle
  autoRotateEnabled: boolean
  borderSettings: BorderSettings
  activeMetricKey: string | null
  setDataset: (dataset: LoadedDataset) => void
  setSelectedId: (id: string | null) => void
  setHoveredId: (id: string | null) => void
  setIntroComplete: (value: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setScreenPosition: (pos: { x: number; y: number } | null) => void
  setMapStyle: (style: MapStyle) => void
  setAutoRotateEnabled: (enabled: boolean) => void
  toggleAutoRotate: () => void
  setBorderSettings: (settings: Partial<BorderSettings>) => void
  setCountryBorder: (layer: Partial<BorderLayerSettings>) => void
  setIndiaStateBorder: (layer: Partial<BorderLayerSettings>) => void
  setStateFillColor: (regionId: string, color: string) => void
  resetStateFillColors: () => void
  setActiveMetricKey: (key: string) => void
  clearSelection: () => void
  getSelectedRegion: () => { id: string; data: RegionData } | null
  getConfig: () => DatasetConfig | null
}

export const useRegionStore = create<RegionStore>((set, get) => ({
  dataset: null,
  selectedId: null,
  hoveredId: null,
  introComplete: false,
  sidebarOpen: false,
  screenPosition: null,
  mapStyle: 'night',
  autoRotateEnabled: true,
  borderSettings: DEFAULT_BORDER_SETTINGS,
  activeMetricKey: null,
  setDataset: (dataset) => {
    const defaultMetric =
      dataset.config.metrics?.find((m) => m.default)?.key ??
      dataset.config.metrics?.[0]?.key ??
      null
    set({ dataset, activeMetricKey: defaultMetric })
  },
  setSelectedId: (id) => set({ selectedId: id }),
  setHoveredId: (id) => set({ hoveredId: id }),
  setIntroComplete: (value) => set({ introComplete: value }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setScreenPosition: (pos) => set({ screenPosition: pos }),
  setMapStyle: (style) => set({ mapStyle: style }),
  setAutoRotateEnabled: (enabled) => set({ autoRotateEnabled: enabled }),
  toggleAutoRotate: () => set((s) => ({ autoRotateEnabled: !s.autoRotateEnabled })),
  setBorderSettings: (settings) =>
    set((s) => ({ borderSettings: { ...s.borderSettings, ...settings } })),
  setCountryBorder: (layer) =>
    set((s) => ({
      borderSettings: {
        ...s.borderSettings,
        countries: { ...s.borderSettings.countries, ...layer },
      },
    })),
  setIndiaStateBorder: (layer) =>
    set((s) => ({
      borderSettings: {
        ...s.borderSettings,
        indiaStates: { ...s.borderSettings.indiaStates, ...layer },
      },
    })),
  setStateFillColor: (regionId, color) =>
    set((s) => ({
      borderSettings: {
        ...s.borderSettings,
        stateFillColors: { ...s.borderSettings.stateFillColors, [regionId]: color },
      },
    })),
  resetStateFillColors: () =>
    set((s) => ({
      borderSettings: { ...s.borderSettings, stateFillColors: {} },
    })),
  setActiveMetricKey: (key) => set({ activeMetricKey: key }),
  clearSelection: () => set({ selectedId: null, screenPosition: null }),
  getSelectedRegion: () => {
    const { dataset, selectedId } = get()
    if (!dataset || !selectedId) return null
    const data = dataset.regions[selectedId]
    if (!data) return null
    return { id: selectedId, data }
  },
  getConfig: () => get().dataset?.config ?? null,
}))
