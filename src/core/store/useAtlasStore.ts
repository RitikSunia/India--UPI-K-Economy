import { create } from 'zustand'

export type AtlasTab =
  | 'overview'
  | 'map'
  | 'rankings'
  | 'scatter'
  | 'detail'
  | 'methodology'
  | 'k-economy'

export const ATLAS_TABS: { key: AtlasTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'map', label: 'Interactive Globe' },
  { key: 'rankings', label: 'State Rankings' },
  { key: 'scatter', label: 'Volume vs Intensity' },
  { key: 'detail', label: 'State Detail' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'k-economy', label: 'K-Economy Expansion' },
]

interface AtlasStore {
  activeTab: AtlasTab
  includeGoa: boolean
  setActiveTab: (tab: AtlasTab) => void
  setIncludeGoa: (include: boolean) => void
}

export const useAtlasStore = create<AtlasStore>((set) => ({
  activeTab: 'overview',
  includeGoa: true,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIncludeGoa: (include) => set({ includeGoa: include }),
}))
