'use client'

import { useState, useEffect } from 'react'

interface LoadingScreenProps {
  isLoading: boolean
  progress?: number
  message?: string
}

export default function LoadingScreen({ 
  isLoading, 
  progress = 0, 
  message = 'Loading Minecraft World...' 
}: LoadingScreenProps) {
  const [dots, setDots] = useState('')
  
  useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-mc-sky via-blue-900 to-black z-50 flex flex-col items-center justify-center">
      {/* Minecraft Logo */}
      <div className="mb-12 animate-pulse">
        <div className="relative">
          {/* Shadow */}
          <div className="absolute inset-0 bg-black translate-y-3 translate-x-3"></div>
          
          {/* Main logo */}
          <div className="relative bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow border-4 border-black px-12 py-8">
            <h1 className="font-minecraft-bold text-5xl md:text-6xl text-center">
              <span className="text-white">MANN KI</span>
              <br />
              <span className="text-white">BAAT</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Loading Container */}
      <div className="w-96 max-w-full px-8">
        {/* Loading Bar Container */}
        <div className="relative mb-6">
          {/* Border */}
          <div className="absolute -inset-2 bg-black/50 border-4 border-mc-gray"></div>
          
          {/* Loading Bar Background */}
          <div className="relative h-8 bg-gradient-to-r from-mc-dark-gray to-mc-gray border-4 border-black">
            {/* Loading Fill */}
            <div 
              className="h-full bg-gradient-to-r from-mc-green via-#5CAD4A to-mc-dark-green transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Scan line effect */}
              <div className="absolute inset-y-0 right-0 w-1 bg-white/50 animate-ping"></div>
            </div>
          </div>
          
          {/* Percentage Text */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <span className="font-minecraft text-white text-lg">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <div className="font-minecraft text-white text-lg mb-2">
            {message}
            <span className="inline-block w-4">{dots}</span>
          </div>
          
          {/* Tips */}
          <div className="mt-8 space-y-2">
            <div className="font-minecraft text-mc-yellow text-sm">
              Tip: You can adjust audio volume from the control panel
            </div>
            <div className="font-minecraft text-mc-green text-sm">
              Building a better mental world, one block at a time...
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Blocks */}
      <div className="absolute bottom-8 left-8 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-6 h-6 border-2 border-black bg-gradient-to-b from-mc-green to-mc-dark-green animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
      
      <div className="absolute bottom-8 right-8 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-6 h-6 border-2 border-black bg-gradient-to-b from-mc-blue to-mc-dark-blue animate-bounce"
            style={{
              animationDelay: `${i * 0.1 + 0.5}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}