/** Public CDN textures (no local files required for deploy). */
const CDN = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img'

export type EarthTextureSet = {
  day: string
  night: string
  bump: string
  political: string
}

export const EARTH_TEXTURE_URLS: EarthTextureSet = {
  day: `${CDN}/earth-blue-marble.jpg`,
  night: `${CDN}/earth-night.jpg`,
  bump: `${CDN}/earth-topology.png`,
  political: `${CDN}/earth-blue-marble.jpg`,
}

/** Resolve config paths for GitHub Pages subpath deploys; keep CDN/https as-is. */
export function resolveEarthTexturePaths(
  overrides?: Partial<EarthTextureSet>,
): EarthTextureSet {
  const base = import.meta.env.BASE_URL
  const resolve = (path: string) => {
    if (/^https?:\/\//i.test(path)) return path
    const normalized = path.replace(/^\//, '')
    return `${base}${normalized}`
  }

  const merged: EarthTextureSet = { ...EARTH_TEXTURE_URLS }
  if (!overrides) return merged

  for (const key of Object.keys(overrides) as (keyof EarthTextureSet)[]) {
    const value = overrides[key]
    if (value) merged[key] = resolve(value)
  }
  return merged
}
