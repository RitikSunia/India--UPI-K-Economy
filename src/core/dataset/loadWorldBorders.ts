import worldBoundariesUrl from '../../../datasets/world-countries/boundaries.geojson?url'
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'

export type WorldBoundariesCollection = FeatureCollection<Geometry, GeoJsonProperties>

async function loadGeoJson(url: string): Promise<WorldBoundariesCollection> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load world borders from ${url}`)
  }
  return (await response.json()) as WorldBoundariesCollection
}

export async function loadWorldBorders(): Promise<WorldBoundariesCollection> {
  return loadGeoJson(worldBoundariesUrl)
}
