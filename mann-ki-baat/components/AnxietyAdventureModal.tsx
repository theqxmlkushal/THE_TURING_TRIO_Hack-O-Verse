'use client'

import React, { useState } from 'react'
import { Compass, Mountain, Trees, Cloud, Shield, Heart, Zap } from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import MinecraftModal from '@/components/MinecraftModal'
import PixelArt from '@/components/PixelArt'
import { useSounds } from '@/lib/sounds'

interface AnxietyAdventureModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

const AnxietyAdventureModal: React.FC<AnxietyAdventureModalProps> = ({
  isOpen,
  onClose,
  onStart
}) => {
  const { play } = useSounds()
  const [selectedWorld, setSelectedWorld] = useState<string>('peaceful_forest')

  const worlds = [
    {
      id: 'peaceful_forest',
      name: 'Peaceful Forest',
      description: 'A calm forest with gentle creatures and soothing sounds',
      icon: 'trees',
      color: '#228B22',
      difficulty: 'Easy',
      challenges: ['Find 3 calming flowers', 'Listen to forest sounds', 'Practice deep breathing']
    },
    {
      id: 'serene_mountains',
      name: 'Serene Mountains',
      description: 'High peaks with panoramic views for perspective',
      icon: 'mountain',
      color: '#7EC0EE',
      difficulty: 'Medium',
      challenges: ['Climb to the summit', 'Meditate at sunrise', 'Watch clouds pass']
    },
    {
      id: 'calm_beach',
      name: 'Calm Beach',
      description: 'Gentle waves and warm sand for relaxation',
      icon: 'waves',
      color: '#1E90FF',
      difficulty: 'Easy',
      challenges: ['Walk along shore', 'Collect shells mindfully', 'Watch sunset']
    },
    {
      id: 'quiet_cave',
      name: 'Quiet Cave',
      description: 'Underground sanctuary for deep reflection',
      icon: 'cave',
      color: '#696969',
      difficulty: 'Hard',
      challenges: ['Find glowing crystals', 'Practice echo meditation', 'Face fears']
    }
  ]

  const anxietyLevels = [
    { level: 'Low', color: '#4ADE80', description: 'Mild anxiety' },
    { level: 'Medium', color: '#FBBF24', description: 'Moderate anxiety' },
    { level: 'High', color: '#F87171', description: 'High anxiety' },
    { level: 'Panic', color: '#DC2626', description: 'Panic attack' }
  ]

  const handleStartGame = () => {
    play('game_start')
    onStart()
    onClose()
  }

  const handleAnxietyCheck = (level: string) => {
    play('click')
    alert(`Setting anxiety level to ${level}. The game will adjust difficulty accordingly.`)
  }

  return (
    <MinecraftModal
      isOpen={isOpen}
      onClose={onClose}
      title="Anxiety Adventure"
      type="warning"
      confirmText="Begin Adventure"
      onConfirm={handleStartGame}
      cancelText="Close"
      onCancel={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-black bg-gradient-to-b from-mc-blue to-blue-700">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-2xl text-gray-800">Navigate Through Calming Worlds</h3>
            <p className="text-gray-600">Manage anxiety by exploring peaceful Minecraft environments</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-mc-yellow" />
              <span className="font-minecraft text-sm text-gray-600">Duration</span>
            </div>
            <div className="font-minecraft-bold text-lg">20-30 min</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-mc-blue" />
              <span className="font-minecraft text-sm text-gray-600">Difficulty</span>
            </div>
            <div className="font-minecraft-bold text-lg text-orange-500">Medium</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-minecraft text-sm text-gray-600">Focus</span>
            </div>
            <div className="font-minecraft-bold text-lg">Anxiety Relief</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="w-4 h-4 text-gray-400" />
              <span className="font-minecraft text-sm text-gray-600">Progress</span>
            </div>
            <div className="font-minecraft-bold text-lg">0%</div>
          </div>
        </div>

        {/* Anxiety Level Selector */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-red-50 to-orange-50">
          <h4 className="font-minecraft-bold text-xl mb-4 text-center">Select Your Anxiety Level</h4>
          <p className="text-center text-gray-600 mb-4">This helps customize the adventure for your needs</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {anxietyLevels.map((level) => (
              <button
                key={level.level}
                onClick={() => handleAnxietyCheck(level.level)}
                className="border-4 border-black p-4 bg-gradient-to-b from-gray-100 to-white hover:scale-105 transition-transform duration-300"
                style={{ borderColor: level.color }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-black"
                    style={{ backgroundColor: level.color }}
                  ></div>
                  <span className="font-minecraft-bold">{level.level}</span>
                  <span className="font-minecraft text-xs text-gray-600 text-center">{level.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* World Selection */}
        <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-50 to-white">
          <h4 className="font-minecraft-bold text-xl mb-4 text-center">Choose Your Adventure World</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {worlds.map((world) => (
              <button
                key={world.id}
                onClick={() => {
                  play('click')
                  setSelectedWorld(world.id)
                }}
                className={`border-4 border-black p-4 transition-all duration-300 hover:scale-[1.02] ${
                  selectedWorld === world.id 
                    ? 'bg-gradient-to-b from-blue-50 to-cyan-50 ring-4 ring-mc-blue/50' 
                    : 'bg-gradient-to-b from-gray-100 to-white'
                }`}
                style={{ borderColor: world.color }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-20 h-20 border-4 border-black flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: world.color }}
                  >
                    <PixelArt type={world.icon as any} size={40} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-minecraft-bold text-lg text-gray-800">{world.name}</h5>
                      <span className={`font-minecraft-bold px-2 py-1 border-2 border-black ${
                        world.difficulty === 'Easy' ? 'bg-green-100' :
                        world.difficulty === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {world.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{world.description}</p>
                    
                    <div>
                      <h6 className="font-minecraft-bold text-gray-700 mb-1">Challenges:</h6>
                      <ul className="space-y-1">
                        {world.challenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black"></div>
                            <span className="font-minecraft text-sm text-gray-600">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coping Strategies */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <h4 className="font-minecraft-bold text-xl mb-3 text-purple-600">Coping Strategies Available:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 border-2 border-black flex items-center justify-center">
                  <span className="font-minecraft-bold text-white">1</span>
                </div>
                <h5 className="font-minecraft-bold text-gray-800">Grounding Exercises</h5>
              </div>
              <p className="text-sm text-gray-600">5-4-3-2-1 technique available anytime during adventure</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 border-2 border-black flex items-center justify-center">
                  <span className="font-minecraft-bold text-white">2</span>
                </div>
                <h5 className="font-minecraft-bold text-gray-800">Breathing Guide</h5>
              </div>
              <p className="text-sm text-gray-600">Visual breathing aids to calm anxiety in real-time</p>
            </div>
          </div>
        </div>

        {/* Safety Features */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <h4 className="font-minecraft-bold text-xl mb-3 text-mc-green">Safety Features:</h4>
          <div className="flex flex-wrap gap-3">
            <span className="border-2 border-black px-3 py-1 bg-white font-minecraft">Pause Anytime</span>
            <span className="border-2 border-black px-3 py-1 bg-white font-minecraft">Emergency Exit</span>
            <span className="border-2 border-black px-3 py-1 bg-white font-minecraft">Progress Save</span>
            <span className="border-2 border-black px-3 py-1 bg-white font-minecraft">Calm Button</span>
          </div>
        </div>
      </div>
    </MinecraftModal>
  )
}

export default AnxietyAdventureModal