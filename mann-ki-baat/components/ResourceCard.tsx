'use client'

import React, { useState } from 'react'
import { Play, Brain, Music, Activity, Heart, BookOpen, Shield } from 'lucide-react'
import MinecraftButton from './MinecraftButton'
import ProgressBar from './ProgressBar'

interface ResourceCardProps {
  title: string
  description: string
  category: 'game' | 'exercise' | 'yoga' | 'audio' | 'meditation' | 'education'
  thumbnailColor: string
  progress?: number
  duration?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  onStart?: () => void
}

const categoryIcons = {
  game: Brain,
  exercise: Activity,
  yoga: Heart,
  audio: Music,
  meditation: Shield,
  education: BookOpen
}

const categoryLabels = {
  game: 'GAME',
  exercise: 'EXERCISE',
  yoga: 'YOGA',
  audio: 'AUDIO',
  meditation: 'MEDITATION',
  education: 'EDUCATION'
}

const difficultyColors = {
  easy: 'bg-mc-green',
  medium: 'bg-mc-yellow',
  hard: 'bg-mc-red'
}

export default function ResourceCard({
  title,
  description,
  category,
  thumbnailColor,
  progress = 0,
  duration = '10-15 min',
  difficulty = 'easy',
  tags = [],
  onStart
}: ResourceCardProps) {
  const [hover, setHover] = useState(false)
  const Icon = categoryIcons[category]

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Card Shadow */}
      <div className="absolute inset-0 bg-black translate-y-3 translate-x-3 rounded-lg"></div>
      
      {/* Main Card */}
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
        {/* Thumbnail Section */}
        <div 
          className="h-48 relative overflow-hidden border-b-4 border-black"
          style={{ backgroundColor: thumbnailColor }}
        >
          {/* Animated background pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1))
              `,
              backgroundSize: '16px 16px'
            }}
          />
          
          {/* Icon Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              relative p-6 border-4 border-black
              bg-gradient-to-br from-white/20 to-black/20
              transition-all duration-500
              ${hover ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}
            `}>
              <Icon className="w-16 h-16 text-white drop-shadow-lg" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 border-2 border-white/30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <div className="bg-black/80 border-2 border-white/50 px-3 py-1">
              <span className="font-minecraft text-white text-xs">
                {categoryLabels[category]}
              </span>
            </div>
          </div>
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <div className={`${difficultyColors[difficulty]} border-2 border-black px-3 py-1`}>
              <span className="font-minecraft-bold text-black text-xs">
                {difficulty.toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className={`
            absolute inset-0 bg-gradient-to-t from-black/70 to-transparent
            flex items-center justify-center
            transition-opacity duration-300
            ${hover ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="text-center p-4">
              <div className="font-minecraft-bold text-white text-xl mb-2">
                READY TO PLAY?
              </div>
              <div className="font-minecraft text-white/90 text-sm">
                Click start to begin your journey
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-minecraft-bold text-xl text-gray-800 mb-2 line-clamp-1">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-4">
              <ProgressBar
                value={progress}
                variant="experience"
                size="sm"
                showLabel={false}
                showPercentage={false}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
          
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Duration */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-mc-blue border border-black"></div>
                <span className="font-minecraft text-gray-700 text-xs">
                  {duration}
                </span>
              </div>
              
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex gap-1">
                  {tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-200 border border-gray-300 font-minecraft text-gray-700 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-200 border border-gray-300 font-minecraft text-gray-700 text-xs">
                      +{tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-gradient-to-b from-mc-green to-mc-dark-green flex items-center justify-center">
                <span className="font-minecraft-bold text-white text-xs">
                  {category === 'game' ? '🎮' : category === 'audio' ? '🎵' : '🧘'}
                </span>
              </div>
              <span className="font-minecraft text-gray-600 text-sm">
                Free to play
              </span>
            </div>
            
            <MinecraftButton
              onClick={onStart}
              size="sm"
              variant="primary"
              icon={Play}
              iconPosition="right"
            >
              START
            </MinecraftButton>
          </div>
        </div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-mc-brown border-r-4 border-b-4 border-black"></div>
        <div className="absolute top-0 right-0 w-6 h-6 bg-mc-brown border-l-4 border-b-4 border-black"></div>
      </div>
    </div>
  )
}