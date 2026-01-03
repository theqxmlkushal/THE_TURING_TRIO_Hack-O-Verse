'use client'

import React from 'react'

interface FloatingBlockProps {
  type: 'dirt' | 'grass' | 'stone' | 'wood' | 'diamond' | 'emerald'
  size?: 'sm' | 'md' | 'lg'
  position: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  rotationSpeed?: 'slow' | 'medium' | 'fast'
  floatSpeed?: 'slow' | 'medium' | 'fast'
}

const FloatingBlock: React.FC<FloatingBlockProps> = ({
  type,
  size = 'md',
  position,
  rotationSpeed = 'medium',
  floatSpeed = 'medium'
}) => {
  const typeColors = {
    dirt: 'bg-[#7C5C3A]',
    grass: 'bg-[#5B7C3A]',
    stone: 'bg-[#7F7F7F]',
    wood: 'bg-[#8B7355]',
    diamond: 'bg-[#4AF9FF]',
    emerald: 'bg-[#00FF00]'
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const rotationClasses = {
    slow: 'animate-spin-slow',
    medium: 'animate-spin-medium',
    fast: 'animate-spin-fast'
  }

  const floatClasses = {
    slow: 'animate-float-slow',
    medium: 'animate-float-medium',
    fast: 'animate-float-fast'
  }

  return (
    <div
      className={`absolute ${sizeClasses[size]} ${rotationClasses[rotationSpeed]} ${floatClasses[floatSpeed]} pointer-events-none`}
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        right: position.right
      }}
    >
      {/* Block with 3D effect */}
      <div className={`relative w-full h-full ${typeColors[type]} border-4 border-black transform-style-3d`}>
        {/* Top face */}
        <div className="absolute inset-0 bg-inherit border-2 border-white/20"></div>
        
        {/* Front face */}
        <div className="absolute inset-0 bg-inherit border-2 border-black/50 transform translateZ-6 -translate-y-0.5"></div>
        
        {/* Side face */}
        <div className="absolute inset-0 bg-inherit border-2 border-black/30 transform translateX-3 rotateY-90"></div>
      </div>
    </div>
  )
}

export default FloatingBlock