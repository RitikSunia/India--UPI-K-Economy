import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, DoubleSide, MeshStandardMaterial, Vector3 } from 'three'
import { Html } from '@react-three/drei'
import { buildRegionMeshes, latLngToVector3 } from './geoProjection'
import { GOA_REGION_ID } from '../constants'
import { useRegionStore } from '../store/useRegionStore'
import { useAtlasStore } from '../store/useAtlasStore'
import { useActiveMetric } from '../metrics/useActiveMetric'
import { getMetricColor } from '../metrics/metricColor'
import type { BoundariesCollection } from '../dataset/types'

const NO_DATA_COLOR = '#3d4f5c'

interface StateMeshesProps {
  boundaries: BoundariesCollection
  radius: number
  altitude: number
  hoverColor: string
  selectColor: string
}

function StateMesh({
  regionId,
  name,
  geometry,
  hoverColor,
  selectColor,
}: {
  regionId: string
  name: string
  geometry: import('three').BufferGeometry
  hoverColor: string
  selectColor: string
}) {
  const materialRef = useRef<MeshStandardMaterial>(null)
  const selectedId = useRegionStore((s) => s.selectedId)
  const hoveredId = useRegionStore((s) => s.hoveredId)
  const mapStyle = useRegionStore((s) => s.mapStyle)
  const borderSettings = useRegionStore((s) => s.borderSettings)
  const includeGoa = useAtlasStore((s) => s.includeGoa)
  const regionMetrics = useRegionStore((s) => s.dataset?.regions[regionId]?.metrics)
  const activeMetric = useActiveMetric()
  const setSelectedId = useRegionStore((s) => s.setSelectedId)
  const setHoveredId = useRegionStore((s) => s.setHoveredId)

  const isExcludedFromAnalysis = !includeGoa && regionId === GOA_REGION_ID
  const isSelected = selectedId === regionId
  const isHovered = hoveredId === regionId
  const isPolitical = mapStyle === 'political'

  const choroplethColor = useMemo(() => {
    if (!borderSettings.showStateFills) return borderSettings.stateFillColor

    if (borderSettings.stateFillMode === 'manual') {
      return borderSettings.stateFillColors[regionId] ?? borderSettings.stateFillColor
    }

    if (!activeMetric) return borderSettings.stateFillColor
    const value = regionMetrics?.[activeMetric.key]
    return value != null ? getMetricColor(value, activeMetric) : NO_DATA_COLOR
  }, [
    activeMetric,
    borderSettings.showStateFills,
    borderSettings.stateFillColor,
    borderSettings.stateFillMode,
    borderSettings.stateFillColors,
    regionId,
    regionMetrics,
  ])

  useFrame(() => {
    const mat = materialRef.current
    if (!mat) return

    const hoverOpacity = isPolitical ? 0.68 : 0.58
    const selectOpacity = isPolitical ? 0.92 : 0.82
    const baseOpacity = borderSettings.showStateFills
      ? Math.min(borderSettings.stateFillOpacity + 0.28, 0.72)
      : 0
    const excludedOpacity = isExcludedFromAnalysis ? 0.04 : baseOpacity
    const targetOpacity = isSelected
      ? selectOpacity
      : isHovered
        ? hoverOpacity
        : excludedOpacity

    const fillColor = choroplethColor
    const targetColor = new Color(
      isSelected ? selectColor : isHovered ? hoverColor : fillColor,
    )

    mat.opacity += (targetOpacity - mat.opacity) * 0.18
    mat.color.lerp(targetColor, 0.18)
    mat.emissive.lerp(targetColor, isSelected || isHovered ? 0.14 : 0.06)
  })

  return (
    <mesh
      geometry={geometry}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        setHoveredId(regionId)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'default'
        setHoveredId(null)
      }}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedId(regionId)
      }}
    >
      <meshStandardMaterial
        ref={materialRef}
        transparent
        opacity={0}
        color={hoverColor}
        emissive={hoverColor}
        emissiveIntensity={0.15}
        side={DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
      {isHovered && !isSelected && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="region-tooltip">{name}</div>
        </Html>
      )}
    </mesh>
  )
}

export function StateMeshes({
  boundaries,
  radius,
  altitude,
  hoverColor,
  selectColor,
}: StateMeshesProps) {
  const meshes = useMemo(
    () => buildRegionMeshes(boundaries, radius, altitude),
    [boundaries, radius, altitude],
  )

  const { camera, size } = useThree()
  const selectedId = useRegionStore((s) => s.selectedId)
  const setScreenPosition = useRegionStore((s) => s.setScreenPosition)
  const vec = useMemo(() => new Vector3(), [])

  useFrame(() => {
    if (!selectedId) {
      setScreenPosition(null)
      return
    }

    const selected = meshes.find((m) => m.regionId === selectedId)
    if (!selected) return

    const [lng, lat] = selected.centroid
    const pos = latLngToVector3(lat, lng, radius + altitude + 0.02)
    vec.copy(pos).project(camera)

    const sx = ((vec.x + 1) / 2) * size.width
    const sy = ((-vec.y + 1) / 2) * size.height
    setScreenPosition({ x: sx, y: sy })
  })

  return (
    <group>
      {meshes.map((mesh) => (
        <StateMesh
          key={mesh.regionId}
          regionId={mesh.regionId}
          name={mesh.name}
          geometry={mesh.geometry}
          hoverColor={hoverColor}
          selectColor={selectColor}
        />
      ))}
    </group>
  )
}
