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
