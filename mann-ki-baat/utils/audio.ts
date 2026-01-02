import { AudioConfig } from '@/types'

export class AudioManager {
  private audioContext: AudioContext | null = null
  private audioBuffers: Map<string, AudioBuffer> = new Map()
  private activeSources: Set<AudioBufferSourceNode> = new Set()
  private masterGain: GainNode | null = null
  private isEnabled: boolean = true
  private masterVolume: number = 0.5

  constructor() {
    this.initializeAudioContext()
  }

  private initializeAudioContext() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        this.masterGain = this.audioContext.createGain()
        this.masterGain.gain.value = this.masterVolume
        this.masterGain.connect(this.audioContext.destination)
      } catch (error) {
        console.error('Failed to initialize audio context:', error)
      }
    }
  }

  async loadAudio(src: string, config: AudioConfig): Promise<AudioBuffer | null> {
    if (!this.audioContext || !this.isEnabled) return null

    try {
      // Check if already loaded
      if (this.audioBuffers.has(src)) {
        return this.audioBuffers.get(src)!
      }

      // Fetch audio file
      const response = await fetch(src)
      if (!response.ok) throw new Error(`Failed to load audio: ${response.statusText}`)
      
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      
      this.audioBuffers.set(src, audioBuffer)
      return audioBuffer
    } catch (error) {
      console.error('Error loading audio:', error)
      return null
    }
  }

  async playAudio(src: string, config?: Partial<AudioConfig>): Promise<AudioBufferSourceNode | null> {
    if (!this.audioContext || !this.isEnabled) return null

    try {
      const audioBuffer = await this.loadAudio(src, { src, volume: 0.5, loop: false, ...config })
      if (!audioBuffer) return null

      // Create source node
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = audioBuffer
      source.loop = config?.loop || false
      
      // Set volume
      gainNode.gain.value = (config?.volume || 0.5) * this.masterVolume
      
      // Connect nodes
      source.connect(gainNode)
      gainNode.connect(this.masterGain || this.audioContext.destination)
      
      // Track active source
      this.activeSources.add(source)
      source.addEventListener('ended', () => {
        this.activeSources.delete(source)
      })
      
      // Start playback
      source.start()
      return source
    } catch (error) {
      console.error('Error playing audio:', error)
      return null
    }
  }

  playAmbient(src: string, volume: number = 0.3): AudioBufferSourceNode | null {
    return this.playAudio(src, { volume, loop: true })
  }

  stopAllAudio() {
    this.activeSources.forEach(source => {
      try {
        source.stop()
      } catch (error) {
        // Source might already be stopped
      }
    })
    this.activeSources.clear()
  }

  stopAudio(source: AudioBufferSourceNode) {
    try {
      source.stop()
      this.activeSources.delete(source)
    } catch (error) {
      console.error('Error stopping audio:', error)
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume
    }
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  toggleEnabled(enabled?: boolean): boolean {
    this.isEnabled = enabled !== undefined ? enabled : !this.isEnabled
    
    if (!this.isEnabled) {
      this.stopAllAudio()
    }
    
    return this.isEnabled
  }

  isAudioEnabled(): boolean {
    return this.isEnabled
  }

  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  suspendAudioContext() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend()
    }
  }

  // Create procedural sounds
  createClickSound(duration: number = 0.1, frequency: number = 800): AudioBuffer | null {
    if (!this.audioContext) return null

    const sampleRate = this.audioContext.sampleRate
    const frameCount = Math.floor(duration * sampleRate)
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      // Exponential decay envelope
      const envelope = Math.exp(-t * 40)
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope
    }

    return buffer
  }

  createSuccessSound(): AudioBuffer | null {
    if (!this.audioContext) return null

    const duration = 0.5
    const sampleRate = this.audioContext.sampleRate
    const frameCount = Math.floor(duration * sampleRate)
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      const envelope = Math.sin(Math.PI * t / duration)
      const frequency = 400 + (t / duration) * 400 // Rising pitch
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope
    }

    return buffer
  }

  createErrorSound(): AudioBuffer | null {
    if (!this.audioContext) return null

    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const frameCount = Math.floor(duration * sampleRate)
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 10)
      const frequency = 600 - (t / duration) * 300 // Falling pitch
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope
    }

    return buffer
  }
}

// Singleton instance
export const audioManager = new AudioManager()

// React hook for audio
export const useAudio = (src: string, config?: Partial<AudioConfig>) => {
  const play = () => audioManager.playAudio(src, config)
  const playAmbient = (volume?: number) => audioManager.playAmbient(src, volume)
  
  return {
    play,
    playAmbient,
    setVolume: audioManager.setMasterVolume.bind(audioManager),
    toggleEnabled: audioManager.toggleEnabled.bind(audioManager),
    isEnabled: audioManager.isAudioEnabled()
  }
}