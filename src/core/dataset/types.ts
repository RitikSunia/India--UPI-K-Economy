import type { BufferGeometry } from 'three'
import type { FeatureCollection, Geometry } from 'geojson'

export interface ColumnDef {
  key: string
  label: string
}

export interface MetricDef {
  key: string
  label: string
  unit: string
  domain: [number, number]
  ramp: string[]
  default?: boolean
}

export interface GroupDef {
  id: string
  label: string
}

export interface RegionFields {
  [key: string]: string
}

export interface RegionData {
  name: string
  group: string
  upiIso?: string
  fields: RegionFields
  metrics?: Record<string, number | null>
  mgnrega_by_year?: Record<string, number> | null
}

export type RegionsMap = Record<string, RegionData>

export interface NationalStats {
  totalTransactionsMn: number
  totalValueCr: number
  totalPopulation: number
  txPerCapita: number
  valuePerCapita: number
  stateCount: number
  upiReferenceMonth: string
  topFiveVolumeShare: number
}

export interface MacroMonthly {
  date: string
  cpi_rural_general: number | null
  cpi_urban_general: number | null
  cpi_combined_general: number | null
  rural_urban_gap: number | null
  sensex_monthly_avg: number | null
}

export interface MacroGdp {
  year: number
  gdp_growth_pct: number
}

export interface MacroData {
  monthly: MacroMonthly[]
  gdp_annual: MacroGdp[]
}

export interface DatasetConfig {
  id: string
  title: string
  subtitle?: string
  columns: ColumnDef[]
  metrics?: MetricDef[]
  groups: GroupDef[]
  intro: {
    from: string
    targetLng: number
    targetLat: number
    duration: number
    startAltitude: number
    endAltitude: number
  }
  camera: {
    flyToDuration: number
    flyToAltitude: number
  }
  globe: {
    earthRadius: number
    stateAltitude: number
    autoRotateSpeed: number
  }
  theme: {
    hoverColor: string
    selectColor: string
    accentColor: string
    textures?: {
      day?: string
      night?: string
      bump?: string
      political?: string
    }
  }
  meta?: Record<string, unknown>
}

export interface RegionFeatureProperties {
  iso_3166_2: string
  name: string
  latitude: number
  longitude: number
  region?: string
}

export type BoundariesCollection = FeatureCollection<
  Geometry,
  RegionFeatureProperties
>

export interface LoadedDataset {
  config: DatasetConfig
  regions: RegionsMap
  boundaries: BoundariesCollection
}

export interface RegionMeshData {
  regionId: string
  name: string
  centroid: [number, number]
  geometry: BufferGeometry
}
