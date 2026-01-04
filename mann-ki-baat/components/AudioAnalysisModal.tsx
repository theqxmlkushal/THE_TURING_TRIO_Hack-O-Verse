// AudioAnalysisModal.tsx - Audio emotion analysis with WAV conversion
'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Mic, Upload, AlertTriangle, Heart, Volume2, CheckCircle, Loader2, Info, Download, Save, History } from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import ProgressBar from '@/components/ProgressBar'
import { useSounds } from '@/lib/sounds'
import { sentimentAPI, AudioAnalysisResponse } from '@/lib/api'

interface AudioAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface SavedScore {
  id: string
  date: string
  fileName: string
  score: number
  riskLevel: string
  primaryEmotion: string
  confidence: number
  processingTime: number
  rawData: AudioAnalysisResponse
}

const ACCEPTED_FORMATS = ['.wav', '.mp3', '.m4a', '.flac', '.ogg']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function AudioAnalysisModal({ isOpen, onClose, onComplete }: AudioAnalysisModalProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [results, setResults] = useState<AudioAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'input' | 'loading' | 'results'>('input')
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [savedScores, setSavedScores] = useState<SavedScore[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { play } = useSounds()

  // Load saved scores on mount
  useEffect(() => {
    const saved = localStorage.getItem('audioAnalysisScores')
    if (saved) {
      try {
        setSavedScores(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load saved scores:', err)
      }
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview)
      }
    }
  }, [audioPreview])

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAudioFile(null)
      setResults(null)
      setError(null)
      setCurrentView('input')
      setIsConverting(false)
      setShowHistory(false)
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview)
      }
      setAudioPreview(null)
    }
  }, [isOpen])

  // Convert audio to WAV format using Web Audio API
  const convertToWav = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          
          // Decode audio data
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // Get audio data
          const numberOfChannels = audioBuffer.numberOfChannels
          const length = audioBuffer.length * numberOfChannels * 2
          const sampleRate = audioBuffer.sampleRate
          
          // Create WAV file buffer
          const buffer = new ArrayBuffer(44 + length)
          const view = new DataView(buffer)
          
          // Write WAV header
          const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i))
            }
          }
          
          writeString(0, 'RIFF')
          view.setUint32(4, 36 + length, true)
          writeString(8, 'WAVE')
          writeString(12, 'fmt ')
          view.setUint32(16, 16, true) // Format chunk size
          view.setUint16(20, 1, true) // PCM format
          view.setUint16(22, numberOfChannels, true)
          view.setUint32(24, sampleRate, true)
          view.setUint32(28, sampleRate * numberOfChannels * 2, true)
          view.setUint16(32, numberOfChannels * 2, true)
          view.setUint16(34, 16, true) // Bits per sample
          writeString(36, 'data')
          view.setUint32(40, length, true)
          
          // Write audio data
          const offset = 44
          const channels = []
          for (let i = 0; i < numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i))
          }
          
          let pos = 0
          for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
              const sample = Math.max(-1, Math.min(1, channels[channel][i]))
              view.setInt16(offset + pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
              pos += 2
            }
          }
          
          // Create blob and file
          const blob = new Blob([buffer], { type: 'audio/wav' })
          const wavFile = new File([blob], file.name.replace(/\.[^.]+$/, '.wav'), {
            type: 'audio/wav'
          })
          
          resolve(wavFile)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_FORMATS.includes(ext)) {
      setError(`Unsupported format. Please use: ${ACCEPTED_FORMATS.join(', ')}`)
      play('error')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      play('error')
      return
    }

    setError(null)
    setIsConverting(true)
    
    try {
      // If not WAV, convert to WAV
      let finalFile = file
      if (ext !== '.wav') {
        console.log('Converting audio to WAV format...')
        finalFile = await convertToWav(file)
        console.log('Conversion complete:', finalFile.name, finalFile.size)
      }
      
      setAudioFile(finalFile)
      
      // Create preview URL
      const url = URL.createObjectURL(finalFile)
      setAudioPreview(url)
      
      play('click')
    } catch (conversionError) {
      console.error('Audio conversion error:', conversionError)
      setError('Failed to process audio file. Please try a different file or format.')
      play('error')
    } finally {
      setIsConverting(false)
    }
  }

  const saveScore = (results: AudioAnalysisResponse) => {
    if (!audioFile || !results) return

    const newScore: SavedScore = {
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      fileName: audioFile.name,
      score: results.risk_score,
      riskLevel: results.risk_level,
      primaryEmotion: results.primary_emotion,
      confidence: results.confidence,
      processingTime: results.processing_time,
      rawData: results
    }

    const updatedScores = [newScore, ...savedScores.slice(0, 49)] // Keep last 50 scores
    setSavedScores(updatedScores)
    localStorage.setItem('audioAnalysisScores', JSON.stringify(updatedScores))
    
    // Also store for combined analysis
    sessionStorage.setItem('audioAnalysisResults', JSON.stringify(results))
    
    play('success')
    return newScore
  }

  const handleAnalyze = async () => {
    if (!audioFile) return

    setIsAnalyzing(true)
    setError(null)
    setCurrentView('loading')
    play('game_start')

    try {
      const response = await sentimentAPI.analyzeAudio(
        audioFile,
        undefined,
        `session_${Date.now()}`
      )

      // Save score to localStorage
      saveScore(response)

      setResults(response)
      setCurrentView('results')
      play('achievement')

    } catch (err) {
      console.error('Audio analysis error:', err)
      setError(err instanceof Error ? err.message : 'Audio analysis failed. Please try again.')
      setCurrentView('input')
      play('error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleComplete = () => {
    play('success')
    onComplete()
    onClose()
  }

  const exportScores = () => {
    const dataStr = JSON.stringify(savedScores, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `audio_analysis_scores_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    play('click')
  }

  const clearScores = () => {
    if (window.confirm('Are you sure you want to clear all saved scores? This action cannot be undone.')) {
      setSavedScores([])
      localStorage.removeItem('audioAnalysisScores')
      play('click')
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'mc-green'
      case 'MEDIUM': return 'mc-yellow'
      case 'HIGH': return 'mc-orange'
      case 'CRITICAL': return 'mc-red'
      default: return 'gray-400'
    }
  }

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case 'LOW': return '😊'
      case 'MEDIUM': return '😐'
      case 'HIGH': return '😟'
      case 'CRITICAL': return '🚨'
      default: return '❓'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-mc-purple to-purple-700 border-b-4 border-black p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div>
                <h2 className="font-minecraft-bold text-xl text-white">
                  Audio Emotion Analysis
                </h2>
                <p className="text-xs text-white/80 font-minecraft">
                  Step 2: Analyze your voice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savedScores.length > 0 && (
                <button
                  onClick={() => {
                    setShowHistory(!showHistory)
                    play('click')
                  }}
                  className="p-2 bg-mc-blue border-2 border-black hover:bg-blue-600 transition-colors"
                  aria-label="View history"
                >
                  <History className="w-5 h-5 text-white" />
                </button>
              )}
              <button
                onClick={() => {
                  play('click')
                  onClose()
                }}
                className="p-2 bg-mc-red border-2 border-black hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showHistory ? (
            // History View
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mc-purple border-2 border-black">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-minecraft-bold text-lg">Analysis History</h3>
                    <p className="text-sm text-gray-600">
                      {savedScores.length} saved analysis {savedScores.length === 1 ? 'result' : 'results'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {savedScores.length > 0 && (
                    <>
                      <MinecraftButton
                        onClick={exportScores}
                        variant="primary"
                        size="sm"
                        icon={Download}
                      >
                        Export
                      </MinecraftButton>
                      <MinecraftButton
                        onClick={clearScores}
                        variant="danger"
                        size="sm"
                      >
                        Clear All
                      </MinecraftButton>
                    </>
                  )}
                  <MinecraftButton
                    onClick={() => {
                      setShowHistory(false)
                      play('click')
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Back
                  </MinecraftButton>
                </div>
              </div>

              {savedScores.length === 0 ? (
                <div className="text-center py-12 border-4 border-dashed border-gray-300 bg-gray-50">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-minecraft-bold text-lg text-gray-700 mb-2">
                    No Analysis History
                  </p>
                  <p className="text-sm text-gray-600">
                    Analyze audio files to build your history
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {savedScores.map((score) => (
                    <div key={score.id} className="bg-white border-4 border-black p-4 hover:border-mc-purple transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-minecraft-bold text-lg text-gray-800 truncate max-w-xs">
                            {score.fileName}
                          </h4>
                          <p className="text-xs text-gray-500">{formatDate(score.date)}</p>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 border-2 border-black ${
                            score.riskLevel === 'CRITICAL' ? 'bg-red-100' :
                            score.riskLevel === 'HIGH' ? 'bg-orange-100' :
                            score.riskLevel === 'MEDIUM' ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}>
                            <span className="font-minecraft-bold text-sm">{score.score.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{score.riskLevel} Risk</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Primary Emotion:</span>
                          <span className="font-minecraft-bold ml-2 capitalize">{score.primaryEmotion}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-minecraft-bold ml-2">{(score.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Processing Time:</span>
                          <span className="font-minecraft-bold ml-2">{score.processingTime.toFixed(2)}s</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-minecraft-bold ml-2 ${
                            score.riskLevel === 'CRITICAL' ? 'text-red-600' :
                            score.riskLevel === 'HIGH' ? 'text-orange-600' :
                            score.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {getRiskEmoji(score.riskLevel)} {score.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentView === 'input' ? (
            // Input View
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-4 border-mc-purple p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-mc-purple border-2 border-black">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-minecraft-bold text-lg mb-2">Upload Audio Recording</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Upload an audio file of yourself speaking about your feelings. Our AI will analyze
                      your voice tone and emotions. Results will be saved to your history.
                    </p>
                    <p className="text-xs text-gray-600">
                      Supported formats: {ACCEPTED_FORMATS.join(', ')} (max {MAX_FILE_SIZE / 1024 / 1024}MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversion Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-4 border-mc-blue p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-mc-blue border-2 border-black">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-minecraft-bold text-sm text-gray-800 mb-1">
                      Audio Processing
                    </h4>
                    <p className="text-xs text-gray-600">
                      Non-WAV files will be automatically converted to WAV format for optimal analysis.
                      This happens in your browser and takes just a few seconds.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FORMATS.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isConverting}
                />

                {!audioFile && !isConverting ? (
                  <div
                    onClick={() => !isConverting && fileInputRef.current?.click()}
                    className="border-4 border-dashed border-gray-400 bg-white p-12 text-center cursor-pointer hover:border-mc-purple hover:bg-purple-50 transition-colors"
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="font-minecraft-bold text-lg text-gray-700 mb-2">
                      Click to Upload Audio File
                    </p>
                    <p className="text-sm text-gray-600">
                      or drag and drop your file here
                    </p>
                  </div>
                ) : isConverting ? (
                  <div className="border-4 border-mc-blue bg-blue-50 p-12 text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 text-mc-blue animate-spin" />
                    <p className="font-minecraft-bold text-lg text-gray-700 mb-2">
                      Converting Audio to WAV...
                    </p>
                    <p className="text-sm text-gray-600">
                      Please wait while we process your file
                    </p>
                  </div>
                ) : audioFile ? (
                  <div className="bg-white border-4 border-black p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-mc-purple border-2 border-black">
                        <Volume2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-minecraft-bold text-lg text-gray-800">
                          {audioFile.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {audioFile.type === 'audio/wav' && (
                          <p className="text-xs text-mc-green mt-1">✓ WAV format - Ready for analysis</p>
                        )}
                      </div>
                      <MinecraftButton
                        onClick={() => {
                          setAudioFile(null)
                          if (audioPreview) {
                            URL.revokeObjectURL(audioPreview)
                          }
                          setAudioPreview(null)
                          play('click')
                        }}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </MinecraftButton>
                    </div>

                    {audioPreview && audioFile && (
                      <div className="border-2 border-gray-300 p-2 bg-gray-50">
                        <audio controls className="w-full">
                          <source src={audioPreview} type={audioFile.type} />
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {error && (
                <div className="bg-red-50 border-4 border-mc-red p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-mc-red" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <MinecraftButton
                  onClick={handleAnalyze}
                  variant="success"
                  size="lg"
                  icon={Mic}
                  iconPosition="right"
                  disabled={!audioFile || isAnalyzing || isConverting}
                  className="flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Audio'}
                </MinecraftButton>
                <MinecraftButton
                  onClick={() => {
                    play('click')
                    onClose()
                  }}
                  variant="secondary"
                  size="lg"
                >
                  Cancel
                </MinecraftButton>
              </div>
            </div>
          ) : currentView === 'loading' ? (
            // Loading View
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-black border-t-mc-purple border-r-mc-blue border-b-mc-pink border-l-mc-yellow rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">🎵</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-minecraft-bold text-2xl text-gray-800">
                  Analyzing Your Voice...
                </h3>
                <p className="text-gray-600">
                  Processing audio to detect emotional patterns
                </p>
                <div className="max-w-md mx-auto">
                  <ProgressBar
                    value={0}
                    max={100}
                    variant="experience"
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Results View
            results && (
              <div className="space-y-6">
                {/* Save Success Message */}
                <div className="bg-green-50 border-4 border-mc-green p-4">
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5 text-mc-green" />
                    <p className="text-sm text-green-800">
                      Analysis results saved to your history
                    </p>
                  </div>
                </div>

                {/* Risk Level Display */}
                <div className={`border-4 p-6 ${
                  results.risk_level === 'CRITICAL' ? 'bg-red-50 border-mc-red' :
                  results.risk_level === 'HIGH' ? 'bg-orange-50 border-mc-orange' :
                  results.risk_level === 'MEDIUM' ? 'bg-yellow-50 border-mc-yellow' :
                  'bg-green-50 border-mc-green'
                }`}>
                  <div className="text-center">
                    <div className="text-6xl mb-3">{getRiskEmoji(results.risk_level)}</div>
                    <h3 className="font-minecraft-bold text-3xl mb-2">
                      Risk Level: {results.risk_level}
                    </h3>
                    <div className="max-w-md mx-auto mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-minecraft text-sm">Risk Score</span>
                        <span className="font-minecraft-bold text-lg">{results.risk_score.toFixed(1)}/100</span>
                      </div>
                      <ProgressBar
                        value={results.risk_score}
                        max={100}
                        size="lg"
                        showLabel={false}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Confidence: {(results.confidence * 100).toFixed(1)}% • 
                      Processing Time: {results.processing_time.toFixed(2)}s
                    </p>
                  </div>
                </div>

                {/* Primary Emotion */}
                <div className="bg-white border-4 border-black p-6">
                  <h4 className="font-minecraft-bold text-xl mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-mc-purple" />
                    Primary Emotion Detected
                  </h4>
                  <div className="text-center">
                    <div className="inline-block px-8 py-4 bg-gradient-to-b from-mc-purple to-purple-700 border-4 border-black">
                      <span className="font-minecraft-bold text-3xl text-white capitalize">
                        {results.primary_emotion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emotion Probabilities */}
                {results.emotion_probabilities && (
                  <div className="bg-white border-4 border-black p-4">
                    <h4 className="font-minecraft-bold text-lg mb-3">
                      Emotion Distribution
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(results.emotion_probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([emotion, prob]) => (
                          <div key={emotion}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-minecraft text-sm capitalize">{emotion}</span>
                              <span className="font-minecraft-bold text-sm">{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <ProgressBar
                              value={prob * 100}
                              max={100}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <div className="bg-white border-4 border-black p-4">
                    <h4 className="font-minecraft-bold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-mc-green" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-mc-purple rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <MinecraftButton
                    onClick={handleComplete}
                    variant="success"
                    size="lg"
                    icon={CheckCircle}
                    iconPosition="right"
                    className="flex-1"
                  >
                    Complete Step 2 & Continue
                  </MinecraftButton>
                  <MinecraftButton
                    onClick={() => {
                      setCurrentView('input')
                    }}
                    variant="secondary"
                    size="lg"
                  >
                    Analyze Again
                  </MinecraftButton>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}