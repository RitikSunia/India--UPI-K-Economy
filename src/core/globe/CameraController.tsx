import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls as DreiOrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { latLngToVector3 } from './geoProjection'
import { useRegionStore } from '../store/useRegionStore'

interface CameraControllerProps {
  flyToDuration: number
  flyToAltitude: number
  intro: {
    targetLng: number
    targetLat: number
    duration: number
    startAltitude: number
    endAltitude: number
  }
  autoRotateSpeed: number
  earthRadius: number
  regionCentroids: Map<string, [number, number]>
}

const ORIGIN = new Vector3(0, 0, 0)

export function CameraController({
  flyToDuration,
  flyToAltitude,
  intro,
  autoRotateSpeed,
  earthRadius,
  regionCentroids,
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const selectedId = useRegionStore((s) => s.selectedId)
  const introComplete = useRegionStore((s) => s.introComplete)
  const autoRotateEnabled = useRegionStore((s) => s.autoRotateEnabled)
  const setIntroComplete = useRegionStore((s) => s.setIntroComplete)
  const flyingRef = useRef(false)

  const cameraPositionForLngLat = (lng: number, lat: number, distance: number) =>
    latLngToVector3(lat, lng, 1).normalize().multiplyScalar(distance)

  const flyToLngLat = (lng: number, lat: number, distance: number, duration: number) => {
    const controls = controlsRef.current
    if (!controls) return

    flyingRef.current = true
    controls.autoRotate = false

    const endPos = cameraPositionForLngLat(lng, lat, distance)
    const startPos = camera.position.clone()

    controls.target.copy(ORIGIN)

    const proxy = { t: 0 }
    gsap.to(proxy, {
      t: 1,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.position.lerpVectors(startPos, endPos, proxy.t)
        controls.target.copy(ORIGIN)
        controls.update()
      },
      onComplete: () => {
        camera.position.copy(endPos)
        controls.target.copy(ORIGIN)
        controls.update()
        flyingRef.current = false
        const enabled = useRegionStore.getState().autoRotateEnabled
        controls.autoRotate = enabled && useRegionStore.getState().introComplete
      },
    })
  }

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    controls.enabled = false
    controls.autoRotate = false
    controls.target.copy(ORIGIN)

    const timer = setTimeout(() => {
      flyToLngLat(intro.targetLng, intro.targetLat, intro.endAltitude, intro.duration)

      setTimeout(() => {
        setIntroComplete(true)
        controls.enabled = true
        controls.target.copy(ORIGIN)
        controls.autoRotate = useRegionStore.getState().autoRotateEnabled
        controls.update()
      }, intro.duration * 1000 + 100)
    }, 400)

    camera.position.set(0, 0, intro.startAltitude)
    controls.target.copy(ORIGIN)
    controls.update()

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId || !introComplete) return
    const centroid = regionCentroids.get(selectedId)
    if (!centroid) return
    flyToLngLat(centroid[0], centroid[1], flyToAltitude, flyToDuration)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || flyingRef.current || !introComplete) return
    controls.autoRotate = autoRotateEnabled
  }, [autoRotateEnabled, introComplete])

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={earthRadius * 1.35}
      maxDistance={earthRadius * 5}
      autoRotate={false}
      autoRotateSpeed={autoRotateSpeed}
      onChange={() => {
        controlsRef.current?.target.copy(ORIGIN)
      }}
    />
  )
}
