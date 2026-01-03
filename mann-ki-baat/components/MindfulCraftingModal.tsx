'use client'

import React, { useState } from 'react'
import { 
  Hammer, 
  Heart, 
  Target, 
  Clock, 
  Sparkles, 
  Package, 
  Grid3x3, 
  Box, 
  Layers 
} from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import MinecraftModal from '@/components/MinecraftModal'
import PixelArt from '@/components/PixelArt'
import { useSounds } from '@/lib/sounds'

interface MindfulCraftingModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

const MindfulCraftingModal: React.FC<MindfulCraftingModalProps> = ({
  isOpen,
  onClose,
  onStart
}) => {
  const { play } = useSounds()
  const [selectedItem, setSelectedItem] = useState<string>('mindful_table')

  const craftItems = [
    {
      id: 'mindful_table',
      name: 'Mindful Table',
      description: 'A crafting table for mindfulness exercises',
      icon: 'table',
      color: '#5B7C3A',
      materials: ['Focus ×3', 'Peace ×2', 'Patience ×1']
    },
    {
      id: 'calm_pickaxe',
      name: 'Calm Pickaxe',
      description: 'Tools for breaking down anxious thoughts',
      icon: 'pickaxe',
      color: '#7EC0EE',
      materials: ['Stones of Stability ×2', 'Wood of Wisdom ×3']
    },
    {
      id: 'peace_shovel',
      name: 'Peace Shovel',
      description: 'Dig deep into your emotions',
      icon: 'shovel',
      color: '#8B7355',
      materials: ['Self-awareness ×2', 'Acceptance ×3']
    },
    {
      id: 'serenity_sword',
      name: 'Serenity Sword',
      description: 'Cut through stress and worry',
      icon: 'sword',
      color: '#FF6B6B',
      materials: ['Courage ×2', 'Clarity ×2', 'Calm ×1']
    }
  ]

  const handleCraft = () => {
    play('craft')
    const item = craftItems.find(i => i.id === selectedItem)
    alert(`Crafting ${item?.name}... This item will help in your mindfulness journey!`)
  }

  const handleStartGame = () => {
    play('game_start')
    onStart()
    onClose()
  }
  
  return (
    <MinecraftModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mindful Crafting"
      type="info"
      confirmText="Start Crafting"
      onConfirm={handleStartGame}
      cancelText="Close"
      onCancel={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-black bg-gradient-to-b from-mc-green to-mc-dark-green">
            <Grid3x3 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-2xl text-gray-800">Craft Your Way to Mindfulness</h3>
            <p className="text-gray-600">Create virtual items while practicing mindfulness techniques</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-mc-blue" />
              <span className="font-minecraft text-sm text-gray-600">Duration</span>
            </div>
            <div className="font-minecraft-bold text-lg">15-20 min</div>
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
            <div className="font-minecraft-bold text-lg">Mindfulness</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-mc-yellow" />
              <span className="font-minecraft text-sm text-gray-600">Progress</span>
            </div>
            <div className="font-minecraft-bold text-lg">25%</div>
          </div>
        </div>

        {/* Crafting Interface */}
        <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-50 to-white">
          <h4 className="font-minecraft-bold text-xl mb-4 text-center">Select Item to Craft</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {craftItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  play('click')
                  setSelectedItem(item.id)
                }}
                className={`border-4 border-black p-4 transition-all duration-300 hover:scale-105 ${
                  selectedItem === item.id 
                    ? 'bg-gradient-to-b from-yellow-100 to-yellow-200 ring-4 ring-mc-yellow/50' 
                    : 'bg-gradient-to-b from-gray-100 to-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 h-16 border-4 border-black flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <PixelArt type={item.icon as any} size={32} />
                  </div>
                  <span className="font-minecraft-bold text-sm text-center">{item.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Item Details */}
          {(() => {
            const item = craftItems.find(i => i.id === selectedItem)
            return item && (
              <div className="border-4 border-black p-4 bg-gradient-to-r from-mc-green/10 to-mc-blue/10">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-20 h-20 border-4 border-black flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <PixelArt type={item.icon as any} size={40} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-minecraft-bold text-xl text-gray-800 mb-2">{item.name}</h5>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="mb-4">
                      <h6 className="font-minecraft-bold text-gray-700 mb-2">Required Materials:</h6>
                      <div className="flex flex-wrap gap-2">
                        {item.materials.map((material, idx) => (
                          <span 
                            key={idx}
                            className="border-2 border-black px-3 py-1 bg-gradient-to-b from-white to-gray-100 font-minecraft text-sm"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <MinecraftButton
                        onClick={handleCraft}
                        variant="success"
                        size="sm"
                        icon={Hammer}
                      >
                        Craft Item
                      </MinecraftButton>
                      <MinecraftButton
                        onClick={() => {
                          play('click')
                          alert('Guided meditation starting...')
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Start Meditation
                      </MinecraftButton>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Instructions */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h4 className="font-minecraft-bold text-xl mb-3 text-mc-blue">How to Play:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-mc-green" />
                <div className="font-minecraft-bold text-mc-green">1. Select an Item</div>
              </div>
              <p className="text-sm text-gray-600">Choose what you want to craft based on your current emotional state</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-mc-blue" /> {/* Changed from Cube to Layers */}
                <div className="font-minecraft-bold text-mc-blue">2. Gather Materials</div>
              </div>
              <p className="text-sm text-gray-600">Complete mindfulness exercises to collect crafting materials</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Hammer className="w-5 h-5 text-mc-yellow" />
                <div className="font-minecraft-bold text-mc-yellow">3. Craft & Reflect</div>
              </div>
              <p className="text-sm text-gray-600">Craft the item while practicing mindful breathing</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <h4 className="font-minecraft-bold text-xl mb-3 text-mc-green">Therapeutic Benefits:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Reduces Anxiety</div>
            </div>
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Improves Focus</div>
            </div>
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Mindfulness</div>
            </div>
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Emotional Awareness</div>
            </div>
          </div>
        </div>
      </div>
    </MinecraftModal>
  )
}

export default MindfulCraftingModal