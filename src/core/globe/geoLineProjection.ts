import { Vector3 } from 'three'
import type { FeatureCollection, Geometry, Polygon, Position } from 'geojson'
import { latLngToVector3 } from './geoProjection'

export interface BorderRing {
  id: string
  points: Vector3[]
}

function ringToPoints(ring: Position[], radius: number, maxPoints = 120): Vector3[] {
  const step = ring.length > maxPoints ? Math.ceil(ring.length / maxPoints) : 1
  const points: Vector3[] = []

  for (let i = 0; i < ring.length; i += step) {
    const [lng, lat] = ring[i]
    points.push(latLngToVector3(lat, lng, radius))
  }

  if (ring.length > 0) {
    const [lng, lat] = ring[ring.length - 1]
    const last = latLngToVector3(lat, lng, radius)
    const prev = points[points.length - 1]
    if (!prev || prev.distanceTo(last) > 0.0001) {
      points.push(last)
    }
  }

  return points.length >= 2 ? points : []
}

function polygonRings(polygon: Polygon): Position[][] {
  return polygon.coordinates
}

function geometryRings(geometry: Geometry): Position[][] {
  if (geometry.type === 'Polygon') {
    return polygonRings(geometry)
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((poly) => polygonRings({ type: 'Polygon', coordinates: poly }))
  }
  return []
}

export function buildBorderRings(
  collection: FeatureCollection,
  radius: number,
  idPrefix: string,
): BorderRing[] {
  const rings: BorderRing[] = []

  collection.features.forEach((feature, featureIndex) => {
    const featureId =
      (feature.properties as Record<string, string> | null)?.iso_3166_2 ??
      (feature.properties as Record<string, string> | null)?.iso_a2 ??
      (feature.properties as Record<string, string> | null)?.name ??
      `${idPrefix}-${featureIndex}`

    const featureRings = geometryRings(feature.geometry)
    featureRings.forEach((ring, ringIndex) => {
      const points = ringToPoints(ring, radius)
      if (points.length >= 2) {
        rings.push({
          id: `${featureId}-${ringIndex}`,
          points,
        })
      }
    })
  })

  return rings
}
