'use client'

import { ReactNode } from 'react'

interface MinecraftBlockProps {
  children?: ReactNode
  type?: 'grass' | 'dirt' | 'stone' | 'wood' | 'planks' | 'glass' | 'diamond' | 'gold' | 'emerald'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  interactive?: boolean
  animated?: boolean
  className?: string
}

export default function MinecraftBlock({
  children,
  type = 'dirt',
  size = 'md',
  onClick,
  interactive = false,
  animated = false,
  className = ''
}: MinecraftBlockProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const typeClasses = {
    grass: 'mc-block-grass',
    dirt: 'mc-block-dirt',
    stone: 'mc-block-stone',
    wood: 'mc-block-wood',
    planks: 'bg-gradient-to-b from-mc-wood to-#9B7B55',
    glass: 'bg-gradient-to-b from-#80DEEA to-#4DD0E1 border-2 border-black/30',
    diamond: 'bg-gradient-to-b from-#4FC3F7 to-#0288D1',
    gold: 'bg-gradient-to-b from-#FFD700 to-#FFA000',
    emerald: 'bg-gradient-to-b from-#00E676 to-#00C853'
  }

  return (
    <div
      className={`
        relative ${sizeClasses[size]} border-4 border-black
        ${typeClasses[type]}
        ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}
        ${animated ? 'animate-pulse-glow' : ''}
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      style={{
        boxShadow: `
          inset -4px -4px 0 rgba(0,0,0,0.3),
          inset 4px 4px 0 rgba(255,255,255,0.2),
          0 4px 8px rgba(0,0,0,0.2)
        `
      }}
    >
      {/* Block texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==')] bg-repeat bg-[length:8px_8px]"></div>
      
      {/* Block highlight */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/30 to-transparent"></div>
      
      {/* Content */}
      {children && (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}