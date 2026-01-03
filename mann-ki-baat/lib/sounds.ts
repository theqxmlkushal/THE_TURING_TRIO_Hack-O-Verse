export type SoundType = 
  | 'click' 
  | 'hover' 
  | 'success' 
  | 'error' 
  | 'notification'
  | 'page_transition'
  | 'game_start'
  | 'achievement'
  | 'craft'      // New: Crafting sound
  | 'build'      // New: Building block sound
  | 'break'      // New: Breaking block sound
  | 'step'       // New: Walking/footstep sound
  | 'door_open'  // New: Door opening
  | 'door_close' // New: Door closing
  | 'select'     // New: Item selection
  | 'backpack'   // New: Inventory open/close
  | 'level_up'   // New: Level up/experience

export interface SoundConfig {
  volume: number
  playbackRate?: number
  loop?: boolean
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundType, AudioBuffer> = new Map()
  private enabled: boolean = true
  private masterVolume: number = 0.5

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.initializeSounds()
    }
  }

  private async initializeSounds() {
    // Create simple procedural sounds
    this.sounds.set('click', this.createClickSound())
    this.sounds.set('hover', this.createHoverSound())
    this.sounds.set('success', this.createSuccessSound())
    this.sounds.set('error', this.createErrorSound())
    this.sounds.set('notification', this.createNotificationSound())
    this.sounds.set('page_transition', this.createPageTransitionSound())
    this.sounds.set('game_start', this.createGameStartSound())
    this.sounds.set('achievement', this.createAchievementSound())
    
    // New Minecraft-style sounds
    this.sounds.set('craft', this.createCraftSound())
    this.sounds.set('build', this.createBuildSound())
    this.sounds.set('break', this.createBreakSound())
    this.sounds.set('step', this.createStepSound())
    this.sounds.set('door_open', this.createDoorOpenSound())
    this.sounds.set('door_close', this.createDoorCloseSound())
    this.sounds.set('select', this.createSelectSound())
    this.sounds.set('backpack', this.createBackpackSound())
    this.sounds.set('level_up', this.createLevelUpSound())
  }

  private createClickSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.05
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a short, sharp click sound
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      const frequency = 1200
      const attack = Math.min(1, x * 500)
      const decay = Math.exp(-x * 100)
      channelData[i] = Math.sin(2 * Math.PI * frequency * x) * attack * decay * 0.3
    }
    
    return buffer
  }

  private createHoverSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.15
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a soft, smooth hover sound
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      const frequency = 800 * (1 - x / duration * 0.3)
      const envelope = Math.sin(Math.PI * x / duration)
      channelData[i] = Math.sin(2 * Math.PI * frequency * x) * envelope * 0.15
    }
    
    return buffer
  }

  private createSuccessSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.8
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create a cheerful success sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        const frequency = 523.25 + (x * 200) // Rising tone (C5 to D5)
        const envelope = Math.sin(Math.PI * x / duration)
        
        // Add harmonics
        let sample = 0
        sample += Math.sin(2 * Math.PI * frequency * x) * 0.6
        sample += Math.sin(2 * Math.PI * frequency * 2 * x) * 0.3
        sample += Math.sin(2 * Math.PI * frequency * 3 * x) * 0.1
        
        // Stereo panning
        const pan = channel === 0 ? 1 - x/duration : x/duration
        channelData[i] = sample * envelope * 0.4 * pan
      }
    }
    
    return buffer
  }

  private createErrorSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.4
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a descending error sound
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      const frequency = 600 * (1 - x / duration * 0.7)
      const attack = Math.min(1, x * 100)
      const decay = Math.exp(-x * 8)
      const vibrato = Math.sin(x * 30) * 10
      channelData[i] = Math.sin(2 * Math.PI * (frequency + vibrato) * x) * attack * decay * 0.4
    }
    
    return buffer
  }

  private createNotificationSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.6
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create a gentle notification sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Three gentle beeps
        let sample = 0
        const beeps = [0, 0.2, 0.4]
        beeps.forEach((delay, index) => {
          const time = x - delay
          if (time >= 0 && time < 0.1) {
            const frequency = 784 + index * 100 // G5, A5, B5
            const envelope = Math.sin(Math.PI * time / 0.1) * Math.exp(-time * 20)
            sample += Math.sin(2 * Math.PI * frequency * time) * envelope * 0.2
          }
        })
        
        // Slight stereo offset
        const pan = channel === 0 ? 0.7 : 0.3
        channelData[i] = sample * pan
      }
    }
    
    return buffer
  }

  private createPageTransitionSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.7
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create a sweeping transition sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        const frequency = 200 + x * 300
        const envelope = Math.sin(Math.PI * x / duration)
        
        // Stereo panning effect
        const sweep = channel === 0 ? 
          Math.sin(x * Math.PI * 2) * 0.5 + 0.5 : 
          Math.cos(x * Math.PI * 2) * 0.5 + 0.5
        
        channelData[i] = Math.sin(2 * Math.PI * frequency * x) * envelope * sweep * 0.3
      }
    }
    
    return buffer
  }

  private createGameStartSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 1.2
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create an epic, Minecraft-style game start sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Main rising tone
        const mainFreq = 100 + x * 200
        const mainEnvelope = Math.sin(Math.PI * x / (duration * 0.8)) * Math.exp(-x * 1.5)
        let sample = Math.sin(2 * Math.PI * mainFreq * x) * mainEnvelope * 0.5
        
        // High sparkle effect
        if (x > 0.5) {
          const sparkleFreq = 1200 + Math.sin(x * 50) * 200
          const sparkleEnvelope = Math.sin(Math.PI * (x - 0.5) / (duration * 0.5))
          sample += Math.sin(2 * Math.PI * sparkleFreq * x) * sparkleEnvelope * 0.2
        }
        
        // Low rumble
        const rumbleFreq = 60 + Math.sin(x * 10) * 10
        const rumbleEnvelope = Math.exp(-x * 3)
        sample += Math.sin(2 * Math.PI * rumbleFreq * x) * rumbleEnvelope * 0.1
        
        // Stereo width
        const pan = channel === 0 ? 
          Math.sin(x * Math.PI * 3) * 0.3 + 0.7 : 
          Math.cos(x * Math.PI * 3) * 0.3 + 0.7
        
        channelData[i] = sample * pan
      }
    }
    
    return buffer
  }

  private createAchievementSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 1.0
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create a celebratory achievement sound (Minecraft XP sound inspired)
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // XP orb collection sound
        let sample = 0
        
        // First "pop"
        if (x < 0.1) {
          const popFreq = 1200 * (1 - x/0.1 * 0.8)
          sample += Math.sin(2 * Math.PI * popFreq * x) * Math.exp(-x * 50) * 0.4
        }
        
        // Rising sparkle (0.1s - 0.5s)
        if (x >= 0.1 && x < 0.5) {
          const sparkleX = x - 0.1
          const sparkleFreq = 800 + sparkleX * 600
          const sparkleEnvelope = Math.sin(Math.PI * sparkleX / 0.4) * Math.exp(-sparkleX * 4)
          sample += Math.sin(2 * Math.PI * sparkleFreq * x) * sparkleEnvelope * 0.3
        }
        
        // Final chime (0.5s - end)
        if (x >= 0.5) {
          const chimeX = x - 0.5
          const chimeFreq = 1046.5 // C6
          const chimeEnvelope = Math.exp(-chimeX * 3)
          sample += Math.sin(2 * Math.PI * chimeFreq * x) * chimeEnvelope * 0.2
        }
        
        // Stereo shimmer
        const pan = channel === 0 ? 
          Math.sin(x * Math.PI * 8) * 0.4 + 0.6 : 
          Math.cos(x * Math.PI * 8) * 0.4 + 0.6
        
        channelData[i] = sample * pan
      }
    }
    
    return buffer
  }

  private createCraftSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.4
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Minecraft crafting table sound inspired
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Multiple hammer strikes
        let sample = 0
        const strikes = [0, 0.05, 0.1, 0.15]
        
        strikes.forEach((delay, index) => {
          const time = x - delay
          if (time >= 0 && time < 0.08) {
            const freq = 600 - index * 50
            const envelope = Math.sin(Math.PI * time / 0.08) * Math.exp(-time * 40)
            const strike = Math.sin(2 * Math.PI * freq * time) * envelope
            
            // Add wood impact sound (noise)
            if (time < 0.02) {
              const noise = Math.random() * 2 - 1
              const noiseEnv = Math.exp(-time * 100)
              sample += strike * 0.6 + noise * noiseEnv * 0.4
            } else {
              sample += strike * 0.6
            }
          }
        })
        
        // Stereo effect - slightly offset channels
        const pan = channel === 0 ? 0.6 : 0.4
        channelData[i] = sample * pan * 0.3
      }
    }
    
    return buffer
  }

  private createBuildSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.2
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Block placement sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Two part sound: impact + settle
        let sample = 0
        
        // Initial impact
        if (x < 0.05) {
          const impactFreq = 400
          const impactEnv = Math.sin(Math.PI * x / 0.05) * Math.exp(-x * 60)
          sample += Math.sin(2 * Math.PI * impactFreq * x) * impactEnv * 0.4
        }
        
        // Block settling
        if (x >= 0.05 && x < 0.15) {
          const settleX = x - 0.05
          const settleFreq = 200 + Math.sin(settleX * 100) * 20
          const settleEnv = Math.exp(-settleX * 20)
          sample += Math.sin(2 * Math.PI * settleFreq * x) * settleEnv * 0.2
        }
        
        // Slight stereo variation
        const pan = channel === 0 ? 0.55 : 0.45
        channelData[i] = sample * pan
      }
    }
    
    return buffer
  }

  private createBreakSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Block breaking sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Crackling break sound
        let sample = 0
        
        // Initial crack
        if (x < 0.1) {
          const crackFreq = 800 * (1 - x/0.1 * 0.6)
          const crackEnv = Math.sin(Math.PI * x / 0.1) * Math.exp(-x * 30)
          sample += Math.sin(2 * Math.PI * crackFreq * x) * crackEnv * 0.5
        }
        
        // Debris falling (0.05s - 0.25s)
        if (x >= 0.05 && x < 0.25) {
          const debrisX = x - 0.05
          const debrisFreq = 300 + Math.random() * 100
          const debrisEnv = Math.exp(-debrisX * 15)
          sample += Math.sin(2 * Math.PI * debrisFreq * x) * debrisEnv * 0.3
        }
        
        // Wide stereo for breakage
        const pan = channel === 0 ? 
          Math.sin(x * Math.PI * 10) * 0.5 + 0.5 : 
          Math.cos(x * Math.PI * 10) * 0.5 + 0.5
        
        channelData[i] = sample * pan * 0.4
      }
    }
    
    return buffer
  }

  private createStepSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.15
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Footstep sound (grass/dirt)
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Crunchy step sound
        let sample = 0
        
        // Low thud
        const thudFreq = 150
        const thudEnv = Math.exp(-x * 40)
        sample += Math.sin(2 * Math.PI * thudFreq * x) * thudEnv * 0.3
        
        // High crunch (noise)
        if (x < 0.05) {
          const crunch = Math.random() * 2 - 1
          const crunchEnv = Math.exp(-x * 80)
          sample += crunch * crunchEnv * 0.2
        }
        
        // Slight panning based on foot
        const pan = channel === 0 ? 0.4 : 0.6 // Left vs right foot
        channelData[i] = sample * pan
      }
    }
    
    return buffer
  }

  private createDoorOpenSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.5
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Wooden door opening
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Slow creak opening
        let sample = 0
        
        // Main creak (slow rising frequency)
        const creakFreq = 200 + x * 50
        const creakEnv = Math.sin(Math.PI * x / duration) * 0.8
        sample += Math.sin(2 * Math.PI * creakFreq * x) * creakEnv * 0.3
        
        // Wood grain noise
        const noiseFreq = 800 + Math.sin(x * 20) * 100
        const noiseEnv = Math.exp(-x * 6)
        sample += Math.sin(2 * Math.PI * noiseFreq * x) * noiseEnv * 0.1
        
        // Stereo sweep
        const pan = channel === 0 ? 
          1 - x/duration : 
          x/duration
        
        channelData[i] = sample * pan * 0.4
      }
    }
    
    return buffer
  }

  private createDoorCloseSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Door closing with latch
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        let sample = 0
        
        // Door swing
        if (x < 0.2) {
          const swingFreq = 300 * (1 - x/0.2 * 0.7)
          const swingEnv = Math.sin(Math.PI * x / 0.2)
          sample += Math.sin(2 * Math.PI * swingFreq * x) * swingEnv * 0.4
        }
        
        // Latch click at end
        if (x > 0.25 && x < 0.3) {
          const latchX = x - 0.25
          const latchFreq = 1200
          const latchEnv = Math.exp(-latchX * 100)
          sample += Math.sin(2 * Math.PI * latchFreq * x) * latchEnv * 0.2
        }
        
        // Reverse stereo sweep
        const pan = channel === 0 ? 
          x/duration : 
          1 - x/duration
        
        channelData[i] = sample * pan * 0.4
      }
    }
    
    return buffer
  }

  private createSelectSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.1
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Item selection sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Clean, short select sound
        const freq = 1000
        const envelope = Math.sin(Math.PI * x / duration) * Math.exp(-x * 50)
        const pan = channel === 0 ? 0.6 : 0.4
        
        channelData[i] = Math.sin(2 * Math.PI * freq * x) * envelope * pan * 0.3
      }
    }
    
    return buffer
  }

  private createBackpackSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.25
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Inventory open/close sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Leather/cloth rustle with metal click
        let sample = 0
        
        // Rustle noise
        if (x < 0.15) {
          const rustle = Math.random() * 2 - 1
          const rustleEnv = Math.sin(Math.PI * x / 0.15) * Math.exp(-x * 30)
          sample += rustle * rustleEnv * 0.2
        }
        
        // Buckle click at end
        if (x > 0.2) {
          const clickX = x - 0.2
          const clickFreq = 800
          const clickEnv = Math.exp(-clickX * 80)
          sample += Math.sin(2 * Math.PI * clickFreq * x) * clickEnv * 0.3
        }
        
        // Balanced stereo
        const pan = channel === 0 ? 0.5 : 0.5
        channelData[i] = sample * pan
      }
    }
    
    return buffer
  }

  private createLevelUpSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 1.5
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Epic level up sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Multi-part level up sequence
        let sample = 0
        
        // Initial glow (0-0.3s)
        if (x < 0.3) {
          const glowFreq = 400 + x * 200
          const glowEnv = Math.sin(Math.PI * x / 0.3)
          sample += Math.sin(2 * Math.PI * glowFreq * x) * glowEnv * 0.4
        }
        
        // Sparkle burst (0.3-0.8s)
        if (x >= 0.3 && x < 0.8) {
          const burstX = x - 0.3
          const burstFreq = 1200 + Math.sin(burstX * 40) * 300
          const burstEnv = Math.exp(-burstX * 3)
          sample += Math.sin(2 * Math.PI * burstFreq * x) * burstEnv * 0.3
        }
        
        // Final chord (0.8-1.5s)
        if (x >= 0.8) {
          const chordX = x - 0.8
          // Major chord: C, E, G
          const chordFreqs = [523.25, 659.25, 783.99]
          const chordEnv = Math.exp(-chordX * 2)
          
          chordFreqs.forEach(freq => {
            sample += Math.sin(2 * Math.PI * freq * x) * chordEnv * 0.2
          })
        }
        
        // Dynamic stereo panning
        const pan = channel === 0 ? 
          Math.sin(x * Math.PI * 4) * 0.5 + 0.5 : 
          Math.cos(x * Math.PI * 4) * 0.5 + 0.5
        
        channelData[i] = sample * pan * 0.5
      }
    }
    
    return buffer
  }

  async playSound(type: SoundType, config: SoundConfig = { volume: 1, loop: false }) {
    if (!this.enabled || !this.audioContext) return null
    
    // Resume audio context if suspended (required by browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    
    try {
      const buffer = this.sounds.get(type)
      if (!buffer) {
        console.warn(`Sound type "${type}" not found`)
        return null
      }

      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      source.loop = config.loop || false
      source.playbackRate.value = config.playbackRate || 1
      
      // Smooth volume changes
      gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(
        config.volume * this.masterVolume, 
        this.audioContext.currentTime + 0.01
      )
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
      return source
    } catch (error) {
      console.error('Error playing sound:', error)
      return null
    }
  }

  async playRandomized(type: SoundType, variations: number = 3, config: SoundConfig = { volume: 1, loop: false }) {
    // Play sound with slight random variations for natural feel
    const randomizedConfig = {
      ...config,
      playbackRate: 1 + (Math.random() - 0.5) * 0.1, // ±5% pitch variation
      volume: config.volume * (0.9 + Math.random() * 0.2) // ±10% volume variation
    }
    
    return this.playSound(type, randomizedConfig)
  }

  async playSequence(sounds: Array<{type: SoundType, delay?: number, config?: SoundConfig}>) {
    // Play a sequence of sounds with delays
    let currentTime = 0
    
    for (const sound of sounds) {
      setTimeout(() => {
        this.playSound(sound.type, sound.config || { volume: 1 })
      }, currentTime)
      
      currentTime += sound.delay || 0
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  toggleEnabled(enabled?: boolean) {
    this.enabled = enabled !== undefined ? enabled : !this.enabled
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }

  getAvailableSounds(): SoundType[] {
    return Array.from(this.sounds.keys())
  }
}

// Singleton instance
export const soundManager = new SoundManager()

// Hook for React components
export const useSounds = () => {
  const play = (type: SoundType, config?: SoundConfig) => {
    return soundManager.playSound(type, config)
  }

  const playRandomized = (type: SoundType, variations?: number, config?: SoundConfig) => {
    return soundManager.playRandomized(type, variations, config)
  }

  const playSequence = (sounds: Array<{type: SoundType, delay?: number, config?: SoundConfig}>) => {
    return soundManager.playSequence(sounds)
  }

  const setVolume = (volume: number) => {
    soundManager.setMasterVolume(volume)
  }

  const toggle = (enabled?: boolean) => {
    return soundManager.toggleEnabled(enabled)
  }

  const getAvailableSounds = () => {
    return soundManager.getAvailableSounds()
  }

  return {
    play,
    playRandomized,
    playSequence,
    setVolume,
    toggle,
    getAvailableSounds,
    isEnabled: soundManager.isEnabled()
  }
}