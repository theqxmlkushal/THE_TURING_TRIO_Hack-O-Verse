export type SoundType = 
  | 'click' 
  | 'hover' 
  | 'success' 
  | 'error' 
  | 'notification'
  | 'page_transition'
  | 'game_start'
  | 'achievement'

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
  }

  private createClickSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.1
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a short click sound
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      channelData[i] = Math.sin(2 * Math.PI * 800 * x) * Math.exp(-x * 20)
    }
    
    return buffer
  }

  private createHoverSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.2
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a soft hover sound
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      channelData[i] = Math.sin(2 * Math.PI * 600 * x) * Math.exp(-x * 10) * 0.5
    }
    
    return buffer
  }

  private createSuccessSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.5
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a success sound (rising tone)
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      const frequency = 400 + (x / duration) * 400
      channelData[i] = Math.sin(2 * Math.PI * frequency * x) * Math.exp(-x * 4)
    }
    
    return buffer
  }

  private createErrorSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create an error sound (descending tone)
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      const frequency = 600 - (x / duration) * 400
      channelData[i] = Math.sin(2 * Math.PI * frequency * x) * Math.exp(-x * 6)
    }
    
    return buffer
  }

  private createNotificationSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.4
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a notification sound (two short beeps)
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      if (x < 0.1 || (x > 0.2 && x < 0.3)) {
        channelData[i] = Math.sin(2 * Math.PI * 800 * x) * Math.exp(-(x % 0.1) * 30)
      }
    }
    
    return buffer
  }

  private createPageTransitionSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.6
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create a stereo page transition sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        const pan = channel === 0 ? 1 - x / duration : x / duration
        const frequency = 300 + Math.sin(x * 20) * 50
        channelData[i] = Math.sin(2 * Math.PI * frequency * x) * Math.exp(-x * 3) * pan
      }
    }
    
    return buffer
  }

  private createGameStartSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 1.0
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create an epic game start sound
    for (let i = 0; i < frameCount; i++) {
      const x = i / sampleRate
      const frequency = 200 + Math.sin(x * 5) * 100
      channelData[i] = Math.sin(2 * Math.PI * frequency * x) * 
                      Math.sin(Math.PI * x / duration) *
                      Math.exp(-x * 2)
    }
    
    return buffer
  }

  private createAchievementSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available')
    
    const duration = 0.8
    const sampleRate = this.audioContext.sampleRate
    const frameCount = duration * sampleRate
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate)
    
    // Create a celebratory achievement sound
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < frameCount; i++) {
        const x = i / sampleRate
        
        // Multiple frequencies for a rich sound
        let sample = 0
        const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
        frequencies.forEach((freq, index) => {
          const envelope = Math.sin(Math.PI * (x - index * 0.1) / (duration - index * 0.1))
          sample += Math.sin(2 * Math.PI * freq * x) * envelope * 0.3
        })
        
        // Panning effect
        const pan = channel === 0 ? Math.sin(x * 10) * 0.5 + 0.5 : Math.cos(x * 10) * 0.5 + 0.5
        channelData[i] = sample * pan * Math.exp(-x * 1.5)
      }
    }
    
    return buffer
  }

  async playSound(type: SoundType, config: SoundConfig = { volume: 1, loop: false }) {
    if (!this.enabled || !this.audioContext) return null
    
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
      
      gainNode.gain.value = config.volume * this.masterVolume
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
      return source
    } catch (error) {
      console.error('Error playing sound:', error)
      return null
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
}

// Singleton instance
export const soundManager = new SoundManager()

// Hook for React components
export const useSounds = () => {
  const play = (type: SoundType, config?: SoundConfig) => {
    return soundManager.playSound(type, config)
  }

  const setVolume = (volume: number) => {
    soundManager.setMasterVolume(volume)
  }

  const toggle = (enabled?: boolean) => {
    return soundManager.toggleEnabled(enabled)
  }

  return {
    play,
    setVolume,
    toggle,
    isEnabled: soundManager.isEnabled()
  }
}