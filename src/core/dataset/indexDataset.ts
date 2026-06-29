import type { GroupDef, LoadedDataset, RegionData, RegionsMap } from './types'

export function indexRegions(regions: RegionsMap) {
  return new Map(Object.entries(regions))
}

export function groupRegions(
  regions: RegionsMap,
  groups: GroupDef[],
): Array<{ group: GroupDef; items: Array<{ id: string; data: RegionData }> }> {
  return groups.map((group) => ({
    group,
    items: Object.entries(regions)
      .filter(([, data]) => data.group === group.id)
      .map(([id, data]) => ({ id, data }))
      .sort((a, b) => a.data.name.localeCompare(b.data.name)),
  }))
}

export function validateDataset(dataset: LoadedDataset): string[] {
  const warnings: string[] = []
  const boundaryIds = new Set(
    dataset.boundaries.features.map((f) => f.properties.iso_3166_2),
  )

  for (const id of boundaryIds) {
    if (!dataset.regions[id]) {
      warnings.push(`Boundary "${id}" has no matching entry in regions.json`)
    }
  }

  for (const id of Object.keys(dataset.regions)) {
    if (!boundaryIds.has(id)) {
      warnings.push(`Region "${id}" in regions.json has no boundary feature`)
    }
  }

  return warnings
}
