'use client'

import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Blocks, 
  Timer, 
  Target, 
  Sparkles,
  Clock, 
  Heart,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Zap,
  CheckCircle
} from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import MinecraftModal from '@/components/MinecraftModal'
import PixelArt from '@/components/PixelArt'
import { useSounds } from '@/lib/sounds'

interface FocusBuildingModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

const FocusBuildingModal: React.FC<FocusBuildingModalProps> = ({
  isOpen,
  onClose,
  onStart
}) => {
  const { play } = useSounds()
  const [isActive, setIsActive] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [score, setScore] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [gameGrid, setGameGrid] = useState<(number | null)[][]>([])
  const [selectedBlock, setSelectedBlock] = useState<{row: number, col: number} | null>(null)
  const [targetStructure, setTargetStructure] = useState<number[][]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const levels = [
    {
      level: 1,
      name: 'Basic Focus',
      gridSize: 4,
      targetPattern: 'simple',
      timeLimit: 300, // 5 minutes
      description: 'Build a simple wall structure'
    },
    {
      level: 2,
      name: 'Advanced Focus',
      gridSize: 6,
      targetPattern: 'complex',
      timeLimit: 420, // 7 minutes
      description: 'Create a detailed tower'
    },
    {
      level: 3,
      name: 'Master Focus',
      gridSize: 8,
      targetPattern: 'intricate',
      timeLimit: 600, // 10 minutes
      description: 'Construct an elaborate castle'
    }
  ]

  const blockTypes = [
    { id: 1, name: 'Dirt', color: '#8B7355', icon: 'dirt' },
    { id: 2, name: 'Stone', color: '#7F7F7F', icon: 'stone' },
    { id: 3, name: 'Wood', color: '#A0522D', icon: 'wood' },
    { id: 4, name: 'Brick', color: '#B22222', icon: 'brick' },
    { id: 5, name: 'Glass', color: '#87CEEB', icon: 'glass' }
  ]

  // Initialize game
  const initializeGame = (levelIndex: number) => {
    const level = levels[levelIndex]
    const size = level.gridSize
    
    // Create empty grid
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(null))
    setGameGrid(newGrid)
    
    // Create target structure
    const target = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => 
        Math.floor(Math.random() * blockTypes.length) + 1
      )
    )
    setTargetStructure(target)
    
    // Reset states
    setSelectedBlock(null)
    setIsCompleted(false)
    setTimeElapsed(0)
    setScore(0)
  }

  useEffect(() => {
    if (isOpen) {
      initializeGame(currentLevel - 1)
    }
  }, [isOpen, currentLevel])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          const currentLevelData = levels[currentLevel - 1]
          
          // Check if time limit reached
          if (newTime >= currentLevelData.timeLimit) {
            setIsActive(false)
            play('error')
            return prev
          }
          
          // Update score based on time
          if (newTime % 30 === 0) {
            setScore(prevScore => prevScore + 10)
          }
          
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, isCompleted, currentLevel, play])

  const handleBlockClick = (row: number, col: number) => {
    if (!isActive || isCompleted) return
    
    play('click')
    setSelectedBlock({ row, col })
  }

  const handleBlockPlace = (blockId: number) => {
    if (!selectedBlock || !isActive || isCompleted) return
    
    const { row, col } = selectedBlock
    const newGrid = [...gameGrid]
    newGrid[row][col] = blockId
    setGameGrid(newGrid)
    
    play('build')
    
    // Check if correct
    if (targetStructure[row][col] === blockId) {
      setScore(prev => prev + 50)
    } else {
      setScore(prev => Math.max(0, prev - 10))
    }
    
    // Check if structure is complete
    checkCompletion()
  }

  const checkCompletion = () => {
    const isComplete = gameGrid.every((row, rIndex) =>
      row.every((cell, cIndex) => 
        cell === targetStructure[rIndex][cIndex]
      )
    )
    
    if (isComplete) {
      setIsCompleted(true)
      setIsActive(false)
      play('achievement')
      setScore(prev => prev + 1000) // Completion bonus
    }
  }

  const handleStartGame = () => {
    play('game_start')
    onStart()
    setIsActive(true)
    setTimeElapsed(0)
  }

  const handleReset = () => {
    play('click')
    initializeGame(currentLevel - 1)
    setIsActive(false)
  }

  const handleLevelSelect = (level: number) => {
    if (!isActive) {
      play('select')
      setCurrentLevel(level)
      initializeGame(level - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentLevelData = levels[currentLevel - 1]

  return (
    <MinecraftModal
      isOpen={isOpen}
      onClose={onClose}
      title="Focus Building"
      type="warning"
      confirmText="Start Building"
      onConfirm={handleStartGame}
      cancelText="Close"
      onCancel={onClose}
      size="xl"
      maxHeight="90vh"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-black bg-gradient-to-b from-purple-600 to-purple-800">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-2xl text-gray-800">Build Structures to Improve Concentration</h3>
            <p className="text-gray-600">Match the target pattern while maintaining focus</p>
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
              <Target className="w-4 h-4 text-orange-500" />
              <span className="font-minecraft text-sm text-gray-600">Difficulty</span>
            </div>
            <div className="font-minecraft-bold text-lg text-orange-500">Medium</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-minecraft text-sm text-gray-600">Focus</span>
            </div>
            <div className="font-minecraft-bold text-lg">Concentration</div>
          </div>
          <div className="border-4 border-black p-3 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-mc-yellow" />
              <span className="font-minecraft text-sm text-gray-600">Progress</span>
            </div>
            <div className="font-minecraft-bold text-lg">30%</div>
          </div>
        </div>

        {/* Level Selector */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <h4 className="font-minecraft-bold text-lg mb-4 text-purple-600">Select Difficulty Level</h4>
          <div className="grid grid-cols-3 gap-4">
            {levels.map((level) => (
              <button
                key={level.level}
                onClick={() => handleLevelSelect(level.level)}
                className={`border-4 border-black p-4 transition-all ${
                  currentLevel === level.level
                    ? 'bg-gradient-to-b from-yellow-100 to-yellow-200 ring-4 ring-yellow-300'
                    : 'bg-gradient-to-b from-gray-100 to-white'
                }`}
                disabled={isActive}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="font-minecraft-bold text-xl">Level {level.level}</div>
                  <div className="font-minecraft-bold text-sm">{level.name}</div>
                  <div className="font-minecraft text-xs text-gray-600 text-center">
                    {level.description}
                  </div>
                  <div className="flex gap-1">
                    {Array(level.level).fill(0).map((_, i) => (
                      <Zap key={i} className="w-4 h-4 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Structure */}
          <div className="border-4 border-black p-4 bg-gradient-to-b from-blue-50 to-cyan-50">
            <h4 className="font-minecraft-bold text-lg mb-4 text-blue-600 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Structure
            </h4>
            
            <div className="grid gap-1 justify-center"
              style={{
                gridTemplateColumns: `repeat(${currentLevelData.gridSize}, minmax(0, 1fr))`
              }}
            >
              {targetStructure.map((row, rowIndex) => (
                row.map((blockId, colIndex) => (
                  <div
                    key={`target-${rowIndex}-${colIndex}`}
                    className="w-10 h-10 border-2 border-black flex items-center justify-center"
                    style={{ backgroundColor: blockTypes[blockId - 1]?.color }}
                  >
                    <PixelArt type={blockTypes[blockId - 1]?.icon as any} size={20} />
                  </div>
                ))
              ))}
            </div>
          </div>

          {/* Building Area */}
          <div className="border-4 border-black p-4 bg-gradient-to-b from-green-50 to-emerald-50">
            <h4 className="font-minecraft-bold text-lg mb-4 text-green-600 flex items-center gap-2">
              <Blocks className="w-5 h-5" />
              Your Structure
            </h4>
            
            <div className="grid gap-1 justify-center"
              style={{
                gridTemplateColumns: `repeat(${currentLevelData.gridSize}, minmax(0, 1fr))`
              }}
            >
              {gameGrid.map((row, rowIndex) => (
                row.map((blockId, colIndex) => (
                  <button
                    key={`build-${rowIndex}-${colIndex}`}
                    onClick={() => handleBlockClick(rowIndex, colIndex)}
                    className={`w-10 h-10 border-4 transition-all ${
                      selectedBlock?.row === rowIndex && selectedBlock?.col === colIndex
                        ? 'border-yellow-500 ring-4 ring-yellow-300'
                        : 'border-black'
                    } ${!blockId ? 'bg-gray-300 hover:bg-gray-400' : ''}`}
                    style={{ 
                      backgroundColor: blockId ? blockTypes[blockId - 1]?.color : undefined 
                    }}
                    disabled={!isActive || isCompleted}
                  >
                    {blockId && (
                      <PixelArt type={blockTypes[blockId - 1]?.icon as any} size={20} />
                    )}
                  </button>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Block Palette */}
        <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-100 to-white">
          <h4 className="font-minecraft-bold text-lg mb-4 text-gray-700">Available Blocks</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {blockTypes.map((block) => (
              <button
                key={block.id}
                onClick={() => selectedBlock && handleBlockPlace(block.id)}
                className={`border-4 border-black p-3 transition-all hover:scale-105 ${
                  selectedBlock ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                style={{ backgroundColor: block.color }}
                disabled={!selectedBlock || !isActive || isCompleted}
              >
                <div className="flex flex-col items-center gap-1">
                  <PixelArt type={block.icon as any} size={24} />
                  <span className="font-minecraft-bold text-xs text-white">{block.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Stats & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats */}
          <div className="border-4 border-black p-4 bg-gradient-to-b from-yellow-50 to-orange-50">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-minecraft text-gray-700">Time:</span>
                <span className="font-minecraft-bold text-lg">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-minecraft text-gray-700">Score:</span>
                <span className="font-minecraft-bold text-lg">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-minecraft text-gray-700">Level:</span>
                <span className="font-minecraft-bold text-lg">{currentLevelData.name}</span>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          <div className="border-4 border-black p-4 bg-gradient-to-b from-green-50 to-emerald-50">
            {isCompleted ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Trophy className="w-10 h-10 text-yellow-600 mb-2" />
                <div className="font-minecraft-bold text-lg text-green-600">Structure Complete!</div>
                <div className="font-minecraft text-sm text-gray-600">Bonus: +1000 points</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="font-minecraft-bold text-lg text-blue-600">Keep Building!</div>
                <div className="font-minecraft text-sm text-gray-600">Match the target pattern</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border-4 border-black p-4 bg-gradient-to-b from-gray-100 to-white">
            <div className="flex flex-col gap-3">
              <MinecraftButton
                onClick={handleStartGame}
                variant={isActive ? "warning" : "success"}
                size="md"
                icon={isActive ? Pause : Play}
                disabled={isCompleted}
              >
                {isActive ? 'Pause' : 'Start Building'}
              </MinecraftButton>
              
              <MinecraftButton
                onClick={handleReset}
                variant="secondary"
                size="md"
                icon={RotateCcw}
              >
                Reset Level
              </MinecraftButton>
            </div>
          </div>
        </div>

        {/* Benefits for ADHD/Focus */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h4 className="font-minecraft-bold text-lg mb-3 text-indigo-600">Benefits for Focus & ADHD:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div className="font-minecraft-bold text-gray-800">Improves Attention Span</div>
              </div>
              <p className="text-sm text-gray-600">Trains your brain to maintain focus on tasks</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <div className="font-minecraft-bold text-gray-800">Working Memory</div>
              </div>
              <p className="text-sm text-gray-600">Enhances ability to hold information in mind</p>
            </div>
            <div className="border-2 border-black p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <div className="font-minecraft-bold text-gray-800">Task Completion</div>
              </div>
              <p className="text-sm text-gray-600">Builds perseverance to finish what you start</p>
            </div>
          </div>
        </div>

        {/* Tips for Better Focus */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-teal-50 to-cyan-50">
          <h4 className="font-minecraft-bold text-lg mb-3 text-teal-600">Tips for Better Concentration:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Start Small</div>
            </div>
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Take Breaks</div>
            </div>
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Minimize Distractions</div>
            </div>
            <div className="border-2 border-black p-2 bg-white text-center">
              <div className="font-minecraft-bold text-sm">Celebrate Progress</div>
            </div>
          </div>
        </div>
      </div>
    </MinecraftModal>
  )
}

export default FocusBuildingModal