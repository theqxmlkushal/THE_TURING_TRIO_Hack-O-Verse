'use client'

import { useState, useEffect, useRef } from 'react'

interface UseAudioProps {
  audioSrc: string
  volume?: number
  loop?: boolean
}

export const useAudio = ({ 
  audioSrc, 
  volume = 0.3, 
  loop = true 
}: UseAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVolume, setCurrentVolume] = useState(volume)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    const initAudio = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Create audio element
        audioRef.current = new Audio(audioSrc)
        audioRef.current.loop = loop
        audioRef.current.volume = currentVolume
        audioRef.current.preload = 'auto'
        
        // Set up event listeners
        audioRef.current.addEventListener('canplaythrough', () => {
          setIsLoading(false)
        })
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio loading error:', e)
          setError('Failed to load audio')
          setIsLoading(false)
        })
        
        audioRef.current.addEventListener('ended', () => {
          if (!loop) {
            setIsPlaying(false)
          }
        })
        
      } catch (err) {
        console.error('Audio initialization error:', err)
        setError('Audio initialization failed')
        setIsLoading(false)
      }
    }

    initAudio()

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioSrc, loop])

  const togglePlay = async () => {
    if (!audioRef.current) return
    
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setError('Playback failed. Please try again.')
    }
  }

  const setVolume = (newVolume: number) => {
    const volume = Math.max(0, Math.min(1, newVolume))
    setCurrentVolume(volume)
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return {
    isPlaying,
    togglePlay,
    volume: currentVolume,
    setVolume,
    stop,
    isLoading,
    error,
    audioElement: audioRef.current
  }
}