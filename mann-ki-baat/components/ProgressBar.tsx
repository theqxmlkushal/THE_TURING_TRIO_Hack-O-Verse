'use client'

import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'health' | 'experience' | 'stamina' | 'custom'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  label = 'Progress',
  showPercentage = true,
  variant = 'health',
  size = 'md',
  animated = false,
  showLabel = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const variantConfig = {
    health: {
      colors: {
        fill: 'bg-gradient-to-r from-mc-red via-#FF5252 to-#FF6B6B',
        bg: 'bg-red-900/30',
        text: 'text-red-200'
      },
      icon: '❤️'
    },
    experience: {
      colors: {
        fill: 'bg-gradient-to-r from-mc-green via-#5CAD4A to-#7CBD6B',
        bg: 'bg-green-900/30',
        text: 'text-green-200'
      },
      icon: '⭐'
    },
    stamina: {
      colors: {
        fill: 'bg-gradient-to-r from-mc-blue via-#3D7EAA to-#7EC0EE',
        bg: 'bg-blue-900/30',
        text: 'text-blue-200'
      },
      icon: '⚡'
    },
    custom: {
      colors: {
        fill: 'bg-gradient-to-r from-mc-yellow via-#FFD83D to-#FFC107',
        bg: 'bg-yellow-900/30',
        text: 'text-yellow-200'
      },
      icon: '📊'
    }
  }

  const sizeConfig = {
    sm: {
      height: 'h-4',
      text: 'text-xs',
      padding: 'px-2 py-1'
    },
    md: {
      height: 'h-6',
      text: 'text-sm',
      padding: 'px-3 py-1.5'
    },
    lg: {
      height: 'h-8',
      text: 'text-base',
      padding: 'px-4 py-2'
    }
  }

  const config = variantConfig[variant]
  const sizeStyle = sizeConfig[size]

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <span className={`font-minecraft ${config.colors.text} ${sizeStyle.text}`}>
              {label}
            </span>
          </div>
          
          {showPercentage && (
            <span className={`font-minecraft-bold ${config.colors.text} ${sizeStyle.text}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Outer border with shadow */}
        <div className="absolute -inset-1 bg-black/50 border-2 border-black rounded-lg"></div>
        
        {/* Inner container */}
        <div className="relative">
          {/* Background */}
          <div className={`
            ${sizeStyle.height} w-full border-2 border-black
            ${config.colors.bg} rounded
            overflow-hidden
          `}>
            {/* Progress Fill */}
            <div
              className={`
                ${sizeStyle.height} ${config.colors.fill}
                transition-all duration-500 ease-out
                relative
              `}
              style={{ width: `${percentage}%` }}
            >
              {/* Scan line effect */}
              {animated && percentage > 0 && (
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 animate-pulse"></div>
              )}
              
              {/* Texture overlay */}
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCw0IEw4LDQgTTQsMCBMNCw4IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+')]"></div>
              
              {/* Highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
          </div>

          {/* Increment markers */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-full bg-black/30"
                style={{ marginLeft: i === 0 ? '0' : i === 4 ? '0' : 'auto' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Value display */}
      <div className="flex justify-between text-xs text-gray-400 font-minecraft">
        <span>0</span>
        <span>{value} / {max}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}