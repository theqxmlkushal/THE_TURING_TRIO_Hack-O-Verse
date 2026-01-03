'use client'

import React, { useState, useEffect } from 'react'
import { 
  TreePine as Tree, 
  Eye, 
  Ear, 
  Hand, 
  Cone as Nose, 
  Heart,
  Clock, 
  Target, 
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle
} from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import MinecraftModal from '@/components/MinecraftModal'
import PixelArt from '@/components/PixelArt'
import { useSounds } from '@/lib/sounds'

interface GroundingExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

const GroundingExerciseModal: React.FC<GroundingExerciseModalProps> = ({
  isOpen,
  onClose,
  onStart
}) => {
  const { play } = useSounds()
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [completedItems, setCompletedItems] = useState<number[]>([])
  const [userInput, setUserInput] = useState<string[]>(['', '', '', '', ''])

  const steps = [
    {
      id: 0,
      sense: 'See',
      icon: Eye,
      color: '#4A90E2',
      instruction: 'Look around and name 5 things you can SEE',
      examples: ['A tree', 'Your hands', 'A window', 'A book', 'A cloud'],
      placeholder: 'List 5 things you see...'
    },
    {
      id: 1,
      sense: 'Touch',
      icon: Hand,
      color: '#8B7355',
      instruction: 'Notice 4 things you can FEEL or TOUCH',
      examples: ['The floor under your feet', 'Your clothing', 'The chair', 'A breeze'],
      placeholder: 'List 4 things you feel...'
    },
    {
      id: 2,
      sense: 'Hear',
      icon: Ear,
      color: '#7EC0EE',
      instruction: 'Listen for 3 things you can HEAR',
      examples: ['Birds chirping', 'Traffic sounds', 'Your breathing'],
      placeholder: 'List 3 things you hear...'
    },
    {
      id: 3,
      sense: 'Smell',
      icon: Nose,
      color: '#9370DB',
      instruction: 'Identify 2 things you can SMELL',
      examples: ['Fresh air', 'Coffee', 'Perfume'],
      placeholder: 'List 2 things you smell...'
    },
    {
      id: 4,
      sense: 'Taste',
      icon: Heart,
      color: '#FF6B6B',
      instruction: 'Find 1 thing you can TASTE or remember tasting',
      examples: ['Mint flavor', 'Water', 'Recent meal'],
      placeholder: 'List 1 thing you taste...'
    }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && currentStep < steps.length) {
      interval = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          play('notification')
          setCurrentStep(prev => prev + 1)
        } else {
          setIsActive(false)
          play('achievement')
        }
      }, 60000) // 1 minute per step
    }

    return () => clearTimeout(interval)
  }, [isActive, currentStep, play])

  const handleStartExercise = () => {
    play('game_start')
    onStart()
    setIsActive(true)
    setCurrentStep(0)
    setCompletedItems([])
    setUserInput(['', '', '', '', ''])
  }

  const handleItemComplete = (index: number) => {
    play('select')
    if (userInput[index].trim()) {
      if (!completedItems.includes(index)) {
        setCompletedItems(prev => [...prev, index])
      }
    }
  }

  const handleReset = () => {
    play('click')
    setIsActive(false)
    setCurrentStep(0)
    setCompletedItems([])
    setUserInput(['', '', '', '', ''])
  }

  const currentStepData = steps[currentStep]

  return (
    <MinecraftModal
      isOpen={isOpen}
      onClose={onClose}
      title="Grounding 5-4-3-2-1"
      type="success"
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
          <div className="p-3 border-4 border-black bg-gradient-to-b from-green-600 to-green-800">
            <Tree className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-2xl text-gray-800">Sensory Grounding Exercise</h3>
            <p className="text-gray-600">Connect with the present moment through your senses</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-mc-blue" />
              <span className="font-minecraft text-sm text-gray-600">Duration</span>
            </div>
            <div className="font-minecraft-bold text-lg">8-12 min</div>
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
            <div className="font-minecraft-bold text-lg">Grounding</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-mc-yellow" />
              <span className="font-minecraft text-sm text-gray-600">Progress</span>
            </div>
            <div className="font-minecraft-bold text-lg">100%</div>
          </div>
        </div>

        {/* Current Step */}
        <div 
          className="border-4 border-black p-6 bg-gradient-to-b from-gray-50 to-white"
          style={{ borderColor: currentStepData.color }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 border-4 border-black"
                style={{ backgroundColor: currentStepData.color }}
              >
                {React.createElement(currentStepData.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <div>
                <h4 className="font-minecraft-bold text-xl" style={{ color: currentStepData.color }}>
                  {currentStepData.sense}: 5-4-3-2-1
                </h4>
                <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            
            {isActive && (
              <div className="border-4 border-black p-2 bg-gradient-to-b from-yellow-100 to-yellow-200">
                <div className="font-minecraft-bold">Time: 1:00</div>
              </div>
            )}
          </div>

          {/* Instruction */}
          <div className="mb-6 p-4 border-4 border-black bg-white">
            <h5 className="font-minecraft-bold text-lg mb-2 text-gray-800">
              {currentStepData.instruction}
            </h5>
            <div className="flex flex-wrap gap-2 mt-3">
              {currentStepData.examples.map((example, idx) => (
                <span 
                  key={idx}
                  className="border-2 border-gray-300 px-3 py-1 bg-gray-50 font-minecraft text-sm"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <textarea
              value={userInput[currentStep]}
              onChange={(e) => {
                const newInput = [...userInput]
                newInput[currentStep] = e.target.value
                setUserInput(newInput)
              }}
              placeholder={currentStepData.placeholder}
              className="w-full h-32 border-4 border-black p-4 font-minecraft resize-none"
              disabled={completedItems.includes(currentStep)}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {completedItems.includes(currentStep) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-minecraft-bold">Completed!</span>
                  </div>
                ) : (
                  <span className="font-minecraft text-gray-600">
                    Press Enter or click Check when done
                  </span>
                )}
              </div>
              
              <MinecraftButton
                onClick={() => handleItemComplete(currentStep)}
                variant="success"
                size="sm"
                disabled={!userInput[currentStep].trim() || completedItems.includes(currentStep)}
              >
                {completedItems.includes(currentStep) ? 'Completed' : 'Check ✓'}
              </MinecraftButton>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-green-50 to-blue-50">
          <h4 className="font-minecraft-bold text-lg mb-4 text-center">Progress</h4>
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  if (!isActive) {
                    play('click')
                    setCurrentStep(index)
                  }
                }}
                className={`border-4 border-black p-3 transition-all ${
                  currentStep === index 
                    ? 'scale-105 ring-4 ring-yellow-300' 
                    : ''
                } ${
                  completedItems.includes(index)
                    ? 'bg-gradient-to-b from-green-100 to-green-200'
                    : 'bg-gradient-to-b from-gray-100 to-white'
                }`}
                style={{ borderColor: step.color }}
                disabled={isActive}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">{5 - index}</div>
                  <div className="font-minecraft-bold text-sm">{step.sense}</div>
                  {completedItems.includes(index) && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-100 to-white">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3">
              <MinecraftButton
                onClick={handleStartExercise}
                variant={isActive ? "warning" : "success"}
                size="md"
                icon={isActive ? Pause : Play}
                disabled={isActive}
              >
                {isActive ? 'In Progress...' : 'Start Exercise'}
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
            
            <div className="border-2 border-black p-3 bg-gradient-to-b from-yellow-100 to-yellow-200">
              <div className="font-minecraft-bold">
                Completed: {completedItems.length} of {steps.length}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-4 border-black p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
            <h4 className="font-minecraft-bold text-lg mb-3 text-blue-600">Why This Works:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 mt-2"></div>
                <span className="font-minecraft text-gray-700">Anchors you to the present moment</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 mt-2"></div>
                <span className="font-minecraft text-gray-700">Reduces anxiety and panic</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-600 mt-2"></div>
                <span className="font-minecraft text-gray-700">Engages all your senses</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-600 mt-2"></div>
                <span className="font-minecraft text-gray-700">Creates mental space from worries</span>
              </li>
            </ul>
          </div>
          
          <div className="border-4 border-black p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <h4 className="font-minecraft-bold text-lg mb-3 text-green-600">When to Use:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Anxiety Attack</div>
              </div>
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Stress Relief</div>
              </div>
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Panic Moments</div>
              </div>
              <div className="border-2 border-black p-2 bg-white text-center">
                <div className="font-minecraft-bold text-sm">Daily Practice</div>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Visualization */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h4 className="font-minecraft-bold text-lg mb-3 text-emerald-600">Virtual Nature Environment</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-black p-3 bg-white text-center">
              <PixelArt type="tree" size={40} />
              <div className="font-minecraft-bold text-sm mt-2">Peaceful Forest</div>
            </div>
            <div className="border-2 border-black p-3 bg-white text-center">
              <PixelArt type="brain" size={40} />
              <div className="font-minecraft-bold text-sm mt-2">Calm Lake</div>
            </div>
            <div className="border-2 border-black p-3 bg-white text-center">
              <PixelArt type="sun" size={40} />
              <div className="font-minecraft-bold text-sm mt-2">Mountain View</div>
            </div>
            <div className="border-2 border-black p-3 bg-white text-center">
              <PixelArt type="moon" size={40} />
              <div className="font-minecraft-bold text-sm mt-2">Starry Night</div>
            </div>
          </div>
        </div>
      </div>
    </MinecraftModal>
  )
}

export default GroundingExerciseModal