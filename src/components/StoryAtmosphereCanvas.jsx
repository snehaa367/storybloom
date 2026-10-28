import { useEffect, useRef } from 'react'

/**
 * StoryAtmosphereCanvas
 * High-performance, lightweight storybook atmosphere rendering bespoke
 * magical animations for each of the 15 Storybloom tales.
 *
 * Fully respects prefers-reduced-motion and cleans up cleanly on unmount.
 */
export default function StoryAtmosphereCanvas({ storyId }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let prefersReducedMotion = mediaQuery.matches
    const handleMotionChange = (e) => { prefersReducedMotion = e.matches }
    mediaQuery.addEventListener('change', handleMotionChange)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width && entry.contentRect.height) {
          width = canvas.width = Math.floor(entry.contentRect.width)
          height = canvas.height = Math.floor(entry.contentRect.height)
        }
      }
    })

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    // Helper: Star shape
    const drawStar = (cx, cy, spikes, outerRadius, innerRadius, fillStyle, rotation = 0) => {
      let rot = (Math.PI / 2) * 3 + rotation
      let x = cx
      let y = cy
      const step = Math.PI / spikes

      ctx.beginPath()
      ctx.moveTo(cx, cy - outerRadius)
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius
        y = cy + Math.sin(rot) * outerRadius
        ctx.lineTo(x, y)
        rot += step

        x = cx + Math.cos(rot) * innerRadius
        y = cy + Math.sin(rot) * innerRadius
        ctx.lineTo(x, y)
        rot += step
      }
      ctx.lineTo(cx, cy - outerRadius)
      ctx.closePath()
      ctx.fillStyle = fillStyle
      ctx.fill()
    }

    // Helper: Gear shape for Clockmaker
    const drawGear = (cx, cy, outerRadius, innerRadius, teeth, angle, color) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5

      for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2
        const a2 = ((i + 0.35) / teeth) * Math.PI * 2
        const a3 = ((i + 0.65) / teeth) * Math.PI * 2
        const a4 = ((i + 1) / teeth) * Math.PI * 2

        const rOut = outerRadius
        const rIn = outerRadius - 5

        if (i === 0) {
          ctx.moveTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn)
        } else {
          ctx.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn)
        }
        ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut)
        ctx.lineTo(Math.cos(a3) * rOut, Math.sin(a3) * rOut)
        ctx.lineTo(Math.cos(a4) * rIn, Math.sin(a4) * rIn)
      }
      ctx.closePath()
      ctx.stroke()

      // Inner axle hole
      ctx.beginPath()
      ctx.arc(0, 0, innerRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // Story-specific state setup
    let state = {}
    let time = 0

    switch (storyId) {
      // 1. Moon Painter: Floating stars, glowing moon, sparkling paint particles, moving clouds
      case 'moon-painter': {
        state.stars = Array.from({ length: 22 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          radius: Math.random() * 2.5 + 1.2,
          alpha: Math.random() * 0.5 + 0.2,
          speed: Math.random() * 0.02 + 0.008,
          driftY: Math.random() * 0.15 + 0.05
        }))
        state.paintParticles = Array.from({ length: 18 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3 + 1.5,
          color: ['#B9A0FF', '#D6C9FF', '#FFDF9E', '#93C5FD'][Math.floor(Math.random() * 4)],
          alpha: Math.random() * 0.6 + 0.2,
          vy: -Math.random() * 0.35 - 0.1,
          vx: (Math.random() - 0.5) * 0.3
        }))
        state.clouds = [
          { x: 0.15 * width, y: 0.18 * height, w: 140, h: 42, speed: 0.08 },
          { x: 0.65 * width, y: 0.12 * height, w: 190, h: 54, speed: 0.06 }
        ]
        break
      }

      // 2. Whispering Willow: Slowly moving branches, falling leaves, floating magical particles
      case 'whispering-willow': {
        state.leaves = Array.from({ length: 16 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 6 + 5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          speedY: Math.random() * 0.45 + 0.2,
          oscX: Math.random() * Math.PI * 2,
          oscSpeed: Math.random() * 0.03 + 0.015,
          color: ['rgba(175, 195, 160, 0.45)', 'rgba(215, 200, 160, 0.4)'][Math.floor(Math.random() * 2)]
        }))
        state.spores = Array.from({ length: 20 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2,
          speedY: -Math.random() * 0.25 - 0.08
        }))
        break
      }

      // 3. Kingdom Beneath the Lake: Floating bubbles, underwater light rays, moving sea plants
      case 'kingdom-beneath-lake': {
        state.bubbles = Array.from({ length: 24 }, () => ({
          x: Math.random() * width,
          y: height + Math.random() * 100,
          radius: Math.random() * 5 + 2,
          speedY: Math.random() * 0.6 + 0.25,
          osc: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.35 + 0.15
        }))
        state.lightRays = [
          { x: width * 0.25, angle: 0.22, width: 90, alpha: 0.07 },
          { x: width * 0.7, angle: 0.18, width: 120, alpha: 0.06 }
        ]
        break
      }

      // 4. Lantern Keeper: Glowing lantern, floating fireflies, subtle light effects
      case 'lantern-keeper': {
        state.fireflies = Array.from({ length: 22 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.2 + 1,
          alpha: Math.random() * 0.7 + 0.3,
          pulse: Math.random() * 0.04 + 0.02,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.35
        }))
        break
      }

      // 5. Library of Lost Dreams: Floating magical books, glowing dust, slowly moving particles
      case 'library-lost-dreams': {
        state.books = Array.from({ length: 5 }, (_, i) => ({
          x: (width * 0.15) + (i * width * 0.18) + (Math.random() * 40 - 20),
          y: height * 0.3 + (Math.random() * 200),
          w: 22,
          h: 28,
          angle: (Math.random() - 0.5) * 0.4,
          driftY: -Math.random() * 0.15 - 0.08,
          alpha: 0.28
        }))
        state.dustMotes = Array.from({ length: 25 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          speedX: (Math.random() - 0.5) * 0.15
        }))
        break
      }

      // 6. Girl Who Followed Fireflies: Fireflies moving gently across scene, glowing flowers
      case 'girl-followed-fireflies': {
        state.fireflies = Array.from({ length: 26 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.5 + 1.2,
          alpha: Math.random() * 0.7 + 0.2,
          pulse: Math.random() * 0.03 + 0.015,
          targetAlpha: Math.random() * 0.8 + 0.2,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -Math.random() * 0.25 - 0.05
        }))
        break
      }

      // 7. Clockmaker of Forgotten Hours: Slowly rotating clock hands, floating gears, magical clock particles
      case 'clockmaker-forgotten-hours': {
        state.gears = [
          { x: width * 0.12, y: height * 0.22, rOut: 38, rIn: 10, teeth: 10, angle: 0, speed: 0.003, color: 'rgba(215, 195, 140, 0.18)' },
          { x: width * 0.19, y: height * 0.26, rOut: 26, rIn: 7, teeth: 8, angle: 0.2, speed: -0.0045, color: 'rgba(185, 160, 255, 0.18)' },
          { x: width * 0.86, y: height * 0.78, rOut: 46, rIn: 12, teeth: 12, angle: 0, speed: 0.0025, color: 'rgba(215, 195, 140, 0.15)' }
        ]
        state.clockParticles = Array.from({ length: 20 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.15,
          speedY: -Math.random() * 0.2 - 0.05
        }))
        break
      }

      // 8. Garden of Sleeping Stars: Twinkling stars, glowing flowers, soft moonlight
      case 'garden-sleeping-stars': {
        state.stars = Array.from({ length: 30 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height * 0.65,
          radius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * 0.03 + 0.01
        }))
        break
      }

      // 9. Fox and the Silver Crown: Gentle forest movement, floating leaves, magical sparkles
      case 'fox-silver-crown': {
        state.silverLeaves = Array.from({ length: 18 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 6 + 4,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          speedY: Math.random() * 0.35 + 0.15,
          osc: Math.random() * Math.PI * 2
        }))
        state.sparkles = Array.from({ length: 16 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.5 + 1.2,
          alpha: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.03 + 0.01
        }))
        break
      }

      // 10. Last Dragon of Lavender Valley: Slowly moving clouds, glowing dragon particles, gentle magical light
      case 'last-dragon-lavender-valley': {
        state.clouds = [
          { x: -50, y: height * 0.15, w: 280, h: 70, speed: 0.1 },
          { x: width * 0.45, y: height * 0.25, w: 320, h: 80, speed: 0.07 }
        ]
        state.embers = Array.from({ length: 22 }, () => ({
          x: Math.random() * width,
          y: height + Math.random() * 40,
          size: Math.random() * 2.8 + 1,
          color: ['#D6C9FF', '#B9A0FF', '#C084FC', '#F472B6'][Math.floor(Math.random() * 4)],
          alpha: Math.random() * 0.7 + 0.2,
          vy: -Math.random() * 0.45 - 0.15,
          vx: (Math.random() - 0.5) * 0.3
        }))
        break
      }

      // 11. Door Behind the Moon: Glowing magical door, floating stars, subtle portal effect
      case 'door-behind-moon': {
        state.portalPulse = 0
        state.stars = Array.from({ length: 24 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.6 + 0.2,
          orbitRadius: Math.random() * 120 + 30,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1)
        }))
        break
      }

      // 12. Mermaid Who Collected Sunsets: Floating bubbles, shimmering water, changing sunset light
      case 'mermaid-collected-sunsets': {
        state.bubbles = Array.from({ length: 22 }, () => ({
          x: Math.random() * width,
          y: height + Math.random() * 60,
          radius: Math.random() * 4.5 + 2,
          speedY: Math.random() * 0.5 + 0.2,
          osc: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.35 + 0.15
        }))
        break
      }

      // 13. Secret Garden of Althea: Floating petals, glowing flowers, gently moving leaves
      case 'secret-garden-althea': {
        state.petals = Array.from({ length: 20 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 6 + 4,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          speedY: Math.random() * 0.4 + 0.18,
          osc: Math.random() * Math.PI * 2,
          color: ['rgba(244, 182, 194, 0.45)', 'rgba(225, 205, 245, 0.45)', 'rgba(255, 220, 210, 0.4)'][Math.floor(Math.random() * 3)]
        }))
        break
      }

      // 14. Ocean of Cloud Lilies: Floating cloud flowers, soft waves, drifting magical particles
      case 'cloud-lilies': {
        state.lilies = Array.from({ length: 8 }, (_, i) => ({
          x: (width * 0.1) + (i * width * 0.12) + (Math.random() * 30 - 15),
          y: (height * 0.2) + (Math.random() * height * 0.5),
          size: Math.random() * 12 + 10,
          osc: Math.random() * Math.PI * 2,
          driftX: Math.random() * 0.15 + 0.05
        }))
        state.particles = Array.from({ length: 18 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.2,
          vy: (Math.random() - 0.5) * 0.15,
          vx: Math.random() * 0.2 + 0.05
        }))
        break
      }

      // 15. Star That Chose a Home: Softly glowing star (Pip), twinkling lights, falling stardust
      case 'star-chose-home': {
        state.pip = {
          x: width * 0.82,
          y: height * 0.18,
          size: 7,
          glow: 24,
          pulse: 0
        }
        state.stardust = Array.from({ length: 26 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 1,
          alpha: Math.random() * 0.6 + 0.2,
          speedY: Math.random() * 0.35 + 0.12,
          speedX: -Math.random() * 0.2 - 0.05
        }))
        break
      }

      default:
        break
    }

    // Main 60fps render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      if (!prefersReducedMotion) {
        time += 0.02
      }

      switch (storyId) {
        // 1. Moon Painter
        case 'moon-painter': {
          // Glowing Moon in top-left
          const moonX = width * 0.12
          const moonY = height * 0.14
          const moonPulse = prefersReducedMotion ? 0 : Math.sin(time * 0.8) * 3
          
          const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 70 + moonPulse)
          moonGlow.addColorStop(0, 'rgba(214, 201, 255, 0.25)')
          moonGlow.addColorStop(0.5, 'rgba(185, 160, 255, 0.08)')
          moonGlow.addColorStop(1, 'rgba(185, 160, 255, 0)')
          ctx.fillStyle = moonGlow
          ctx.beginPath()
          ctx.arc(moonX, moonY, 70 + moonPulse, 0, Math.PI * 2)
          ctx.fill()

          // Crescent moon silhouette
          ctx.save()
          ctx.fillStyle = 'rgba(235, 225, 255, 0.45)'
          ctx.beginPath()
          ctx.arc(moonX, moonY, 18, 0, Math.PI * 2, true)
          ctx.arc(moonX + 6, moonY - 4, 15, 0, Math.PI * 2, false)
          ctx.fill()
          ctx.restore()

          // Drifting clouds
          if (state.clouds) {
            state.clouds.forEach(c => {
              if (!prefersReducedMotion) {
                c.x += c.speed
                if (c.x > width + 100) c.x = -c.w - 50
              }
              const cloudGrad = ctx.createRadialGradient(c.x + c.w / 2, c.y + c.h / 2, 5, c.x + c.w / 2, c.y + c.h / 2, c.w / 2)
              cloudGrad.addColorStop(0, 'rgba(185, 160, 255, 0.07)')
              cloudGrad.addColorStop(0.8, 'rgba(136, 118, 181, 0.03)')
              cloudGrad.addColorStop(1, 'rgba(16, 13, 28, 0)')
              ctx.fillStyle = cloudGrad
              ctx.beginPath()
              ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2)
              ctx.fill()
            })
          }

          // Sparkling paint particles
          if (state.paintParticles) {
            state.paintParticles.forEach(p => {
              if (!prefersReducedMotion) {
                p.y += p.vy
                p.x += p.vx
                if (p.y < -10) p.y = height + 10
                if (p.x < -10) p.x = width + 10
                if (p.x > width + 10) p.x = -10
              }
              ctx.fillStyle = p.color
              ctx.globalAlpha = p.alpha * 0.45
              ctx.beginPath()
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
              ctx.fill()
              ctx.globalAlpha = 1.0
            })
          }

          // Floating stars
          if (state.stars) {
            state.stars.forEach(s => {
              const alphaPulse = prefersReducedMotion ? s.alpha : s.alpha + Math.sin(time * 2 + s.x) * 0.15
              drawStar(s.x, s.y, 4, s.radius * 2, s.radius * 0.8, `rgba(214, 201, 255, ${Math.max(0.1, alphaPulse)})`)
            })
          }
          break
        }

        // 2. Whispering Willow
        case 'whispering-willow': {
          // Swaying willow branches along top edges
          const sway = prefersReducedMotion ? 0 : Math.sin(time) * 12
          ctx.strokeStyle = 'rgba(160, 180, 150, 0.18)'
          ctx.lineWidth = 1.8
          ctx.beginPath()
          // Top left branch
          ctx.moveTo(0, 0)
          ctx.bezierCurveTo(width * 0.15, height * 0.08, width * 0.25, height * 0.18 + sway, width * 0.35, height * 0.28 + sway)
          ctx.stroke()
          // Top right branch
          ctx.beginPath()
          ctx.moveTo(width, 0)
          ctx.bezierCurveTo(width * 0.85, height * 0.08, width * 0.75, height * 0.18 - sway, width * 0.65, height * 0.28 - sway)
          ctx.stroke()

          // Falling willow leaves
          if (state.leaves) {
            state.leaves.forEach(l => {
              if (!prefersReducedMotion) {
                l.y += l.speedY
                l.oscX += l.oscSpeed
                l.x += Math.sin(l.oscX) * 0.5
                l.rotation += l.rotSpeed
                if (l.y > height + 20) {
                  l.y = -20
                  l.x = Math.random() * width
                }
              }
              ctx.save()
              ctx.translate(l.x, l.y)
              ctx.rotate(l.rotation)
              ctx.fillStyle = l.color
              ctx.beginPath()
              ctx.ellipse(0, 0, l.size, l.size * 0.35, 0, 0, Math.PI * 2)
              ctx.fill()
              ctx.restore()
            })
          }

          // Floating spores
          if (state.spores) {
            state.spores.forEach(sp => {
              if (!prefersReducedMotion) {
                sp.y += sp.speedY
                if (sp.y < -10) sp.y = height + 10
              }
              ctx.fillStyle = `rgba(214, 201, 255, ${sp.alpha * 0.4})`
              ctx.beginPath()
              ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2)
              ctx.fill()
            })
          }
          break
        }

        // 3. Kingdom Beneath the Lake
        case 'kingdom-beneath-lake': {
          // Underwater light rays
          if (state.lightRays) {
            state.lightRays.forEach((r, idx) => {
              const rayShift = prefersReducedMotion ? 0 : Math.sin(time * 0.6 + idx) * 20
              const grad = ctx.createLinearGradient(r.x + rayShift, 0, r.x + rayShift + 120, height)
              grad.addColorStop(0, `rgba(185, 160, 255, ${r.alpha})`)
              grad.addColorStop(0.6, `rgba(147, 197, 253, ${r.alpha * 0.5})`)
              grad.addColorStop(1, 'rgba(16, 13, 28, 0)')
              ctx.fillStyle = grad
              ctx.beginPath()
              ctx.moveTo(r.x + rayShift - r.width / 2, 0)
              ctx.lineTo(r.x + rayShift + r.width / 2, 0)
              ctx.lineTo(r.x + rayShift + 220, height)
              ctx.lineTo(r.x + rayShift + 60, height)
              ctx.closePath()
              ctx.fill()
            })
          }

          // Floating bubbles
          if (state.bubbles) {
            state.bubbles.forEach(b => {
              if (!prefersReducedMotion) {
                b.y -= b.speedY
                b.osc += 0.04
                b.x += Math.sin(b.osc) * 0.35
                if (b.y < -20) {
                  b.y = height + 20
                  b.x = Math.random() * width
                }
              }
              ctx.save()
              ctx.strokeStyle = `rgba(185, 160, 255, ${b.alpha})`
              ctx.lineWidth = 1.2
              ctx.beginPath()
              ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
              ctx.stroke()
              // Bubble specular highlight
              ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`
              ctx.beginPath()
              ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.28, 0, Math.PI * 2)
              ctx.fill()
              ctx.restore()
            })
          }

          // Gentle sea plants at bottom corners
          const plantSway = prefersReducedMotion ? 0 : Math.sin(time * 1.2) * 15
          ctx.strokeStyle = 'rgba(140, 165, 185, 0.2)'
          ctx.lineWidth = 2.5
          for (let p = 0; p < 4; p++) {
            const bx = width * 0.05 + p * 35
            ctx.beginPath()
            ctx.moveTo(bx, height)
            ctx.quadraticCurveTo(bx + plantSway, height - 70, bx + plantSway * 1.5, height - 140)
            ctx.stroke()
          }
          break
        }

        // 4. Lantern Keeper
        case 'lantern-keeper': {
          // Glowing Lantern in top-right
          const lanX = width * 0.88
          const lanY = height * 0.16
          const flicker = prefersReducedMotion ? 0 : Math.sin(time * 4) * 2 + Math.cos(time * 7) * 1.5

          const lanGlow = ctx.createRadialGradient(lanX, lanY, 5, lanX, lanY, 90 + flicker)
          lanGlow.addColorStop(0, 'rgba(255, 215, 140, 0.35)')
          lanGlow.addColorStop(0.4, 'rgba(214, 160, 255, 0.12)')
          lanGlow.addColorStop(1, 'rgba(16, 13, 28, 0)')
          ctx.fillStyle = lanGlow
          ctx.beginPath()
          ctx.arc(lanX, lanY, 90 + flicker, 0, Math.PI * 2)
          ctx.fill()

          // Brass lantern frame
          ctx.save()
          ctx.strokeStyle = 'rgba(215, 195, 140, 0.4)'
          ctx.lineWidth = 1.5
          ctx.strokeRect(lanX - 10, lanY - 14, 20, 28)
          ctx.beginPath()
          ctx.moveTo(lanX - 10, lanY - 14)
          ctx.lineTo(lanX, lanY - 24)
          ctx.lineTo(lanX + 10, lanY - 14)
          ctx.stroke()
          // Flame core
          ctx.fillStyle = 'rgba(255, 230, 160, 0.8)'
          ctx.beginPath()
          ctx.ellipse(lanX, lanY + flicker * 0.2, 4, 7, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()

          // Floating Fireflies
          if (state.fireflies) {
            state.fireflies.forEach(f => {
              if (!prefersReducedMotion) {
                f.x += f.vx
                f.y += f.vy
                if (f.x < 0) f.x = width
                if (f.x > width) f.x = 0
                if (f.y < 0) f.y = height
                if (f.y > height) f.y = 0
              }
              const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3)
              g.addColorStop(0, `rgba(255, 220, 130, ${f.alpha})`)
              g.addColorStop(1, 'rgba(255, 220, 130, 0)')
              ctx.fillStyle = g
              ctx.beginPath()
              ctx.arc(f.x, f.y, f.radius * 3, 0, Math.PI * 2)
              ctx.fill()
            })
          }
          break
        }

        // 5. Library of Lost Dreams
        case 'library-lost-dreams': {
          // Floating magical miniature books
          if (state.books) {
            state.books.forEach((b, i) => {
              if (!prefersReducedMotion) {
                b.y += b.driftY
                b.angle += Math.sin(time + i) * 0.002
                if (b.y < -40) b.y = height + 40
              }
              ctx.save()
              ctx.translate(b.x, b.y)
              ctx.rotate(b.angle)
              ctx.strokeStyle = 'rgba(185, 160, 255, 0.35)'
              ctx.fillStyle = 'rgba(33, 26, 53, 0.5)'
              ctx.lineWidth = 1.2
              ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h)
              ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h)
              // Book spine glow
              ctx.strokeStyle = 'rgba(214, 201, 255, 0.6)'
              ctx.beginPath()
              ctx.moveTo(-b.w / 2, -b.h / 2)
              ctx.lineTo(-b.w / 2, b.h / 2)
              ctx.stroke()
              ctx.restore()
            })
          }

          // Shimmering dust motes
          if (state.dustMotes) {
            state.dustMotes.forEach(m => {
              if (!prefersReducedMotion) {
                m.x += m.speedX
                m.y += m.speedY
                if (m.x < 0) m.x = width
                if (m.x > width) m.x = 0
                if (m.y < 0) m.y = height
                if (m.y > height) m.y = 0
              }
              ctx.fillStyle = `rgba(215, 195, 140, ${m.alpha * 0.4})`
              ctx.beginPath()
              ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2)
              ctx.fill()
            })
          }
          break
        }

        // 6. Girl Who Followed Fireflies
        case 'girl-followed-fireflies': {
          // Night meadow fireflies
          if (state.fireflies) {
            state.fireflies.forEach(f => {
              if (!prefersReducedMotion) {
                f.x += f.vx
                f.y += f.vy
                if (f.x < 0) f.x = width
                if (f.x > width) f.x = 0
                if (f.y < 0) f.y = height
                if (f.y > height) f.y = 0
              }
              const pulse = prefersReducedMotion ? f.alpha : f.alpha * (0.6 + Math.sin(time * 3 + f.x) * 0.4)
              const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3.5)
              g.addColorStop(0, `rgba(240, 220, 130, ${pulse})`)
              g.addColorStop(0.5, `rgba(185, 160, 255, ${pulse * 0.4})`)
              g.addColorStop(1, 'rgba(16, 13, 28, 0)')
              ctx.fillStyle = g
              ctx.beginPath()
              ctx.arc(f.x, f.y, f.radius * 3.5, 0, Math.PI * 2)
              ctx.fill()
            })
          }

          // Glowing meadow flowers along the bottom rim
          const flowerSway = prefersReducedMotion ? 0 : Math.sin(time * 1.5) * 6
          for (let f = 0; f < 6; f++) {
            const fx = width * 0.15 + f * (width * 0.14)
            const fy = height - 18
            ctx.fillStyle = 'rgba(214, 201, 255, 0.28)'
            ctx.beginPath()
            ctx.arc(fx + flowerSway, fy, 4, 0, Math.PI * 2)
            ctx.fill()
          }
          break
        }

        // 7. Clockmaker of Forgotten Hours
        case 'clockmaker-forgotten-hours': {
          // Rotating clock gears
          if (state.gears) {
            state.gears.forEach(g => {
              if (!prefersReducedMotion) {
                g.angle += g.speed
              }
              drawGear(g.x, g.y, g.rOut, g.rIn, g.teeth, g.angle, g.color)
            })
          }

          // Slowly rotating delicate clock hands in upper center
          const clockX = width * 0.5
          const clockY = height * 0.15
          const handAngle = prefersReducedMotion ? 0.8 : time * 0.15

          ctx.save()
          ctx.strokeStyle = 'rgba(215, 195, 140, 0.22)'
          ctx.lineWidth = 1.6
          // Center circle
          ctx.beginPath()
          ctx.arc(clockX, clockY, 3, 0, Math.PI * 2)
          ctx.stroke()
          // Minute hand
          ctx.beginPath()
          ctx.moveTo(clockX, clockY)
          ctx.lineTo(clockX + Math.cos(handAngle) * 36, clockY + Math.sin(handAngle) * 36)
          ctx.stroke()
          // Hour hand
          ctx.lineWidth = 2.2
          ctx.beginPath()
          ctx.moveTo(clockX, clockY)
          ctx.lineTo(clockX + Math.cos(handAngle * 0.1) * 22, clockY + Math.sin(handAngle * 0.1) * 22)
          ctx.stroke()
          ctx.restore()

          // Clock particles
          if (state.clockParticles) {
            state.clockParticles.forEach(cp => {
              if (!prefersReducedMotion) {
                cp.y += cp.speedY
                if (cp.y < -10) cp.y = height + 10
              }
              ctx.fillStyle = `rgba(215, 195, 140, ${cp.alpha * 0.3})`
              ctx.beginPath()
              ctx.arc(cp.x, cp.y, cp.size, 0, Math.PI * 2)
              ctx.fill()
            })
          }
          break
        }

        // 8. Garden of Sleeping Stars
        case 'garden-sleeping-stars': {
          // Moonlight wash
          const moonwash = ctx.createLinearGradient(0, 0, width, height)
          moonwash.addColorStop(0, 'rgba(185, 160, 255, 0.05)')
          moonwash.addColorStop(1, 'rgba(16, 13, 28, 0)')
          ctx.fillStyle = moonwash
          ctx.fillRect(0, 0, width, height)

          // Twinkling stars
          if (state.stars) {
            state.stars.forEach(s => {
              const alphaPulse = prefersReducedMotion ? s.alpha : s.alpha + Math.sin(time * 2 + s.x) * 0.2
              drawStar(s.x, s.y, 4, s.radius * 2, s.radius * 0.7, `rgba(235, 225, 255, ${Math.max(0.1, alphaPulse)})`)
            })
          }

          // Glowing sleeping lotus blossoms along bottom
          const lotusGlow = prefersReducedMotion ? 0 : Math.sin(time * 1.5) * 3
          for (let l = 0; l < 4; l++) {
            const lx = width * 0.2 + l * (width * 0.2)
            const ly = height - 25
            ctx.fillStyle = 'rgba(185, 160, 255, 0.25)'
            ctx.beginPath()
            ctx.ellipse(lx, ly, 10 + lotusGlow, 5, 0, 0, Math.PI * 2)
            ctx.fill()
          }
          break
        }

        // 9. Fox and the Silver Crown
        case 'fox-silver-crown': {
          // Swaying silver birch bough
          const boughSway = prefersReducedMotion ? 0 : Math.sin(time * 0.9) * 8
          ctx.strokeStyle = 'rgba(214, 201, 255, 0.16)'
          ctx.lineWidth = 1.8
          ctx.beginPath()
          ctx.moveTo(0, height * 0.18)
          ctx.bezierCurveTo(width * 0.15, height * 0.22, width * 0.25, height * 0.14 + boughSway, width * 0.38, height * 0.24 + boughSway)
          ctx.stroke()

          // Floating silver leaves
          if (state.silverLeaves) {
            state.silverLeaves.forEach(l => {
              if (!prefersReducedMotion) {
                l.y += l.speedY
                l.rot += l.rotSpeed
                l.x += Math.sin(l.rot) * 0.4
                if (l.y > height + 20) {
                  l.y = -20
                  l.x = Math.random() * width
                }
              }
              ctx.save()
              ctx.translate(l.x, l.y)
              ctx.rotate(l.rot)
              ctx.fillStyle = 'rgba(225, 215, 245, 0.32)'
              ctx.beginPath()
              ctx.ellipse(0, 0, l.size, l.size * 0.4, 0, 0, Math.PI * 2)
              ctx.fill()
              ctx.restore()
            })
          }

          // Silver crown sparkles
          if (state.sparkles) {
            state.sparkles.forEach(s => {
              const alphaPulse = prefersReducedMotion ? s.alpha : s.alpha + Math.sin(time * 3 + s.x) * 0.2
              drawStar(s.x, s.y, 4, s.size * 2, s.size * 0.6, `rgba(240, 230, 255, ${Math.max(0.1, alphaPulse)})`)
            })
          }
          break
        }

        // 10. Last Dragon of Lavender Valley
        case 'last-dragon-lavender-valley': {
          // Drifting lavender clouds
          if (state.clouds) {
            state.clouds.forEach(c => {
              if (!prefersReducedMotion) {
                c.x += c.speed
                if (c.x > width + 100) c.x = -c.w - 50
              }
              const g = ctx.createRadialGradient(c.x + c.w / 2, c.y + c.h / 2, 10, c.x + c.w / 2, c.y + c.h / 2, c.w / 2)
              g.addColorStop(0, 'rgba(167, 139, 250, 0.08)')
              g.addColorStop(1, 'rgba(16, 13, 28, 0)')
              ctx.fillStyle = g
              ctx.beginPath()
              ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2)
              ctx.fill()
            })
          }

          // Glowing dragon amethyst embers
          if (state.embers) {
            state.embers.forEach(e => {
              if (!prefersReducedMotion) {
                e.y += e.vy
                e.x += e.vx
                if (e.y < -10) e.y = height + 10
              }
              ctx.fillStyle = e.color
              ctx.globalAlpha = e.alpha * 0.4
              ctx.beginPath()
              ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
              ctx.fill()
              ctx.globalAlpha = 1.0
            })
          }
          break
        }

        // 11. Door Behind the Moon
        case 'door-behind-moon': {
          // Softly glowing magical door silhouette in upper right
          const doorX = width * 0.85
          const doorY = height * 0.25
          const doorW = 32
          const doorH = 52
          const pulse = prefersReducedMotion ? 0 : Math.sin(time * 2) * 4

          // Portal glow aura
          const portalGrad = ctx.createRadialGradient(doorX, doorY, 5, doorX, doorY, 65 + pulse)
          portalGrad.addColorStop(0, 'rgba(185, 160, 255, 0.35)')
          portalGrad.addColorStop(0.6, 'rgba(136, 118, 181, 0.12)')
          portalGrad.addColorStop(1, 'rgba(16, 13, 28, 0)')
          ctx.fillStyle = portalGrad
          ctx.beginPath()
          ctx.arc(doorX, doorY, 65 + pulse, 0, Math.PI * 2)
          ctx.fill()

          // Door frame
          ctx.save()
          ctx.strokeStyle = 'rgba(214, 201, 255, 0.55)'
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.moveTo(doorX - doorW / 2, doorY + doorH / 2)
          ctx.lineTo(doorX - doorW / 2, doorY - doorH / 4)
          ctx.arc(doorX, doorY - doorH / 4, doorW / 2, Math.PI, 0)
          ctx.lineTo(doorX + doorW / 2, doorY + doorH / 2)
          ctx.closePath()
          ctx.stroke()

          // Keyhole glow
          ctx.fillStyle = 'rgba(255, 235, 180, 0.7)'
          ctx.beginPath()
          ctx.arc(doorX, doorY, 2.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()

          // Cosmic stars
          if (state.stars) {
            state.stars.forEach(s => {
              if (!prefersReducedMotion) {
                s.orbitAngle += s.orbitSpeed
                s.x = doorX + Math.cos(s.orbitAngle) * s.orbitRadius
                s.y = doorY + Math.sin(s.orbitAngle) * (s.orbitRadius * 0.6)
              }
              drawStar(s.x, s.y, 4, s.radius * 1.8, s.radius * 0.6, `rgba(214, 201, 255, ${s.alpha * 0.5})`)
            })
          }
          break
        }

        // 12. Mermaid Who Collected Sunsets
        case 'mermaid-collected-sunsets': {
          // Shimmering sunset water caustics at bottom
          const waveShift = prefersReducedMotion ? 0 : Math.sin(time) * 15
          const sunsetGrad = ctx.createLinearGradient(waveShift, height - 100, waveShift, height)
          sunsetGrad.addColorStop(0, 'rgba(251, 146, 60, 0.08)')
          sunsetGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.08)')
          sunsetGrad.addColorStop(1, 'rgba(139, 92, 246, 0.06)')
          ctx.fillStyle = sunsetGrad
          ctx.fillRect(0, height - 100, width, 100)

          // Floating coral bubbles
          if (state.bubbles) {
            state.bubbles.forEach(b => {
              if (!prefersReducedMotion) {
                b.y -= b.speedY
                b.osc += 0.03
                b.x += Math.sin(b.osc) * 0.3
                if (b.y < -20) {
                  b.y = height + 20
                  b.x = Math.random() * width
                }
              }
              ctx.strokeStyle = `rgba(251, 146, 60, ${b.alpha * 0.8})`
              ctx.lineWidth = 1.2
              ctx.beginPath()
              ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
              ctx.stroke()
            })
          }
          break
        }

        // 13. Secret Garden of Althea
        case 'secret-garden-althea': {
          // Floating flower petals
          if (state.petals) {
            state.petals.forEach(p => {
              if (!prefersReducedMotion) {
                p.y += p.speedY
                p.rot += p.rotSpeed
                p.x += Math.sin(p.rot) * 0.45
                if (p.y > height + 20) {
                  p.y = -20
                  p.x = Math.random() * width
                }
              }
              ctx.save()
              ctx.translate(p.x, p.y)
              ctx.rotate(p.rot)
              ctx.fillStyle = p.color
              ctx.beginPath()
              ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2)
              ctx.fill()
              ctx.restore()
            })
          }

          // Gentle ivy vines on left edge
          const vineSway = prefersReducedMotion ? 0 : Math.sin(time) * 4
          ctx.strokeStyle = 'rgba(160, 180, 150, 0.16)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.bezierCurveTo(width * 0.05 + vineSway, height * 0.3, width * 0.02 - vineSway, height * 0.6, 0, height * 0.9)
          ctx.stroke()
          break
        }

        // 14. Ocean of Cloud Lilies
        case 'cloud-lilies': {
          // Floating cloud water-lilies
          if (state.lilies) {
            state.lilies.forEach(l => {
              if (!prefersReducedMotion) {
                l.x += l.driftX
                l.osc += 0.02
                if (l.x > width + 40) l.x = -40
              }
              const ly = l.y + Math.sin(l.osc) * 6
              ctx.save()
              ctx.fillStyle = 'rgba(235, 225, 255, 0.22)'
              ctx.beginPath()
              ctx.ellipse(l.x, ly, l.size, l.size * 0.45, 0, 0, Math.PI * 2)
              ctx.fill()
              // Petals
              ctx.strokeStyle = 'rgba(185, 160, 255, 0.4)'
              ctx.lineWidth = 1.2
              ctx.beginPath()
              ctx.arc(l.x, ly - 4, l.size * 0.4, 0, Math.PI * 2)
              ctx.stroke()
              ctx.restore()
            })
          }

          // Soft rolling cloud waves along bottom
          const wavePhase = prefersReducedMotion ? 0 : time * 0.8
          ctx.fillStyle = 'rgba(167, 139, 250, 0.05)'
          ctx.beginPath()
          ctx.moveTo(0, height)
          for (let x = 0; x <= width; x += 40) {
            const y = height - 35 + Math.sin(x * 0.015 + wavePhase) * 12
            ctx.lineTo(x, y)
          }
          ctx.lineTo(width, height)
          ctx.closePath()
          ctx.fill()
          break
        }

        // 15. Star That Chose a Home
        case 'star-chose-home': {
          // Companion Star Pip
          if (state.pip) {
            const pipX = state.pip.x
            const pipPulse = prefersReducedMotion ? 0 : Math.sin(time * 2.2) * 5
            const pipY = state.pip.y + (prefersReducedMotion ? 0 : Math.sin(time) * 6)

            const pipGlow = ctx.createRadialGradient(pipX, pipY, 2, pipX, pipY, state.pip.glow + pipPulse)
            pipGlow.addColorStop(0, 'rgba(255, 230, 160, 0.65)')
            pipGlow.addColorStop(0.4, 'rgba(214, 160, 255, 0.22)')
            pipGlow.addColorStop(1, 'rgba(16, 13, 28, 0)')
            ctx.fillStyle = pipGlow
            ctx.beginPath()
            ctx.arc(pipX, pipY, state.pip.glow + pipPulse, 0, Math.PI * 2)
            ctx.fill()

            // Pip's warm golden star shape
            drawStar(pipX, pipY, 5, state.pip.size * 1.8, state.pip.size * 0.75, 'rgba(255, 240, 190, 0.95)')
          }

          // Gentle falling stardust shower
          if (state.stardust) {
            state.stardust.forEach(sd => {
              if (!prefersReducedMotion) {
                sd.y += sd.speedY
                sd.x += sd.speedX
                if (sd.y > height + 10) {
                  sd.y = -10
                  sd.x = Math.random() * width + 50
                }
              }
              ctx.fillStyle = `rgba(255, 235, 180, ${sd.alpha * 0.5})`
              ctx.beginPath()
              ctx.arc(sd.x, sd.y, sd.size, 0, Math.PI * 2)
              ctx.fill()
            })
          }
          break
        }

        default:
          break
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [storyId])

  return (
    <canvas
      ref={canvasRef}
      className="story-atmosphere-canvas"
      aria-hidden="true"
    />
  )
}
