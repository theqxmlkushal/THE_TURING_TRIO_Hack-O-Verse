'use client'

import React, { useState, useEffect } from 'react'
import { 
  Wind, 
  Clock, 
  Target, 
  Heart, 
  Sparkles, 
  Square, 
  Play, 
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import MinecraftModal from '@/components/MinecraftModal'
import PixelArt from '@/components/PixelArt'
import { useSounds } from '@/lib/sounds'

interface SquareBreathingModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

const SquareBreathingModal: React.FC<SquareBreathingModalProps> = ({
  isOpen,
  onClose,
  onStart
}) => {
  const { play } = useSounds()
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale')
  const [timeRemaining, setTimeRemaining] = useState(4)
  const [cycleCount, setCycleCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const steps = {
    inhale: { 
      name: 'Breathe In', 
      color: '#4A90E2',
      instruction: 'Inhale slowly through your nose',
      duration: 4
    },
    hold1: { 
      name: 'Hold', 
      color: '#7EC0EE',
      instruction: 'Hold your breath',
      duration: 4
    },
    exhale: { 
      name: 'Breathe Out', 
      color: '#228B22',
      instruction: 'Exhale slowly through your mouth',
      duration: 4
    },
    hold2: { 
      name: 'Hold', 
      color: '#98FB98',
      instruction: 'Pause before next breath',
      duration: 4
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next step
            const stepOrder: Array<'inhale' | 'hold1' | 'exhale' | 'hold2'> = ['inhale', 'hold1', 'exhale', 'hold2']
            const currentIndex = stepOrder.indexOf(currentStep)
            const nextIndex = (currentIndex + 1) % 4
            const nextStep = stepOrder[nextIndex]
            
            // Play sound for step change
            if (soundEnabled) play('notification')
            
            // Count cycles
            if (nextStep === 'inhale') {
              setCycleCount(prev => prev + 1)
            }
            
            setCurrentStep(nextStep)
            return steps[nextStep].duration
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, timeRemaining, currentStep, soundEnabled, play])

  const handleStartStop = () => {
    // play(isActive ? 'pause' : 'play')
    setIsActive(!isActive)
  }

  const handleReset = () => {
    play('click')
    setIsActive(false)
    setCurrentStep('inhale')
    setTimeRemaining(4)
    setCycleCount(0)
  }

  const handleStartExercise = () => {
    play('game_start')
    onStart()
    setIsActive(true)
  }

  const toggleSound = () => {
    play('click')
    setSoundEnabled(!soundEnabled)
  }

  const renderBreathingVisualization = () => {
    const step = steps[currentStep]
    const progress = ((steps[currentStep].duration - timeRemaining) / steps[currentStep].duration) * 100
    
    return (
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Square */}
        <div className="relative w-64 h-64">
          {/* Outer square */}
          <div className="absolute inset-0 border-8 border-gray-400 border-dashed"></div>
          
          {/* Animated square */}
          <div 
            className="absolute inset-8 border-8 transition-all duration-1000 ease-in-out"
            style={{ 
              borderColor: step.color,
              opacity: isActive ? 1 : 0.5,
              transform: isActive ? 'scale(1)' : 'scale(0.8)'
            }}
          >
            {/* Progress indicator */}
            <div 
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Center circle */}
          <div className="absolute inset-16 border-4 border-black rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="font-minecraft-bold text-3xl" style={{ color: step.color }}>
                {timeRemaining}
              </div>
              <div className="font-minecraft text-gray-600">{step.name}</div>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(steps).map(([key, stepData]) => (
            <div
              key={key}
              className={`p-2 border-4 border-black text-center transition-all ${
                currentStep === key 
                  ? 'bg-gradient-to-b from-gray-100 to-white scale-105' 
                  : 'bg-gray-100 opacity-60'
              }`}
              style={{ borderColor: stepData.color }}
            >
              <div className="font-minecraft-bold text-sm" style={{ color: stepData.color }}>
                {stepData.name}
              </div>
              <div className="font-minecraft text-xs text-gray-600">{stepData.duration}s</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <MinecraftModal
      isOpen={isOpen}
      onClose={onClose}
      title="Square Breathing"
      type="info"
      confirmText="Start Exercise"
      onConfirm={handleStartExercise}
      cancelText="Close"
      onCancel={onClose}
      size="xl"
      maxHeight="90vh"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-black bg-gradient-to-b from-blue-500 to-blue-700">
            <Wind className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-2xl text-gray-800">4-4-4-4 Breathing Technique</h3>
            <p className="text-gray-600">Calm your nervous system with this powerful breathing exercise</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-mc-blue" />
              <span className="font-minecraft text-sm text-gray-600">Duration</span>
            </div>
            <div className="font-minecraft-bold text-lg">5-10 min</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-mc-green" />
              <span className="font-minecraft text-sm text-gray-600">Difficulty</span>
            </div>
            <div className="font-minecraft-bold text-lg text-mc-green">Easy</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-minecraft text-sm text-gray-600">Focus</span>
            </div>
            <div className="font-minecraft-bold text-lg">Breathing</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-mc-yellow" />
              <span className="font-minecraft text-sm text-gray-600">Progress</span>
            </div>
            <div className="font-minecraft-bold text-lg">50%</div>
          </div>
        </div>

        {/* Breathing Visualization */}
        <div className="border-4 border-black p-6 bg-gradient-to-b from-blue-50 to-cyan-50">
          <h4 className="font-minecraft-bold text-xl mb-4 text-center text-blue-600">
            Breathing Guide
          </h4>
          
          {renderBreathingVisualization()}
          
          {/* Current Instruction */}
          <div className="mt-6 p-4 border-4 border-black bg-white text-center">
            <div className="font-minecraft-bold text-lg mb-2" style={{ color: steps[currentStep].color }}>
              {steps[currentStep].instruction}
            </div>
            <div className="text-gray-600">
              Follow the square pattern: 4 seconds each side
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-100 to-white">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="flex gap-3">
              <MinecraftButton
                onClick={handleStartStop}
                variant={isActive ? "warning" : "success"}
                size="md"
                icon={isActive ? Pause : Play}
              >
                {isActive ? 'Pause' : 'Start'}
              </MinecraftButton>
              
              <MinecraftButton
                onClick={handleReset}
                variant="secondary"
                size="md"
                icon={RotateCcw}
              >
                Reset
              </MinecraftButton>
            </div>
            
            <div className="flex items-center gap-3">
              <MinecraftButton
                onClick={toggleSound}
                variant={soundEnabled ? "primary" : "secondary"}
                size="sm"
                icon={Volume2}
              >
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </MinecraftButton>
              
              <div className="border-2 border-black p-2 bg-gradient-to-b from-yellow-100 to-yellow-200">
                <div className="font-minecraft-bold">Cycles: {cycleCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-4 border-black p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <h4 className="font-minecraft-bold text-lg mb-3 text-green-600">How It Works:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 mt-2"></div>
                <span className="font-minecraft text-gray-700">Inhale for 4 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 mt-2"></div>
                <span className="font-minecraft text-gray-700">Hold for 4 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 mt-2"></div>
                <span className="font-minecraft text-gray-700">Exhale for 4 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 mt-2"></div>
                <span className="font-minecraft text-gray-700">Hold for 4 seconds</span>
              </li>
            </ul>
          </div>
          
          <div className="border-4 border-black p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
            <h4 className="font-minecraft-bold text-lg mb-3 text-blue-600">Benefits:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Reduces Stress</div>
              </div>
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Improves Focus</div>
              </div>
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Calms Anxiety</div>
              </div>
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Better Sleep</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <h4 className="font-minecraft-bold text-lg mb-3 text-purple-600">Tips for Success:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border-2 border-black p-3 bg-white">
              <div className="font-minecraft-bold text-mc-green mb-1">Find a Quiet Space</div>
              <p className="text-sm text-gray-600">Minimize distractions for better focus</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="font-minecraft-bold text-mc-blue mb-1">Sit Comfortably</div>
              <p className="text-sm text-gray-600">Keep your back straight and relaxed</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="font-minecraft-bold text-mc-yellow mb-1">Daily Practice</div>
              <p className="text-sm text-gray-600">Just 5 minutes daily makes a difference</p>
            </div>
          </div>
        </div>
      </div>
    </MinecraftModal>
  )
}

export default SquareBreathingModal