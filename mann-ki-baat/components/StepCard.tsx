'use client'

import React, { useState } from 'react'
import { MessageSquare, Mic, Video, CheckCircle, Lock, ArrowRight } from 'lucide-react'
import MinecraftButton from './MinecraftButton'

interface StepCardProps {
  step: number
  title: string
  description: string
  type: 'text' | 'voice' | 'video'
  status: 'locked' | 'unlocked' | 'completed'
  estimatedTime?: string
  onStart?: () => void
}

export default function StepCard({
  step,
  title,
  description,
  type,
  status,
  estimatedTime = '5-10 mins',
  onStart
}: StepCardProps) {
  const [hover, setHover] = useState(false)

  const typeConfig = {
    text: {
      icon: MessageSquare,
      color: 'from-mc-green to-mc-dark-green',
      bgColor: 'bg-mc-green/20',
      borderColor: 'border-mc-green',
      label: 'TEXT ANALYSIS'
    },
    voice: {
      icon: Mic,
      color: 'from-mc-blue to-mc-dark-blue',
      bgColor: 'bg-mc-blue/20',
      borderColor: 'border-mc-blue',
      label: 'VOICE ANALYSIS'
    },
    video: {
      icon: Video,
      color: 'from-mc-brown to-mc-dark-brown',
      bgColor: 'bg-mc-brown/20',
      borderColor: 'border-mc-brown',
      label: 'VIDEO ANALYSIS'
    }
  }

  const statusConfig = {
    locked: {
      icon: Lock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-300',
      label: 'LOCKED',
      buttonText: 'LOCKED',
      disabled: true
    },
    unlocked: {
      icon: ArrowRight,
      color: 'text-white',
      bgColor: `bg-gradient-to-r ${typeConfig[type].color}`,
      label: 'READY',
      buttonText: 'BEGIN',
      disabled: false
    },
    completed: {
      icon: CheckCircle,
      color: 'text-mc-green',
      bgColor: 'bg-mc-green/30',
      label: 'COMPLETED',
      buttonText: 'REVIEW',
      disabled: false
    }
  }

  const config = typeConfig[type]
  const statusInfo = statusConfig[status]
  const Icon = config.icon
  const StatusIcon = statusInfo.icon

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Step Number Badge */}
      <div className="absolute -top-4 -left-4 z-10">
        <div className="relative">
          {/* Badge Shadow */}
          <div className="absolute inset-0 bg-black translate-y-1 translate-x-1 rounded-full"></div>
          
          {/* Badge */}
          <div className={`
            relative w-12 h-12 rounded-full border-4 border-black
            flex items-center justify-center
            ${status === 'completed' ? 'bg-gradient-to-b from-mc-green to-mc-dark-green' :
              status === 'locked' ? 'bg-gradient-to-b from-gray-400 to-gray-600' :
              'bg-gradient-to-b from-mc-yellow to-#D4A017'}
          `}>
            <span className="font-minecraft-bold text-white text-xl">
              {step}
            </span>
            
            {/* Glow effect */}
            {status !== 'locked' && (
              <div className="absolute inset-0 rounded-full animate-pulse-glow"></div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Line */}
      {step > 1 && (
        <div className="absolute -top-4 left-8 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
      )}

      {/* Main Card */}
      <div className={`
        relative border-4 border-black rounded-lg
        ${config.bgColor}
        transition-all duration-300
        ${hover ? 'scale-105 shadow-2xl' : 'scale-100'}
        overflow-hidden
      `}>
        {/* Header */}
        <div className={`p-4 border-b-4 border-black ${statusInfo.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 border-2 ${config.borderColor} bg-white/10`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-minecraft-bold text-xl text-white">{title}</h3>
                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                </div>
                <span className="font-minecraft text-white/80 text-sm">
                  {config.label}
                </span>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1 border-2 border-black ${status === 'completed' ? 'bg-mc-green' : status === 'locked' ? 'bg-gray-500' : 'bg-mc-yellow'}`}>
              <span className="font-minecraft-bold text-black text-xs">
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-gray-800 mb-6">
            {description}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Time Estimate */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-2 border-black bg-gradient-to-b from-mc-blue to-mc-dark-blue flex items-center justify-center">
                  <span className="font-minecraft text-white text-xs">⏱️</span>
                </div>
                <div>
                  <div className="font-minecraft text-gray-600 text-xs">ESTIMATED TIME</div>
                  <div className="font-minecraft-bold text-gray-800">{estimatedTime}</div>
                </div>
              </div>
              
              {/* Progress Indicator */}
              {status === 'completed' && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-black bg-gradient-to-b from-mc-green to-mc-dark-green flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-minecraft text-gray-600 text-xs">STATUS</div>
                    <div className="font-minecraft-bold text-gray-800">COMPLETED</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Step Indicator */}
            <div className="text-right">
              <div className="font-minecraft text-gray-600 text-xs">STEP</div>
              <div className="font-minecraft-bold text-2xl text-gray-800">{step}/3</div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 border-2 border-black bg-black/20 flex items-center justify-center">
                <span className="text-xl">
                  {type === 'text' ? '📝' : type === 'voice' ? '🎤' : '📹'}
                </span>
              </div>
              <span className="font-minecraft text-gray-600 text-sm">
                {status === 'locked' ? 'Complete previous steps to unlock' : 'Ready to start'}
              </span>
            </div>
            
            <MinecraftButton
              onClick={onStart}
              variant={status === 'completed' ? 'success' : status === 'locked' ? 'secondary' : 'primary'}
              disabled={status === 'locked'}
              size="md"
              icon={status === 'completed' ? CheckCircle : ArrowRight}
              iconPosition="right"
            >
              {statusInfo.buttonText}
            </MinecraftButton>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Hover Glow */}
        {status !== 'locked' && hover && (
          <div className="absolute inset-0 border-2 border-white/30 animate-pulse pointer-events-none"></div>
        )}
      </div>
    </div>
  )
}