'use client'

import { useEffect, useRef } from 'react'

interface UseMinecraftAnimationProps {
  type?: 'blockBreak' | 'blockPlace' | 'itemPickup' | 'portal' | 'explosion'
  duration?: number
  onComplete?: () => void
}

export const useMinecraftAnimation = ({
  type = 'blockBreak',
  duration = 500,
  onComplete
}: UseMinecraftAnimationProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const animationId = useRef<number>()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const animations = {
      blockBreak: (progress: number) => {
        const scale = 1 - (progress * 0.5)
        const opacity = 1 - progress
        const rotation = progress * 360
        
        element.style.transform = `scale(${scale}) rotate(${rotation}deg)`
        element.style.opacity = opacity.toString()
      },
      
      blockPlace: (progress: number) => {
        const scale = 0.5 + (progress * 0.5)
        const y = (1 - progress) * 50
        
        element.style.transform = `scale(${scale}) translateY(${y}px)`
        element.style.opacity = progress.toString()
      },
      
      itemPickup: (progress: number) => {
        const scale = 1 + (progress * 0.2)
        const y = -progress * 100
        
        element.style.transform = `scale(${scale}) translateY(${y}px)`
        element.style.opacity = (1 - progress * 0.5).toString()
      },
      
      portal: (progress: number) => {
        const scale = 1 + Math.sin(progress * Math.PI) * 0.3
        const rotation = progress * 720
        
        element.style.transform = `scale(${scale}) rotate(${rotation}deg)`
        element.style.filter = `hue-rotate(${progress * 360}deg) brightness(${1 + progress})`
      },
      
      explosion: (progress: number) => {
        const scale = 1 + progress * 2
        const opacity = 1 - progress
        
        element.style.transform = `scale(${scale})`
        element.style.opacity = opacity.toString()
        element.style.filter = `blur(${progress * 5}px)`
      }
    }

    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      animations[type](progress)
      
      if (progress < 1) {
        animationId.current = requestAnimationFrame(animate)
      } else {
        if (onComplete) onComplete()
      }
    }
    
    // Start animation
    animationId.current = requestAnimationFrame(animate)
    
    // Cleanup
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }
  }, [type, duration, onComplete])

  const triggerAnimation = () => {
    // Reset and trigger animation
    if (elementRef.current) {
      elementRef.current.style.transform = ''
      elementRef.current.style.opacity = ''
      elementRef.current.style.filter = ''
    }
    
    // You can trigger the animation effect here
    // This is a simplified version
    const element = elementRef.current
    if (element) {
      element.classList.add('animate-pixel-bounce')
      setTimeout(() => {
        element.classList.remove('animate-pixel-bounce')
      }, duration)
    }
  }

  return { elementRef, triggerAnimation }
}