import earcut from 'earcut'
import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import type { Geometry, MultiPolygon, Polygon, Position } from 'geojson'
import type { RegionMeshData } from '../dataset/types'

const DEG2RAD = Math.PI / 180

export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): Vector3 {
  const phi = (90 - lat) * DEG2RAD
  const theta = (lng + 180) * DEG2RAD
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function getExteriorRing(polygon: Polygon | MultiPolygon): Position[] {
  if (polygon.type === 'Polygon') {
    return polygon.coordinates.reduce((largest, ring) =>
      ring.length > largest.length ? ring : largest,
    polygon.coordinates[0])
  }

  return polygon.coordinates
    .map((poly) => poly[0])
    .reduce((largest, ring) => (ring.length > largest.length ? ring : largest))
}

export function getCentroid(geometry: Geometry): [number, number] {
  const ring = getExteriorRing(geometry as Polygon | MultiPolygon)
  let sumLng = 0
  let sumLat = 0
  const count = Math.max(ring.length - 1, 1)

  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0]
    sumLat += ring[i][1]
  }

  return [sumLng / count, sumLat / count]
}

function flattenPolygonCoords(polygon: Polygon): {
  flat: number[]
  holeIndices: number[]
} {
  const flat: number[] = []
  const holeIndices: number[] = []
  let count = 0

  for (let i = 0; i < polygon.coordinates.length; i++) {
    const ring = polygon.coordinates[i]
    if (i > 0) holeIndices.push(count)
    for (const [lng, lat] of ring) {
      flat.push(lng, lat)
      count++
    }
  }

  return { flat, holeIndices }
}

function buildGeometryFromPolygon(
  polygon: Polygon,
  radius: number,
  altitude: number,
): BufferGeometry | null {
  const { flat, holeIndices } = flattenPolygonCoords(polygon)
  if (flat.length < 6) return null

  const indices = earcut(flat, holeIndices.length ? holeIndices : undefined, 2)
  if (!indices.length) return null

  const positions: number[] = []
  const finalRadius = radius + altitude

  for (let i = 0; i < flat.length; i += 2) {
    const v = latLngToVector3(flat[i + 1], flat[i], finalRadius)
    positions.push(v.x, v.y, v.z)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function geometryFromFeature(
  geometry: Geometry,
  radius: number,
  altitude: number,
): BufferGeometry | null {
  if (geometry.type === 'Polygon') {
    return buildGeometryFromPolygon(geometry, radius, altitude)
  }

  if (geometry.type === 'MultiPolygon') {
    const geometries = geometry.coordinates
      .map((coords) => buildGeometryFromPolygon({ type: 'Polygon', coordinates: coords }, radius, altitude))
      .filter((g): g is BufferGeometry => g !== null)

    if (!geometries.length) return null
    if (geometries.length === 1) return geometries[0]

    const merged = geometries[0].clone()
    for (let i = 1; i < geometries.length; i++) {
      const g = geometries[i]
      const pos = merged.getAttribute('position')
      const add = g.getAttribute('position')
      const next = new Float32Array(pos.count * 3 + add.count * 3)
      next.set(pos.array as Float32Array, 0)
      next.set(add.array as Float32Array, pos.count * 3)
      merged.setAttribute('position', new BufferAttribute(next, 3))

      const baseIndex = pos.count
      const idx = merged.getIndex()
      const addIdx = g.getIndex()
      if (idx && addIdx) {
        const mergedIdx = new Uint32Array(idx.count + addIdx.count)
        mergedIdx.set(idx.array as Uint32Array, 0)
        const addArray = addIdx.array as Uint32Array
        for (let j = 0; j < addArray.length; j++) {
          mergedIdx[idx.count + j] = addArray[j] + baseIndex
        }
        merged.setIndex(new BufferAttribute(mergedIdx, 1))
      }
    }
    merged.computeVertexNormals()
    return merged
  }

  return null
}

export function buildRegionMeshes(
  boundaries: import('../dataset/types').BoundariesCollection,
  radius: number,
  altitude: number,
): RegionMeshData[] {
  return boundaries.features
    .map((feature) => {
      const geometry = geometryFromFeature(feature.geometry, radius, altitude)
      if (!geometry) return null

      const regionId = feature.properties.iso_3166_2
      const centroid = getCentroid(feature.geometry)

      return {
        regionId,
        name: feature.properties.name,
        centroid,
        geometry,
      }
    })
    .filter((item): item is RegionMeshData => item !== null)
}

export function lngLatToSpherical(lng: number, lat: number) {
  const phi = (90 - lat) * DEG2RAD
  const theta = (lng + 180) * DEG2RAD
  return { phi, theta }
}
