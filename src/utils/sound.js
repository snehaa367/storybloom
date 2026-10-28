// Native Web Audio API Sound & Ambient Music Engine for Storybloom
// Zero external libraries, lightweight, instant, 100% reliable, zero 404s, and soothing.

export const STORY_MUSIC_CONFIG = {
  'moon-painter': {
    title: 'Moonlight Sonata & Star Chimes',
    description: 'Soft magical piano with delicate chimes',
    mood: 'Celestial & Dreamy',
    preset: 'moon-painter'
  },
  'whispering-willow': {
    title: 'Whispers of Elderglen',
    description: 'Peaceful forest ambience and gentle instrumental music',
    mood: 'Soothing & Contemplative',
    preset: 'whispering-willow'
  },
  'kingdom-beneath-lake': {
    title: 'Coral Depths of Nami',
    description: 'Dreamy underwater ambience',
    mood: 'Subaquatic & Mystic',
    preset: 'kingdom-beneath-lake'
  },
  'lantern-keeper': {
    title: 'Hearthfire by the Shore',
    description: 'Calming magical instrumental music',
    mood: 'Warm & Reassuring',
    preset: 'lantern-keeper'
  },
  'library-lost-dreams': {
    title: 'The Midnight Folios',
    description: 'Soft piano and ambient music',
    mood: 'Nostalgic & Tender',
    preset: 'library-lost-dreams'
  },
  'girl-followed-fireflies': {
    title: 'Firefly Meadow Nocturne',
    description: 'Gentle nighttime ambience',
    mood: 'Luminescent & Serene',
    preset: 'girl-followed-fireflies'
  },
  'clockmaker-forgotten-hours': {
    title: 'The Pendulum of Starlight',
    description: 'Delicate music with subtle ticking',
    mood: 'Intricate & Comforting',
    preset: 'clockmaker-forgotten-hours'
  },
  'garden-sleeping-stars': {
    title: 'Zenith Blossom Lullaby',
    description: 'Dreamy lullaby',
    mood: 'Tranquil & Peaceful',
    preset: 'garden-sleeping-stars'
  },
  'fox-silver-crown': {
    title: 'Sovereign of Birchwood',
    description: 'Peaceful enchanted forest music',
    mood: 'Enchanted & Noble',
    preset: 'fox-silver-crown'
  },
  'last-dragon-lavender-valley': {
    title: 'Amethyst Valley Hymn',
    description: 'Gentle fantasy orchestral ambience',
    mood: 'Majestic & Calming',
    preset: 'last-dragon-lavender-valley'
  },
  'door-behind-moon': {
    title: 'Echoes of the Moon Door',
    description: 'Mysterious magical ambience',
    mood: 'Ethereal & Enigmatic',
    preset: 'door-behind-moon'
  },
  'mermaid-collected-sunsets': {
    title: 'Coral Horizon Tides',
    description: 'Peaceful ocean ambience',
    mood: 'Gentle & Shimmering',
    preset: 'mermaid-collected-sunsets'
  },
  'secret-garden-althea': {
    title: 'The Glasshouse Awakening',
    description: 'Soft nature-inspired instrumental music',
    mood: 'Botanical & Sweet',
    preset: 'secret-garden-althea'
  },
  'cloud-lilies': {
    title: 'The Drift of Sky Lilies',
    description: 'Dreamy floating atmosphere',
    mood: 'Airy & Weightless',
    preset: 'cloud-lilies'
  },
  'star-chose-home': {
    title: 'Pip’s Attic Hearth',
    description: 'Warm emotional piano',
    mood: 'Heartfelt & Tender',
    preset: 'star-chose-home'
  }
}

class AmbientSoundEngine {
  constructor() {
    this.audioCtx = null
    this.masterGain = null
    this.musicGain = null
    this.sfxGain = null
    
    // Ambient chimes state (legacy homepage support)
    this.isChimeAtmospherePlaying = false
    this.chimeTimer = null

    // Story-reading music state
    this.currentStoryId = null
    this.isStoryMusicPlaying = false
    this.activeNodes = [] // Nodes to clean up
    this.musicTimer = null
    this.noiseNode = null
    
    this.volume = 0.40 // Default comfortable reading volume
    this.isMuted = false
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.audioCtx = new AudioContext()
        
        // Master Gain
        this.masterGain = this.audioCtx.createGain()
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime)
        this.masterGain.connect(this.audioCtx.destination)

        // Music bus
        this.musicGain = this.audioCtx.createGain()
        this.musicGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime)
        this.musicGain.connect(this.masterGain)

        // SFX bus
        this.sfxGain = this.audioCtx.createGain()
        this.sfxGain.gain.setValueAtTime(0.8, this.audioCtx.currentTime)
        this.sfxGain.connect(this.masterGain)
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {})
    }
  }

  // Set reader/master volume (0.0 to 1.0) with smooth ramp
  setVolume(newVal) {
    this.volume = Math.max(0, Math.min(1, newVal))
    if (this.masterGain && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.masterGain.gain.linearRampToValueAtTime(target, this.audioCtx.currentTime + 0.08)
    }
  }

  getVolume() {
    return this.volume
  }

  setMuted(muted) {
    this.isMuted = !!muted
    if (this.masterGain && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.masterGain.gain.linearRampToValueAtTime(target, this.audioCtx.currentTime + 0.1)
    }
  }

  getIsMuted() {
    return this.isMuted
  }

  // Soft wind chime / harp bell chord
  playChime(freq = 528) {
    try {
      this.init()
      if (!this.audioCtx) return

      const osc = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime)

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.06, this.audioCtx.currentTime + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 2.5)

      osc.connect(gain)
      gain.connect(this.sfxGain || this.audioCtx.destination)

      osc.start()
      osc.stop(this.audioCtx.currentTime + 2.6)
    } catch {
      // Audio not permitted
    }
  }

  // Soft page rustle sound
  playPageTurn() {
    try {
      this.init()
      if (!this.audioCtx) return

      const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.14)
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.32))
      }

      const noise = this.audioCtx.createBufferSource()
      noise.buffer = buffer

      const filter = this.audioCtx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(750, this.audioCtx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.14)

      const gain = this.audioCtx.createGain()
      gain.gain.setValueAtTime(0.045, this.audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.sfxGain || this.audioCtx.destination)

      noise.start()
    } catch {
      // Audio fallback
    }
  }

  // Ambient gentle wind & periodic chimes loop (Homepage)
  startAtmosphere() {
    this.init()
    if (!this.audioCtx) return

    this.isChimeAtmospherePlaying = true
    const scale = [349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 880.0]

    const playRandomChime = () => {
      if (!this.isChimeAtmospherePlaying) return
      const randomFreq = scale[Math.floor(Math.random() * scale.length)]
      this.playChime(randomFreq)
      const nextDelay = 2500 + Math.random() * 3000
      this.chimeTimer = setTimeout(playRandomChime, nextDelay)
    }

    playRandomChime()
  }

  stopAtmosphere() {
    this.isChimeAtmospherePlaying = false
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer)
      this.chimeTimer = null
    }
  }

  toggleAtmosphere() {
    if (this.isChimeAtmospherePlaying) {
      this.stopAtmosphere()
      return false
    } else {
      this.startAtmosphere()
      return true
    }
  }

  // ========================================================================
  // STORY READER BESPOKE PROCEDURAL SOUNDSCAPES
  // ========================================================================

  getStoryConfig(storyId) {
    return STORY_MUSIC_CONFIG[storyId] || {
      title: 'Storybloom Starlight Ambience',
      description: 'Peaceful soothing reading atmosphere',
      mood: 'Calm & Dreamy',
      preset: 'moon-painter'
    }
  }

  // Synthesize a soft acoustic / electric piano note
  playPianoNote(freq, time, duration = 3.2, velocity = 0.08, tone = 'warm') {
    if (!this.audioCtx || !this.musicGain) return
    try {
      const osc1 = this.audioCtx.createOscillator()
      const osc2 = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()
      const filter = this.audioCtx.createBiquadFilter()

      // Fundamental + harmonic overtone
      osc1.type = tone === 'bell' ? 'sine' : 'triangle'
      osc1.frequency.setValueAtTime(freq, time)

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(freq * 2, time)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(tone === 'bell' ? 2400 : 1200, time)
      filter.frequency.exponentialRampToValueAtTime(320, time + duration)

      // Piano envelope
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(velocity, time + 0.04)
      gain.gain.exponentialRampToValueAtTime(velocity * 0.45, time + 0.4)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(this.musicGain)

      osc1.start(time)
      osc2.start(time)
      osc1.stop(time + duration + 0.1)
      osc2.stop(time + duration + 0.1)
    } catch {
      // Audio safety
    }
  }

  // Synthesize a delicate high glockenspiel / chime sparkle
  playSparkleChime(freq, time, duration = 2.4, velocity = 0.05) {
    if (!this.audioCtx || !this.musicGain) return
    try {
      const osc = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(velocity, time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

      osc.connect(gain)
      gain.connect(this.musicGain)

      osc.start(time)
      osc.stop(time + duration + 0.05)
    } catch {}
  }

  // Synthesize an ambient sustained pad chord
  createWarmPad(frequencies, baseGain = 0.04) {
    if (!this.audioCtx || !this.musicGain) return []
    const nodes = []
    frequencies.forEach((freq, idx) => {
      try {
        const osc = this.audioCtx.createOscillator()
        const gain = this.audioCtx.createGain()
        const filter = this.audioCtx.createBiquadFilter()

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime)

        // Subtle detune for lushness
        osc.detune.setValueAtTime((idx - 1) * 3, this.audioCtx.currentTime)

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(650, this.audioCtx.currentTime)

        // Slow soft breathing fade in
        gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime)
        gain.gain.linearRampToValueAtTime(baseGain / frequencies.length, this.audioCtx.currentTime + 1.5)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.musicGain)

        osc.start()
        nodes.push({ osc, gain, filter })
      } catch {}
    })
    return nodes
  }

  // Create pink/white filtered noise for wind, waves, forest or water
  createAmbientNoiseLayer(type = 'wind', volume = 0.02) {
    if (!this.audioCtx || !this.musicGain) return null
    try {
      const bufferSize = this.audioCtx.sampleRate * 2
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate)
      const data = buffer.getChannelData(0)
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = data[i]
      }

      const noise = this.audioCtx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true

      const filter = this.audioCtx.createBiquadFilter()
      const gain = this.audioCtx.createGain()

      if (type === 'wind') {
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(420, this.audioCtx.currentTime)
        filter.Q.setValueAtTime(1.5, this.audioCtx.currentTime)
      } else if (type === 'ocean') {
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(320, this.audioCtx.currentTime)
      } else if (type === 'underwater') {
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(200, this.audioCtx.currentTime)
      } else {
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(500, this.audioCtx.currentTime)
      }

      gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime)
      gain.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 1.2)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.musicGain)

      noise.start()
      return { noise, gain, filter }
    } catch {
      return null
    }
  }

  // ========================================================================
  // STORY MUSIC PLAYBACK DISPATCHER (15 BESPOKE ATMOSPHERES)
  // ========================================================================

  playStoryMusic(storyId) {
    this.init()
    if (!this.audioCtx) return

    // If already playing this exact story, keep running
    if (this.isStoryMusicPlaying && this.currentStoryId === storyId) {
      return
    }

    // Smooth crossfade: smoothly fade out previous story music without abrupt stop or clash
    if (this.isStoryMusicPlaying) {
      this.crossfadeToNewStory(storyId)
      return
    }

    this.currentStoryId = storyId
    this.isStoryMusicPlaying = true
    this.startStorySoundscape(storyId)
  }

  crossfadeToNewStory(newStoryId) {
    if (!this.audioCtx || !this.musicGain) {
      this.stopStoryMusic()
      this.playStoryMusic(newStoryId)
      return
    }

    // Ramp down musicGain smoothly over 0.5s
    const now = this.audioCtx.currentTime
    this.musicGain.gain.cancelScheduledValues(now)
    this.musicGain.gain.linearRampToValueAtTime(0.001, now + 0.45)

    setTimeout(() => {
      this.cleanupStoryNodes()
      this.currentStoryId = newStoryId
      this.isStoryMusicPlaying = true
      
      // Ramp back up
      if (this.musicGain && this.audioCtx) {
        this.musicGain.gain.cancelScheduledValues(this.audioCtx.currentTime)
        this.musicGain.gain.linearRampToValueAtTime(1.0, this.audioCtx.currentTime + 0.6)
      }
      this.startStorySoundscape(newStoryId)
    }, 500)
  }

  cleanupStoryNodes() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer)
      this.musicTimer = null
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3)
        this.noiseNode.noise.stop(this.audioCtx.currentTime + 0.35)
      } catch {}
      this.noiseNode = null
    }
    this.activeNodes.forEach(item => {
      try {
        if (item.gain) {
          item.gain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3)
        }
        if (item.osc) {
          item.osc.stop(this.audioCtx.currentTime + 0.35)
        }
      } catch {}
    })
    this.activeNodes = []
  }

  stopStoryMusic() {
    this.isStoryMusicPlaying = false
    this.currentStoryId = null
    this.cleanupStoryNodes()
  }

  pauseStoryMusic() {
    this.isStoryMusicPlaying = false
    this.cleanupStoryNodes()
  }

  resumeStoryMusic(storyId) {
    const idToPlay = storyId || this.currentStoryId || 'moon-painter'
    this.playStoryMusic(idToPlay)
  }

  // Presets implementation
  startStorySoundscape(storyId) {
    if (!this.isStoryMusicPlaying) return

    switch (storyId) {
      // 1. Moon Painter: Soft magical piano with delicate chimes
      case 'moon-painter': {
        this.activeNodes = this.createWarmPad([155.56, 233.08, 311.13, 466.16], 0.035) // Eb major 7
        const pianoChords = [
          [311.13, 392.00, 466.16], // Eb, G, Bb
          [261.63, 311.13, 392.00], // Cm
          [233.08, 349.23, 466.16], // Bb
          [207.65, 261.63, 311.13]  // Ab
        ]
        const chimes = [784.0, 932.3, 1046.5, 1244.5, 1396.9]
        let step = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'moon-painter') return
          const chord = pianoChords[step % pianoChords.length]
          const t = this.audioCtx.currentTime
          chord.forEach((freq, idx) => {
            this.playPianoNote(freq, t + idx * 0.12, 3.4, 0.07, 'warm')
          })
          // Chime sprinkle
          if (step % 2 === 0) {
            const chimeFreq = chimes[Math.floor(Math.random() * chimes.length)]
            this.playSparkleChime(chimeFreq, t + 0.8, 2.8, 0.04)
          }
          step++
          this.musicTimer = setTimeout(cycle, 4000)
        }
        cycle()
        break
      }

      // 2. Whispering Willow: Peaceful forest ambience and gentle instrumental music
      case 'whispering-willow': {
        this.noiseNode = this.createAmbientNoiseLayer('wind', 0.018)
        this.activeNodes = this.createWarmPad([146.83, 220.0, 293.66], 0.03) // D minor / G
        const fluteMelody = [440.0, 523.25, 587.33, 659.25, 784.0, 880.0]
        let fIdx = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'whispering-willow') return
          const t = this.audioCtx.currentTime
          const freq = fluteMelody[fIdx % fluteMelody.length]
          this.playPianoNote(freq, t, 3.0, 0.055, 'warm')
          if (Math.random() > 0.4) {
            this.playPianoNote(freq * 0.5, t + 0.4, 3.2, 0.04, 'warm')
          }
          fIdx++
          this.musicTimer = setTimeout(cycle, 3600)
        }
        cycle()
        break
      }

      // 3. Kingdom Beneath the Lake: Dreamy underwater ambience
      case 'kingdom-beneath-lake': {
        this.noiseNode = this.createAmbientNoiseLayer('underwater', 0.025)
        this.activeNodes = this.createWarmPad([110.0, 164.81, 220.0, 277.18], 0.035) // Deep A / C# / E
        const bubblePops = [392.0, 440.0, 523.25, 659.25, 784.0]

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'kingdom-beneath-lake') return
          const t = this.audioCtx.currentTime
          // Gentle bubble rise
          const bFreq = bubblePops[Math.floor(Math.random() * bubblePops.length)]
          this.playSparkleChime(bFreq, t, 1.8, 0.045)
          if (Math.random() > 0.5) {
            this.playPianoNote(bFreq * 0.5, t + 0.3, 3.5, 0.05, 'bell')
          }
          this.musicTimer = setTimeout(cycle, 3200 + Math.random() * 1500)
        }
        cycle()
        break
      }

      // 4. Lantern Keeper: Calming magical instrumental music
      case 'lantern-keeper': {
        this.activeNodes = this.createWarmPad([146.83, 220.0, 293.66, 369.99], 0.035) // D major 7
        const harpNotes = [293.66, 369.99, 440.0, 587.33, 739.99]
        let hStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'lantern-keeper') return
          const t = this.audioCtx.currentTime
          const n1 = harpNotes[hStep % harpNotes.length]
          const n2 = harpNotes[(hStep + 2) % harpNotes.length]
          this.playPianoNote(n1, t, 2.8, 0.06, 'warm')
          this.playPianoNote(n2, t + 0.22, 2.6, 0.05, 'warm')
          hStep++
          this.musicTimer = setTimeout(cycle, 3500)
        }
        cycle()
        break
      }

      // 5. Library of Lost Dreams: Soft piano and ambient music
      case 'library-lost-dreams': {
        this.activeNodes = this.createWarmPad([110.0, 164.81, 220.0, 261.63], 0.03) // A minor velvet
        const pianoProgression = [
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
          [261.63, 329.63, 392.00], // C
          [196.00, 246.94, 293.66]  // G
        ]
        let pStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'library-lost-dreams') return
          const t = this.audioCtx.currentTime
          const chord = pianoProgression[pStep % pianoProgression.length]
          chord.forEach((f, i) => {
            this.playPianoNote(f, t + i * 0.15, 3.8, 0.07, 'warm')
          })
          pStep++
          this.musicTimer = setTimeout(cycle, 4400)
        }
        cycle()
        break
      }

      // 6. Girl Who Followed Fireflies: Gentle nighttime ambience
      case 'girl-followed-fireflies': {
        this.noiseNode = this.createAmbientNoiseLayer('wind', 0.014)
        this.activeNodes = this.createWarmPad([130.81, 196.0, 261.63], 0.028)
        const fireflyGlows = [523.25, 659.25, 784.0, 1046.5, 1174.66]

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'girl-followed-fireflies') return
          const t = this.audioCtx.currentTime
          const f = fireflyGlows[Math.floor(Math.random() * fireflyGlows.length)]
          this.playSparkleChime(f, t, 2.2, 0.05)
          if (Math.random() > 0.4) {
            this.playPianoNote(f * 0.5, t + 0.3, 2.8, 0.045, 'bell')
          }
          this.musicTimer = setTimeout(cycle, 2800 + Math.random() * 1800)
        }
        cycle()
        break
      }

      // 7. Clockmaker of Forgotten Hours: Delicate music with subtle ticking
      case 'clockmaker-forgotten-hours': {
        this.activeNodes = this.createWarmPad([146.83, 220.0, 329.63], 0.025)
        const chimePitches = [587.33, 659.25, 880.0, 987.77]
        let cIdx = 0

        const playTick = () => {
          if (!this.audioCtx || !this.musicGain) return
          try {
            const osc = this.audioCtx.createOscillator()
            const g = this.audioCtx.createGain()
            const f = this.audioCtx.createBiquadFilter()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(cIdx % 2 === 0 ? 900 : 750, this.audioCtx.currentTime)
            f.type = 'bandpass'
            f.frequency.setValueAtTime(800, this.audioCtx.currentTime)
            g.gain.setValueAtTime(0.015, this.audioCtx.currentTime)
            g.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04)
            osc.connect(f)
            f.connect(g)
            g.connect(this.musicGain)
            osc.start()
            osc.stop(this.audioCtx.currentTime + 0.05)
          } catch {}
        }

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'clockmaker-forgotten-hours') return
          playTick()
          if (cIdx % 4 === 0) {
            const p = chimePitches[(cIdx / 4) % chimePitches.length]
            this.playSparkleChime(p, this.audioCtx.currentTime + 0.1, 2.5, 0.04)
          }
          cIdx++
          this.musicTimer = setTimeout(cycle, 1000)
        }
        cycle()
        break
      }

      // 8. Garden of Sleeping Stars: Dreamy lullaby
      case 'garden-sleeping-stars': {
        this.activeNodes = this.createWarmPad([130.81, 164.81, 196.0, 246.94], 0.035) // Cmaj7
        const lullabyNotes = [392.0, 440.0, 523.25, 659.25, 784.0, 880.0]
        let lIdx = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'garden-sleeping-stars') return
          const t = this.audioCtx.currentTime
          const freq = lullabyNotes[lIdx % lullabyNotes.length]
          this.playPianoNote(freq, t, 3.4, 0.065, 'bell')
          this.playPianoNote(freq * 0.5, t + 0.18, 3.6, 0.04, 'warm')
          lIdx++
          this.musicTimer = setTimeout(cycle, 3800)
        }
        cycle()
        break
      }

      // 9. Fox and the Silver Crown: Peaceful enchanted forest music
      case 'fox-silver-crown': {
        this.noiseNode = this.createAmbientNoiseLayer('wind', 0.016)
        this.activeNodes = this.createWarmPad([174.61, 220.0, 261.63, 349.23], 0.03) // F major
        const hornNotes = [261.63, 329.63, 392.0, 523.25]
        let hStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'fox-silver-crown') return
          const t = this.audioCtx.currentTime
          const hn = hornNotes[hStep % hornNotes.length]
          this.playPianoNote(hn, t, 3.2, 0.06, 'warm')
          this.playSparkleChime(hn * 2, t + 0.6, 2.2, 0.035)
          hStep++
          this.musicTimer = setTimeout(cycle, 4200)
        }
        cycle()
        break
      }

      // 10. Last Dragon of Lavender Valley: Gentle fantasy orchestral ambience
      case 'last-dragon-lavender-valley': {
        this.activeNodes = this.createWarmPad([116.54, 174.61, 233.08, 277.18], 0.04) // Bb minor majestic
        const orchestralChords = [
          [233.08, 277.18, 349.23], // Bbm
          [174.61, 220.0, 261.63],  // F
          [138.59, 174.61, 207.65], // Db
          [207.65, 261.63, 311.13]  // Ab
        ]
        let dStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'last-dragon-lavender-valley') return
          const t = this.audioCtx.currentTime
          const chord = orchestralChords[dStep % orchestralChords.length]
          chord.forEach((f, i) => {
            this.playPianoNote(f, t + i * 0.2, 4.0, 0.065, 'warm')
          })
          dStep++
          this.musicTimer = setTimeout(cycle, 4600)
        }
        cycle()
        break
      }

      // 11. Door Behind the Moon: Mysterious magical ambience
      case 'door-behind-moon': {
        this.activeNodes = this.createWarmPad([146.83, 220.0, 261.63, 329.63], 0.035) // Dm9 mystique
        const mysticEchoes = [440.0, 523.25, 622.25, 784.0, 932.33]

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'door-behind-moon') return
          const t = this.audioCtx.currentTime
          const note = mysticEchoes[Math.floor(Math.random() * mysticEchoes.length)]
          this.playPianoNote(note, t, 3.6, 0.055, 'bell')
          this.playSparkleChime(note * 1.5, t + 0.4, 3.0, 0.04)
          this.musicTimer = setTimeout(cycle, 4200)
        }
        cycle()
        break
      }

      // 12. Mermaid Who Collected Sunsets: Peaceful ocean ambience
      case 'mermaid-collected-sunsets': {
        this.noiseNode = this.createAmbientNoiseLayer('ocean', 0.026)
        this.activeNodes = this.createWarmPad([130.81, 196.0, 246.94, 329.63], 0.035) // Cmaj9
        const sunsetHarp = [392.0, 493.88, 587.33, 659.25, 784.0]
        let sIdx = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'mermaid-collected-sunsets') return
          const t = this.audioCtx.currentTime
          const n = sunsetHarp[sIdx % sunsetHarp.length]
          this.playPianoNote(n, t, 3.2, 0.06, 'warm')
          this.playSparkleChime(n * 1.33, t + 0.35, 2.5, 0.04)
          sIdx++
          this.musicTimer = setTimeout(cycle, 3600)
        }
        cycle()
        break
      }

      // 13. Secret Garden of Althea: Soft nature-inspired instrumental music
      case 'secret-garden-althea': {
        this.activeNodes = this.createWarmPad([164.81, 220.0, 261.63, 329.63], 0.03) // Am7
        const kalimbaNotes = [329.63, 392.0, 440.0, 523.25, 659.25]
        let kStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'secret-garden-althea') return
          const t = this.audioCtx.currentTime
          const k = kalimbaNotes[kStep % kalimbaNotes.length]
          this.playPianoNote(k, t, 2.5, 0.06, 'warm')
          if (Math.random() > 0.4) {
            // Gentle birdsong-like chirp
            this.playSparkleChime(k * 2.2, t + 0.4, 1.6, 0.035)
          }
          kStep++
          this.musicTimer = setTimeout(cycle, 3400)
        }
        cycle()
        break
      }

      // 14. Ocean of Cloud Lilies: Dreamy floating atmosphere
      case 'cloud-lilies': {
        this.activeNodes = this.createWarmPad([174.61, 261.63, 329.63, 392.0], 0.035) // Fmaj7 airy
        const cloudChimes = [523.25, 659.25, 784.0, 1046.5]
        let cStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'cloud-lilies') return
          const t = this.audioCtx.currentTime
          const chime = cloudChimes[cStep % cloudChimes.length]
          this.playPianoNote(chime * 0.5, t, 3.5, 0.055, 'warm')
          this.playSparkleChime(chime, t + 0.25, 2.8, 0.045)
          cStep++
          this.musicTimer = setTimeout(cycle, 4000)
        }
        cycle()
        break
      }

      // 15. Star That Chose a Home: Warm emotional piano
      case 'star-chose-home': {
        this.activeNodes = this.createWarmPad([130.81, 196.0, 261.63, 329.63], 0.035) // Warm C major
        const emotionalPiano = [
          [261.63, 329.63, 392.0], // C
          [164.81, 246.94, 329.63], // Em
          [174.61, 220.0, 261.63], // F
          [196.00, 246.94, 293.66]  // G
        ]
        let eStep = 0

        const cycle = () => {
          if (!this.isStoryMusicPlaying || this.currentStoryId !== 'star-chose-home') return
          const t = this.audioCtx.currentTime
          const chord = emotionalPiano[eStep % emotionalPiano.length]
          chord.forEach((f, i) => {
            this.playPianoNote(f, t + i * 0.16, 4.2, 0.075, 'warm')
          })
          if (eStep % 2 === 0) {
            this.playSparkleChime(784.0, t + 0.9, 2.5, 0.04)
          }
          eStep++
          this.musicTimer = setTimeout(cycle, 4400)
        }
        cycle()
        break
      }

      default: {
        // Fallback default
        this.activeNodes = this.createWarmPad([220.0, 329.63, 440.0], 0.03)
        break
      }
    }
  }
}

export const soundEngine = new AmbientSoundEngine()
