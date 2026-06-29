import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Atmosphere, Earth } from './Earth'
import { StarsBackground } from './StarsBackground'
import { StateMeshes } from './StateMeshes'
import { BorderLines } from './BorderLines'
import { CameraController } from './CameraController'
import { useRegionStore } from '../store/useRegionStore'
import { getCentroid } from './geoProjection'
import type { LoadedDataset } from '../dataset/types'
import type { WorldBoundariesCollection } from '../dataset/loadWorldBorders'

interface GlobeSceneProps {
  dataset: LoadedDataset
  worldBoundaries: WorldBoundariesCollection
}

function GlobeContent({ dataset, worldBoundaries }: GlobeSceneProps) {
  const clearSelection = useRegionStore((s) => s.clearSelection)
  const mapStyle = useRegionStore((s) => s.mapStyle)
  const { config, boundaries } = dataset
  const { globe, theme, camera, intro } = config

  const texturePaths = theme.textures

  const regionCentroids = useMemo(() => {
    const map = new Map<string, [number, number]>()
    for (const feature of boundaries.features) {
      map.set(feature.properties.iso_3166_2, getCentroid(feature.geometry))
    }
    return map
  }, [boundaries])

  const showAtmosphere = mapStyle !== 'political'
  const ambientIntensity = mapStyle === 'political' ? 0.85 : 0.35
  const directionalIntensity = mapStyle === 'political' ? 0.25 : 1.4

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 2, 3]} intensity={directionalIntensity} />
      <StarsBackground dimmed={mapStyle === 'political'} />
      <Earth
        radius={globe.earthRadius}
        onBackgroundClick={clearSelection}
        texturePaths={texturePaths}
      />
      {showAtmosphere && <Atmosphere radius={globe.earthRadius} />}
      <BorderLines
        worldBoundaries={worldBoundaries}
        indiaBoundaries={boundaries}
        earthRadius={globe.earthRadius}
      />
      <StateMeshes
        boundaries={boundaries}
        radius={globe.earthRadius}
        altitude={globe.stateAltitude}
        hoverColor={theme.hoverColor}
        selectColor={theme.selectColor}
      />
      <CameraController
        flyToDuration={camera.flyToDuration}
        flyToAltitude={camera.flyToAltitude}
        intro={intro}
        autoRotateSpeed={globe.autoRotateSpeed}
        earthRadius={globe.earthRadius}
        regionCentroids={regionCentroids}
      />
    </>
  )
}

export function GlobeScene({ dataset, worldBoundaries }: GlobeSceneProps) {
  return (
    <Canvas
      className="globe-canvas"
      camera={{ position: [0, 0, 4], fov: 45, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#020617']} />
      <Suspense fallback={null}>
        <GlobeContent dataset={dataset} worldBoundaries={worldBoundaries} />
      </Suspense>
    </Canvas>
  )
}
