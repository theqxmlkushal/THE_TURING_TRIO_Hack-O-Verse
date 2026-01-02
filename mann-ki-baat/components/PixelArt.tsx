'use client'

import React, { useState } from 'react'

interface PixelArtProps {
  type: 'heart' | 'brain' | 'tree' | 'sun' | 'moon' | 'star' | 'flower' | 'cloud' | 'custom'
  size?: number
  animated?: boolean
  colors?: string[]
  customPixels?: number[][]
  className?: string
}

const pixelPatterns = {
  heart: {
    size: 8,
    pixels: [
      [0,1,1,0,0,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0]
    ],
    colors: ['#FF6B6B', '#FF5252']
  },
  brain: {
    size: 8,
    pixels: [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,2,1,1,2,2,1],
      [1,2,1,2,2,1,2,1],
      [1,2,1,2,2,1,2,1],
      [1,2,2,1,1,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,1,1,1,0,0]
    ],
    colors: ['#FFB74D', '#FF9800', '#F57C00']
  },
  tree: {
    size: 8,
    pixels: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,2,2,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [1,2,2,2,2,2,2,1],
      [0,0,1,3,3,1,0,0],
      [0,0,1,3,3,1,0,0],
      [0,0,1,3,3,1,0,0]
    ],
    colors: ['#7CBD6B', '#5CAD4A', '#3B7C2F', '#8B7355']
  },
  sun: {
    size: 8,
    pixels: [
      [0,0,1,0,0,1,0,0],
      [0,0,0,1,1,0,0,0],
      [1,0,1,2,2,1,0,1],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [1,0,1,2,2,1,0,1],
      [0,0,0,1,1,0,0,0],
      [0,0,1,0,0,1,0,0]
    ],
    colors: ['#FFD700', '#FFA500']
  },
  moon: {
    size: 8,
    pixels: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,2,2,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,2,2,2,2,2,1],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,2,2,1,0,0],
      [0,0,0,1,1,0,0,0]
    ],
    colors: ['#E0E0E0', '#BDBDBD']
  },
  star: {
    size: 8,
    pixels: [
      [0,0,0,1,1,0,0,0],
      [0,1,0,0,0,0,1,0],
      [0,0,1,0,0,1,0,0],
      [1,0,0,1,1,0,0,1],
      [1,0,0,1,1,0,0,1],
      [0,0,1,0,0,1,0,0],
      [0,1,0,0,0,0,1,0],
      [0,0,0,1,1,0,0,0]
    ],
    colors: ['#FFD700']
  },
  flower: {
    size: 8,
    pixels: [
      [0,0,0,1,1,0,0,0],
      [0,1,0,2,2,0,1,0],
      [0,0,2,2,2,2,0,0],
      [1,2,2,3,3,2,2,1],
      [1,2,2,3,3,2,2,1],
      [0,0,2,2,2,2,0,0],
      [0,1,0,2,2,0,1,0],
      [0,0,0,1,1,0,0,0]
    ],
    colors: ['#FF6BCB', '#FF5252', '#7CBD6B']
  },
  cloud: {
    size: 8,
    pixels: [
      [0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,2,2,2,2,2,1],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0]
    ],
    colors: ['#FFFFFF', '#E0E0E0']
  }
}

export default function PixelArt({
  type,
  size = 64,
  animated = false,
  colors,
  customPixels,
  className = ''
}: PixelArtProps) {
  const [hover, setHover] = useState(false)
  
  const pattern = type === 'custom' 
    ? { size: customPixels?.length || 8, pixels: customPixels || [], colors: colors || ['#000'] }
    : pixelPatterns[type]
  
  const finalColors = colors || pattern.colors
  const pixelSize = Math.floor(size / pattern.size)

  const renderPixel = (value: number, rowIndex: number, colIndex: number) => {
    if (value === 0) return null
    
    const color = finalColors[value - 1] || finalColors[0]
    const isEdge = 
      rowIndex === 0 || 
      rowIndex === pattern.size - 1 || 
      colIndex === 0 || 
      colIndex === pattern.size - 1
    
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className="absolute border border-black/30"
        style={{
          left: colIndex * pixelSize,
          top: rowIndex * pixelSize,
          width: pixelSize,
          height: pixelSize,
          backgroundColor: color,
          boxShadow: isEdge 
            ? 'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.3)'
            : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
          animation: animated && hover ? `pixel-glow 0.5s ease-in-out ${(rowIndex + colIndex) * 0.05}s` : 'none'
        }}
      />
    )
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${pixelSize}px ${pixelSize}px`
        }}
      />
      
      {/* Pixels */}
      {pattern.pixels.map((row, rowIndex) =>
        row.map((pixel, colIndex) => renderPixel(pixel, rowIndex, colIndex))
      )}

      {/* Outer border */}
      <div className="absolute inset-0 border-2 border-black/50"></div>
    </div>
  )
}