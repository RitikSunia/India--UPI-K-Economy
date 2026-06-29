import { useEffect, useState } from 'react'
import { AtlasApp } from './ui/atlas/AtlasApp'
import { loadAtlasBundle } from './core/dataset/loadAtlasBundle'
import { loadWorldBorders } from './core/dataset/loadWorldBorders'
import type { MacroData, NationalStats } from './core/dataset/types'
import type { LoadedDataset } from './core/dataset/types'
import type { WorldBoundariesCollection } from './core/dataset/loadWorldBorders'
import './styles/global.css'

function App() {
  const [dataset, setDataset] = useState<LoadedDataset | null>(null)
  const [national, setNational] = useState<NationalStats | null>(null)
  const [macro, setMacro] = useState<MacroData | null>(null)
  const [worldBoundaries, setWorldBoundaries] = useState<WorldBoundariesCollection | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([loadAtlasBundle(), loadWorldBorders()])
      .then(([bundle, world]) => {
        setDataset(bundle)
        setNational(bundle.national)
        setMacro(bundle.macro)
        setWorldBoundaries(world)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) {
    return <div className="app-error">Failed to load dataset: {error}</div>
  }

  if (!dataset || !national || !macro || !worldBoundaries) {
    return <div className="app-loading">Loading atlas…</div>
  }

  return (
    <AtlasApp
      dataset={dataset}
      national={national}
      macro={macro}
      worldBoundaries={worldBoundaries}
    />
  )
}

export default App
