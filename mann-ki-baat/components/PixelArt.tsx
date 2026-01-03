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

/* -------------------- SAFE FALLBACK -------------------- */
const fallbackPattern = {
  size: 8,
  pixels: Array.from({ length: 8 }, () => Array(8).fill(0)),
  colors: ['#000000']
}

/* -------------------- PATTERNS -------------------- */
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
} as const

/* -------------------- COMPONENT -------------------- */
export default function PixelArt({
  type,
  size = 64,
  animated = false,
  colors,
  customPixels,
  className = ''
}: PixelArtProps) {
  const [hover, setHover] = useState(false)

  const pattern =
    type === 'custom'
      ? {
          size: customPixels?.length || fallbackPattern.size,
          pixels: customPixels?.length ? customPixels : fallbackPattern.pixels,
          colors: colors?.length ? colors : fallbackPattern.colors
        }
      : pixelPatterns[type] ?? fallbackPattern

  const finalColors = colors?.length ? colors : pattern.colors
  const pixelSize = Math.max(1, Math.floor(size / pattern.size))

  const renderPixel = (value: number, r: number, c: number) => {
    if (!value) return null

    return (
      <div
        key={`${r}-${c}`}
        className="absolute border border-black/30"
        style={{
          left: c * pixelSize,
          top: r * pixelSize,
          width: pixelSize,
          height: pixelSize,
          backgroundColor: finalColors[value - 1] || finalColors[0],
          animation:
            animated && hover
              ? `pixel-glow 0.5s ease-in-out ${(r + c) * 0.05}s`
              : 'none'
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
      {pattern.pixels.map((row, r) =>
        row.map((px, c) => renderPixel(px, r, c))
      )}

      <div className="absolute inset-0 border-2 border-black/50" />
    </div>
  )
}
