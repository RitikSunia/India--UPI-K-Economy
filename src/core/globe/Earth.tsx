import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import { useRegionStore } from '../store/useRegionStore'
import { resolveEarthTexturePaths, type EarthTextureSet } from './earthTextures'

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPositionW;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPositionW = worldPos.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const realisticFragmentShader = /* glsl */ `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D bumpTexture;
uniform vec3 sunDirection;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPositionW;

void main() {
  vec3 normal = normalize(vNormalW);
  float bump = texture2D(bumpTexture, vUv).r;
  vec3 bumpedNormal = normalize(normal + bump * 0.08);

  float intensity = dot(bumpedNormal, normalize(sunDirection));
  float dayMix = smoothstep(-0.15, 0.25, intensity);

  vec3 dayColor = texture2D(dayTexture, vUv).rgb;
  vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.35;

  vec3 color = mix(nightColor, dayColor, dayMix);

  float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
  color += vec3(0.08, 0.12, 0.2) * fresnel * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
`

const nightFragmentShader = /* glsl */ `
uniform sampler2D nightTexture;

varying vec2 vUv;
varying vec3 vNormalW;

void main() {
  vec3 normal = normalize(vNormalW);
  vec3 color = texture2D(nightTexture, vUv).rgb * 1.4;

  float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
  color += vec3(0.06, 0.1, 0.18) * fresnel * 0.2;

  gl_FragColor = vec4(color, 1.0);
}
`

interface EarthProps {
  radius: number
  onBackgroundClick?: () => void
  texturePaths?: Partial<EarthTextureSet>
}

function RealisticEarth({
  radius,
  onBackgroundClick,
  texturePaths,
}: EarthProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const introComplete = useRegionStore((s) => s.introComplete)
  const paths = resolveEarthTexturePaths(texturePaths)

  const [dayMap, nightMap, bumpMap] = useLoader(TextureLoader, [
    paths.day,
    paths.night,
    paths.bump,
  ])

  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      bumpTexture: { value: bumpMap },
      sunDirection: { value: new THREE.Vector3(1, 0.2, 0.5).normalize() },
    }),
    [dayMap, nightMap, bumpMap],
  )

  useFrame(({ clock }) => {
    if (!meshRef.current || !introComplete) return
    const material = meshRef.current.material as THREE.ShaderMaterial
    const t = clock.getElapsedTime() * 0.05
    material.uniforms.sunDirection.value.set(Math.cos(t), 0.25, Math.sin(t)).normalize()
  })

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation()
        onBackgroundClick?.()
      }}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={realisticFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function NightEarth({ radius, onBackgroundClick, texturePaths }: EarthProps) {
  const paths = resolveEarthTexturePaths(texturePaths)
  const nightMap = useLoader(TextureLoader, paths.night)

  const uniforms = useMemo(
    () => ({
      nightTexture: { value: nightMap },
    }),
    [nightMap],
  )

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation()
        onBackgroundClick?.()
      }}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={nightFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function PoliticalEarth({ radius, onBackgroundClick, texturePaths }: EarthProps) {
  const paths = resolveEarthTexturePaths(texturePaths)
  const politicalMap = useLoader(TextureLoader, paths.political)

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation()
        onBackgroundClick?.()
      }}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={politicalMap} roughness={0.95} metalness={0} />
    </mesh>
  )
}

export function Earth({ radius, onBackgroundClick, texturePaths }: EarthProps) {
  const mapStyle = useRegionStore((s) => s.mapStyle)

  if (mapStyle === 'political') {
    return (
      <PoliticalEarth
        radius={radius}
        onBackgroundClick={onBackgroundClick}
        texturePaths={texturePaths}
      />
    )
  }

  if (mapStyle === 'night') {
    return (
      <NightEarth
        radius={radius}
        onBackgroundClick={onBackgroundClick}
        texturePaths={texturePaths}
      />
    )
  }

  return (
    <RealisticEarth
      radius={radius}
      onBackgroundClick={onBackgroundClick}
      texturePaths={texturePaths}
    />
  )
}

const atmosphereVertex = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const atmosphereFragment = /* glsl */ `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
  gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * intensity;
}
`

export function Atmosphere({ radius, dimmed = false }: { radius: number; dimmed?: boolean }) {
  return (
    <mesh scale={[1.04, 1.04, 1.04]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        opacity={dimmed ? 0.25 : 1}
      />
    </mesh>
  )
}
