import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { buildBorderRings } from './geoLineProjection'
import { useRegionStore, type BorderLayerSettings } from '../store/useRegionStore'
import type { BoundariesCollection } from '../dataset/types'
import type { WorldBoundariesCollection } from '../dataset/loadWorldBorders'

interface BorderLinesProps {
  worldBoundaries: WorldBoundariesCollection
  indiaBoundaries: BoundariesCollection
  earthRadius: number
  borderAltitude?: number
}

function getDashProps(style: BorderLayerSettings['style']) {
  if (style === 'solid') {
    return { dashed: false as const }
  }
  if (style === 'dotted') {
    return { dashed: true as const, dashSize: 0.35, gapSize: 0.35, dashScale: 1 }
  }
  return { dashed: true as const, dashSize: 1.2, gapSize: 0.6, dashScale: 1 }
}

function BorderLayer({
  rings,
  settings,
}: {
  rings: Array<{ id: string; points: import('three').Vector3[] }>
  settings: BorderLayerSettings
}) {
  if (!settings.enabled) return null

  const dashProps = getDashProps(settings.style)

  return (
    <group>
      {rings.map((ring) => (
        <Line
          key={ring.id}
          points={ring.points}
          color={settings.color}
          lineWidth={settings.width}
          transparent
          opacity={settings.opacity}
          {...dashProps}
        />
      ))}
    </group>
  )
}

export function BorderLines({
  worldBoundaries,
  indiaBoundaries,
  earthRadius,
  borderAltitude = 0.004,
}: BorderLinesProps) {
  const borderSettings = useRegionStore((s) => s.borderSettings)

  const countryRadius = earthRadius + borderAltitude
  const stateRadius = earthRadius + borderAltitude + 0.002

  const countryRings = useMemo(
    () => buildBorderRings(worldBoundaries, countryRadius, 'country'),
    [worldBoundaries, countryRadius],
  )

  const indiaRings = useMemo(
    () => buildBorderRings(indiaBoundaries, stateRadius, 'in'),
    [indiaBoundaries, stateRadius],
  )

  return (
    <group>
      <BorderLayer rings={countryRings} settings={borderSettings.countries} />
      <BorderLayer rings={indiaRings} settings={borderSettings.indiaStates} />
    </group>
  )
}
