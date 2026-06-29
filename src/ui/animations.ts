import gsap from 'gsap'

export function animateDetailCard(
  cardEl: HTMLElement | null,
  rowEls: HTMLElement[],
  visible: boolean,
): gsap.core.Timeline {
  const tl = gsap.timeline()

  if (!cardEl) return tl

  if (visible) {
    gsap.set(cardEl, { display: 'block' })
    tl.fromTo(
      cardEl,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    )
    if (rowEls.length) {
      tl.fromTo(
        rowEls,
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: 'power2.out',
        },
        '-=0.15',
      )
    }
  } else {
    tl.to(cardEl, {
      opacity: 0,
      y: 8,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(cardEl, { display: 'none' })
      },
    })
  }

  return tl
}

export function animateStatePanel(
  panelEl: HTMLElement | null,
  rowEls: HTMLElement[],
  visible: boolean,
): gsap.core.Timeline {
  const tl = gsap.timeline()
  if (!panelEl) return tl

  if (visible) {
    gsap.set(panelEl, { display: 'flex' })
    tl.fromTo(
      panelEl,
      { opacity: 0, x: 26 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
    )
    if (rowEls.length) {
      tl.fromTo(
        rowEls,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
        },
        '-=0.25',
      )
    }
  } else {
    tl.to(panelEl, {
      opacity: 0,
      x: 16,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(panelEl, { display: 'none' })
      },
    })
  }

  return tl
}

export function animateHeroValue(
  el: HTMLElement | null,
  from: number,
  to: number,
  decimals = 1,
  duration = 0.7,
): gsap.core.Tween | null {
  if (!el) return null
  const proxy = { value: from }
  return gsap.to(proxy, {
    value: to,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = proxy.value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    },
  })
}

export function clampPosition(
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  padding = 16,
) {
  const maxX = window.innerWidth - cardWidth - padding
  const maxY = window.innerHeight - cardHeight - padding
  return {
    x: Math.min(Math.max(x + 24, padding), maxX),
    y: Math.min(Math.max(y - cardHeight / 2, padding), maxY),
  }
}
