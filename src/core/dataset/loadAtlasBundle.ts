import nationalJson from '../../../datasets/upi-states/national.json'
import macroJson from '../../../datasets/upi-states/macro.json'
import type { LoadedDataset, MacroData, NationalStats } from './types'
import { loadDataset } from './loadDataset'

export async function loadAtlasBundle(): Promise<LoadedDataset & { national: NationalStats; macro: MacroData }> {
  const dataset = await loadDataset()
  return {
    ...dataset,
    national: nationalJson as unknown as NationalStats,
    macro: macroJson as unknown as MacroData,
  }
}
