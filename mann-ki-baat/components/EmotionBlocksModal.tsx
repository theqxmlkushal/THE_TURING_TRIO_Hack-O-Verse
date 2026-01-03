'use client'

import React, { useState } from 'react'
import { Blocks, Heart, Brain, Smile, Frown, Meh, Award } from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import MinecraftModal from '@/components/MinecraftModal'
import PixelArt from '@/components/PixelArt'
import { useSounds } from '@/lib/sounds'

interface EmotionBlocksModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

const EmotionBlocksModal: React.FC<EmotionBlocksModalProps> = ({
  isOpen,
  onClose,
  onStart
}) => {
  const { play } = useSounds()
  const [selectedEmotion, setSelectedEmotion] = useState<string>('joy')
  const [intensity, setIntensity] = useState<number>(3)

  const emotions = [
    {
      id: 'joy',
      name: 'Joy',
      color: '#FFD700',
      icon: 'smile',
      description: 'Feeling happy and content',
      triggers: ['Achievement', 'Connection', 'Fun'],
      coping: ['Share it', 'Savor it', 'Express gratitude']
    },
    {
      id: 'sadness',
      name: 'Sadness',
      color: '#7EC0EE',
      icon: 'frown',
      description: 'Feeling down or blue',
      triggers: ['Loss', 'Disappointment', 'Loneliness'],
      coping: ['Cry if needed', 'Reach out', 'Self-care']
    },
    {
      id: 'anger',
      name: 'Anger',
      color: '#FF6B6B',
      icon: 'angry',
      description: 'Feeling frustrated or mad',
      triggers: ['Injustice', 'Boundary crossing', 'Frustration'],
      coping: ['Breathe', 'Walk away', 'Channel energy']
    },
    {
      id: 'fear',
      name: 'Fear',
      color: '#9370DB',
      icon: 'scared',
      description: 'Feeling anxious or scared',
      triggers: ['Uncertainty', 'Threat', 'New situations'],
      coping: ['Grounding', 'Reality check', 'Small steps']
    },
    {
      id: 'neutral',
      name: 'Neutral',
      color: '#A0A0A0',
      icon: 'meh',
      description: 'Feeling balanced or okay',
      triggers: ['Stability', 'Routine', 'Calm'],
      coping: ['Maintain balance', 'Check in', 'Mindfulness']
    },
    {
      id: 'love',
      name: 'Love',
      color: '#FF69B4',
      icon: 'heart',
      description: 'Feeling connected and caring',
      triggers: ['Connection', 'Appreciation', 'Kindness'],
      coping: ['Express it', 'Receive it', 'Share love']
    }
  ]

  const intensityLevels = [
    { level: 1, label: 'Very Mild', color: '#4ADE80' },
    { level: 2, label: 'Mild', color: '#22C55E' },
    { level: 3, label: 'Moderate', color: '#FBBF24' },
    { level: 4, label: 'Strong', color: '#F97316' },
    { level: 5, label: 'Intense', color: '#DC2626' }
  ]

  const handleBuildStructure = () => {
    play('build')
    const emotion = emotions.find(e => e.id === selectedEmotion)
    alert(`Building structure for ${emotion?.name} at intensity ${intensity}...`)
  }

  const handleStartGame = () => {
    play('game_start')
    onStart()
    onClose()
  }

  const handleEmotionJournal = () => {
    play('click')
    const emotion = emotions.find(e => e.id === selectedEmotion)
    const intensityLevel = intensityLevels.find(l => l.level === intensity)
    alert(`Journal entry created: ${emotion?.name} at ${intensityLevel?.label} intensity`)
  }

  return (
    <MinecraftModal
      isOpen={isOpen}
      onClose={onClose}
      title="Emotion Blocks"
      type="info"
      confirmText="Start Building"
      onConfirm={handleStartGame}
      cancelText="Close"
      onCancel={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-black bg-gradient-to-b from-purple-600 to-purple-800">
            <Blocks className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-2xl text-gray-800">Build with Your Emotions</h3>
            <p className="text-gray-600">Identify and organize emotions using block-building mechanics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-mc-yellow" />
              <span className="font-minecraft text-sm text-gray-600">Duration</span>
            </div>
            <div className="font-minecraft-bold text-lg">10-15 min</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-minecraft text-sm text-gray-600">Difficulty</span>
            </div>
            <div className="font-minecraft-bold text-lg text-mc-green">Easy</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-minecraft text-sm text-gray-600">Focus</span>
            </div>
            <div className="font-minecraft-bold text-lg">Emotional IQ</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Smile className="w-4 h-4 text-green-500" />
              <span className="font-minecraft text-sm text-gray-600">Progress</span>
            </div>
            <div className="font-minecraft-bold text-lg">75%</div>
          </div>
        </div>

        {/* Emotion Selection */}
        <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-50 to-white">
          <h4 className="font-minecraft-bold text-xl mb-4 text-center">Select Your Current Emotion</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {emotions.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => {
                  play('click')
                  setSelectedEmotion(emotion.id)
                }}
                className={`border-4 border-black p-3 transition-all duration-300 hover:scale-105 ${
                  selectedEmotion === emotion.id 
                    ? 'ring-4 ring-purple-300' 
                    : ''
                }`}
                style={{ backgroundColor: emotion.color }}
              >
                <div className="flex flex-col items-center gap-2">
                  {emotion.icon === 'smile' && <Smile className="w-8 h-8 text-white" />}
                  {emotion.icon === 'frown' && <Frown className="w-8 h-8 text-white" />}
                  {emotion.icon === 'angry' && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <span className="text-2xl">😠</span>
                    </div>
                  )}
                  {emotion.icon === 'scared' && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <span className="text-2xl">😨</span>
                    </div>
                  )}
                  {emotion.icon === 'meh' && <Meh className="w-8 h-8 text-white" />}
                  {emotion.icon === 'heart' && <Heart className="w-8 h-8 text-white" />}
                  
                  <span className="font-minecraft-bold text-white text-center">{emotion.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Emotion Details */}
          {(() => {
            const emotion = emotions.find(e => e.id === selectedEmotion)
            return emotion && (
              <div 
                className="border-4 border-black p-4"
                style={{ backgroundColor: `${emotion.color}20` }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-24 h-24 border-4 border-black flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: emotion.color }}
                  >
                    {emotion.icon === 'smile' && <Smile className="w-12 h-12 text-white" />}
                    {emotion.icon === 'frown' && <Frown className="w-12 h-12 text-white" />}
                    {emotion.icon === 'angry' && (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <span className="text-4xl">😠</span>
                      </div>
                    )}
                    {emotion.icon === 'scared' && (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <span className="text-4xl">😨</span>
                      </div>
                    )}
                    {emotion.icon === 'meh' && <Meh className="w-12 h-12 text-white" />}
                    {emotion.icon === 'heart' && <Heart className="w-12 h-12 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-minecraft-bold text-2xl text-gray-800">{emotion.name}</h5>
                      <span className="font-minecraft-bold px-3 py-1 border-2 border-black bg-white">
                        {emotion.description}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h6 className="font-minecraft-bold text-gray-700 mb-2">Common Triggers:</h6>
                        <ul className="space-y-1">
                          {emotion.triggers.map((trigger, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-black"></div>
                              <span className="font-minecraft text-sm text-gray-700">{trigger}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-minecraft-bold text-gray-700 mb-2">Healthy Coping:</h6>
                        <ul className="space-y-1">
                          {emotion.coping.map((cope, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-black"></div>
                              <span className="font-minecraft text-sm text-gray-700">{cope}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Intensity Slider */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-gray-50 to-white">
          <h4 className="font-minecraft-bold text-xl mb-4 text-center">Emotion Intensity Level</h4>
          <p className="text-center text-gray-600 mb-4">How strong is this feeling right now?</p>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {intensityLevels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => {
                    play('click')
                    setIntensity(level.level)
                  }}
                  className={`w-12 h-12 border-4 border-black flex items-center justify-center font-minecraft-bold transition-all duration-300 ${
                    intensity === level.level ? 'scale-110 ring-4 ring-yellow-300' : ''
                  }`}
                  style={{ backgroundColor: level.color }}
                >
                  {level.level}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between px-2">
              {intensityLevels.map((level) => (
                <span key={level.level} className="font-minecraft text-sm text-gray-600">
                  {level.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <MinecraftButton
              onClick={handleBuildStructure}
              variant="success"
              size="md"
              icon={Blocks}
            >
              Build Emotion Structure
            </MinecraftButton>
            <MinecraftButton
              onClick={handleEmotionJournal}
              variant="secondary"
              size="md"
            >
              Journal Entry
            </MinecraftButton>
          </div>
        </div>

        {/* Building Examples */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h4 className="font-minecraft-bold text-xl mb-3 text-purple-600">Structure Examples:</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-black p-3 bg-white text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-yellow-400 border-4 border-black"></div>
              <div className="font-minecraft-bold">Joy Tower</div>
            </div>
            <div className="border-2 border-black p-3 bg-white text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-400 border-4 border-black"></div>
              <div className="font-minecraft-bold">Sadness Pool</div>
            </div>
            <div className="border-2 border-black p-3 bg-white text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-red-400 border-4 border-black"></div>
              <div className="font-minecraft-bold">Anger Wall</div>
            </div>
          </div>
        </div>
      </div>
    </MinecraftModal>
  )
}

export default EmotionBlocksModal