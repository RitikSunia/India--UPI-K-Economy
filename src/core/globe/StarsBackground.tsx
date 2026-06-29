import { Stars } from '@react-three/drei'

export function StarsBackground({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <Stars
      radius={120}
      depth={60}
      count={dimmed ? 2500 : 6000}
      factor={dimmed ? 2 : 4}
      saturation={0}
      fade
      speed={0.4}
    />
  )
}
