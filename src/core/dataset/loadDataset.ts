import config from '../../../datasets/upi-states/config.json'
import regions from '../../../datasets/upi-states/regions.json'
import boundariesUrl from '../../../datasets/upi-states/boundaries.geojson?url'
import type { BoundariesCollection, DatasetConfig, LoadedDataset, RegionsMap } from './types'
import { validateDataset } from './indexDataset'

const DATASET_ID = import.meta.env.VITE_DATASET_ID ?? 'upi-states'

const BUNDLED_DATASETS: Record<string, { config: DatasetConfig; regions: RegionsMap }> = {
  'upi-states': {
    config: config as unknown as DatasetConfig,
    regions: regions as unknown as RegionsMap,
  },
}

async function loadBoundaries(url: string): Promise<BoundariesCollection> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load boundaries from ${url}`)
  }
  return (await response.json()) as BoundariesCollection
}

export async function loadDataset(datasetId = DATASET_ID): Promise<LoadedDataset> {
  const bundled = BUNDLED_DATASETS[datasetId]

  if (!bundled) {
    const [configRes, regionsRes, boundariesRes] = await Promise.all([
      fetch(`/datasets/${datasetId}/config.json`),
      fetch(`/datasets/${datasetId}/regions.json`),
      fetch(`/datasets/${datasetId}/boundaries.geojson`),
    ])

    if (!configRes.ok || !regionsRes.ok || !boundariesRes.ok) {
      throw new Error(`Failed to load dataset "${datasetId}"`)
    }

    const loaded: LoadedDataset = {
      config: (await configRes.json()) as DatasetConfig,
      regions: (await regionsRes.json()) as RegionsMap,
      boundaries: (await boundariesRes.json()) as BoundariesCollection,
    }

    const warnings = validateDataset(loaded)
    warnings.forEach((w) => console.warn(`[dataset] ${w}`))
    return loaded
  }

  const boundaries = await loadBoundaries(
    datasetId === 'upi-states' ? boundariesUrl : `/datasets/${datasetId}/boundaries.geojson`,
  )

  const loaded: LoadedDataset = {
    config: bundled.config,
    regions: bundled.regions,
    boundaries,
  }

  const warnings = validateDataset(loaded)
  warnings.forEach((w) => console.warn(`[dataset] ${w}`))
  return loaded
}
