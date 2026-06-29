import { useMemo } from 'react'
import type { RegionsMap, NationalStats } from '../../core/dataset/types'
import {
  buildAtlasRows,
  computeNationalFromRows,
  filterAtlasRows,
  withRecalculatedIntensityRanks,
  withRecalculatedKEconomyRanks,
} from '../../core/data/atlasRows'
import { useAtlasStore } from '../../core/store/useAtlasStore'

export function useAnalysisRows(regions: RegionsMap, national: NationalStats) {
  const includeGoa = useAtlasStore((s) => s.includeGoa)

  const allRows = useMemo(() => buildAtlasRows(regions), [regions])

  const rows = useMemo(() => {
    const filtered = filterAtlasRows(allRows, includeGoa)
    return withRecalculatedKEconomyRanks(withRecalculatedIntensityRanks(filtered))
  }, [allRows, includeGoa])

  const analysisNational = useMemo(
    () => (includeGoa ? national : computeNationalFromRows(rows, national)),
    [includeGoa, national, rows],
  )

  return { rows, allRows, includeGoa, analysisNational }
}
