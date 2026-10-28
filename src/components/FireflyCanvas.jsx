import { useEffect, useRef } from 'react'

export default function FireflyCanvas({ active = true, count = 28 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Palette of warm fireflies and soft lavender stardust
    const colors = [
      'rgba(240, 205, 125, ',
      'rgba(255, 230, 160, ',
      'rgba(215, 195, 245, ',
      'rgba(180, 220, 205, '
    ]

    const fireflies = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
      targetAlpha: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.35 - 0.1,
      pulseSpeed: Math.random() * 0.02 + 0.008
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i]

        f.x += f.speedX
        f.y += f.speedY

        // Wrap around bounds
        if (f.y < -10) f.y = height + 10
        if (f.x < -10) f.x = width + 10
        if (f.x > width + 10) f.x = -10

        // Gentle breathing pulse
        f.alpha += (f.targetAlpha - f.alpha) * f.pulseSpeed
        if (Math.abs(f.targetAlpha - f.alpha) < 0.05) {
          f.targetAlpha = Math.random() * 0.7 + 0.2
        }

        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3.5)
        gradient.addColorStop(0, `${f.color}${f.alpha})`)
        gradient.addColorStop(0.5, `${f.color}${f.alpha * 0.4})`)
        gradient.addColorStop(1, `${f.color}0)`)

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(f.x, f.y, f.size * 3.5, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [active, count])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.85
      }}
      aria-hidden="true"
    />
  )
}
