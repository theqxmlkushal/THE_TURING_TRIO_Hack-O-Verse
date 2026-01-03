'use client'

import React from 'react'

interface MinecraftCloudProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  speed?: 'slow' | 'medium' | 'fast' | 'very-slow'
  position: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  color?: string // Defaults to #FFFFFF
}

const MinecraftCloud: React.FC<MinecraftCloudProps> = ({
  size = 'md',
  speed = 'medium',
  position,
  color = '#FFFFFF'
}) => {
  // Minecraft clouds are roughly 12x4x4 pixel units in-game. 
  // We'll scale that ratio (3:1)
  const sizeClasses = {
    sm: 'w-24 h-8',
    md: 'w-48 h-16',
    lg: 'w-72 h-24',
    xl: 'w-96 h-32'
  }

  const speedAnimations = {
    'very-slow': 'drift-very-slow',
    'slow': 'drift-slow',
    'medium': 'drift-medium',
    'fast': 'drift-fast'
  }

  return (
    <div
      className={`absolute ${sizeClasses[size]} pointer-events-none`}
      style={{
        ...position,
        animation: `${speedAnimations[speed]} 60s linear infinite`,
      }}
    >
      {/* The Minecraft cloud is a 12x4 grid of blocks. 
          We use a container with a subtle bottom shadow for depth.
      */}
      <div className="relative w-full h-full">
        
        {/* Main Body (The central slab) */}
        <div 
          className="absolute inset-0 shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
          style={{ backgroundColor: color }}
        />

        {/* Top Pixel Layer (The classic Minecraft T-shape bump) */}
        <div 
          className="absolute -top-[25%] left-[16.6%] w-[66.6%] h-[25%]"
          style={{ backgroundColor: color }}
        />

        {/* Extra Bottom Depth (Optional: adds that 3D feel) */}
        <div 
          className="absolute -bottom-[10%] left-[8.3%] w-[83.3%] h-[10%] opacity-20 bg-black"
        />
      </div>
    </div>
  )
}

export default MinecraftCloud