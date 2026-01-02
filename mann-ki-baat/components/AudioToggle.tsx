'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Volume1, Music } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

interface AudioToggleProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
}

export default function AudioToggle({ position = 'bottom-right' }: AudioToggleProps) {
  const [showVolume, setShowVolume] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { 
    isPlaying, 
    togglePlay, 
    volume, 
    setVolume,
    isLoading,
    error 
  } = useAudio({
    audioSrc: '/audio/minecraft-ambient.mp3',
    volume: 0.3,
    loop: true
  })

  // Fallback audio sources if primary fails
  const fallbackAudioSrc = '/audio/minecraft-ambient.ogg'

  // Handle hover for entire component
  useEffect(() => {
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.relatedTarget as Node)) {
        setIsHovering(false)
        if (!showVisualizer) {
          setShowVolume(false)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [showVisualizer])

  // Auto-show volume when hovering over button area
  useEffect(() => {
    if (isHovering) {
      setShowVolume(true)
    } else if (!showVisualizer) {
      // Small delay to allow for clicking on the volume slider
      const timer = setTimeout(() => setShowVolume(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isHovering, showVisualizer])

  // Audio visualization effect
  useEffect(() => {
    let animationFrameId: number
    
    if (showVisualizer && isPlaying) {
      const canvas = document.getElementById('audio-visualizer') as HTMLCanvasElement
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const drawVisualizer = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw pulsing circle
        const time = Date.now() * 0.002
        const pulse = Math.sin(time) * 0.5 + 0.5
        
        // Outer glow
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, 15, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(91, 205, 74, ${0.2 + pulse * 0.3})`
        ctx.fill()
        
        // Inner circle
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, 10 + pulse * 3, 0, Math.PI * 2)
        ctx.fillStyle = isPlaying ? '#5BCD4A' : '#9C9C9C'
        ctx.fill()
        
        // Audio waves
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const waveSize = Math.sin(time * 2 + i) * 5 + 10
          
          ctx.beginPath()
          ctx.arc(
            canvas.width / 2 + Math.cos(angle) * 20,
            canvas.height / 2 + Math.sin(angle) * 20,
            waveSize,
            0,
            Math.PI * 2
          )
          ctx.strokeStyle = `rgba(91, 205, 74, ${0.3 + Math.sin(time + i) * 0.2})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
        
        animationFrameId = requestAnimationFrame(drawVisualizer)
      }
      
      drawVisualizer()
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [showVisualizer, isPlaying])

  const positionClasses = {
    'top-right': 'top-6 right-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end gap-3`}
    >
      {/* Error message */}
      {error && (
        <div className="bg-red-500/90 border-2 border-black px-3 py-2 animate-block-place">
          <span className="font-minecraft text-white text-xs">{error}</span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="bg-yellow-500/90 border-2 border-black px-3 py-2 animate-pulse">
          <span className="font-minecraft text-white text-xs">Loading audio...</span>
        </div>
      )}

      {/* Volume Control Panel */}
      {showVolume && (
        <div 
          className="bg-gradient-to-b from-mc-brown to-mc-dark-brown border-4 border-black p-4 mb-2 animate-block-place shadow-2xl"
          onMouseEnter={() => setIsHovering(true)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume1 className="w-5 h-5 text-white" />
                <span className="font-minecraft text-white text-sm">VOLUME</span>
              </div>
              <span className="font-minecraft text-white text-sm bg-black/50 px-2 py-1">
                {Math.round(volume * 100)}%
              </span>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-mc-green [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
              />
              
              <div className="flex justify-between text-xs">
                <span className="font-minecraft text-white/70">0%</span>
                <span className="font-minecraft text-white/70">50%</span>
                <span className="font-minecraft text-white/70">100%</span>
              </div>
            </div>
            
            {/* Visualizer toggle */}
            <button
              onClick={() => setShowVisualizer(!showVisualizer)}
              className="w-full mt-2 px-3 py-2 bg-black/30 border-2 border-mc-green/50 hover:border-mc-green transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Music className="w-4 h-4 text-white" />
                <span className="font-minecraft text-white text-xs">
                  {showVisualizer ? 'HIDE VISUALIZER' : 'SHOW VISUALIZER'}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Audio Visualizer Canvas */}
      {showVisualizer && (
        <div 
          className="mb-2 bg-black/50 border-4 border-mc-green p-2 animate-block-place"
          onMouseEnter={() => setIsHovering(true)}
        >
          <canvas
            id="audio-visualizer"
            width="120"
            height="120"
            className="block"
          />
        </div>
      )}

      {/* Main Audio Button */}
      <div className="relative group">
        {/* Button Container with 3D Effect */}
        <div className="relative">
          {/* Button Shadow Layer */}
          <div className="absolute inset-0 bg-black translate-y-1.5 translate-x-1.5 rounded-lg"></div>
          
          {/* Button Border Layer */}
          <div className="absolute inset-0 border-4 border-black rounded-lg bg-gradient-to-br from-mc-dark-gray to-black"></div>
          
          {/* Main Button */}
          <button
            onClick={togglePlay}
            onMouseEnter={() => setIsHovering(true)}
            disabled={isLoading}
            className={`
              relative w-16 h-16 flex items-center justify-center
              transition-all duration-200
              ${isPlaying 
                ? 'bg-gradient-to-b from-mc-green to-mc-dark-green' 
                : 'bg-gradient-to-b from-mc-gray to-mc-dark-gray'
              }
              group-hover:brightness-110
              active:translate-y-1 active:translate-x-1
              active:duration-100
              disabled:opacity-50 disabled:cursor-not-allowed
              rounded-lg
            `}
            style={{
              boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.3), inset 4px 4px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Button Inner Glow */}
            <div className="absolute inset-2 rounded bg-gradient-to-br from-white/10 to-transparent"></div>
            
            {/* Icon */}
            <div className="relative z-10">
              {isPlaying ? (
                <div className="animate-pulse">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
              ) : (
                <VolumeX className="w-8 h-8 text-white" />
              )}
            </div>
            
            {/* Status Indicator */}
            <div className="absolute -top-1 -right-1">
              <div className={`
                w-5 h-5 rounded-full border-2 border-black flex items-center justify-center
                ${isPlaying ? 'bg-mc-green' : 'bg-mc-red'}
              `}>
                <span className="font-minecraft text-white text-xs">
                  {isPlaying ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            
            {/* Loading Animation */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="w-6 h-6 border-2 border-mc-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}