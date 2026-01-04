// VideoAnalysisModal.tsx - Video facial emotion analysis
'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Video, Upload, AlertTriangle, Heart, Film, CheckCircle, TrendingUp } from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import ProgressBar from '@/components/ProgressBar'
import { useSounds } from '@/lib/sounds'
import { sentimentAPI, VideoAnalysisResponse } from '@/lib/api'

interface VideoAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const ACCEPTED_FORMATS = ['.mp4', '.avi', '.mov', '.webm']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export default function VideoAnalysisModal({ isOpen, onClose, onComplete }: VideoAnalysisModalProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<VideoAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'input' | 'loading' | 'results'>('input')
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [frameSkip, setFrameSkip] = useState(10)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { play } = useSounds()

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [videoPreview])

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setVideoFile(null)
      setResults(null)
      setError(null)
      setCurrentView('input')
      setFrameSkip(10)
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
      setVideoPreview(null)
    }
  }, [isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setVideoFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
    
    play('click')
  }

  const handleAnalyze = async () => {
    if (!videoFile) return

    setIsAnalyzing(true)
    setError(null)
    setCurrentView('loading')
    play('game_start')

    try {
      const response = await sentimentAPI.analyzeVideo(videoFile, frameSkip)

      if (response.status === 'success') {
        // Store results for combined analysis
        sessionStorage.setItem('videoAnalysisResults', JSON.stringify(response))
        
        setResults(response)
        setCurrentView('results')
        play('achievement')
      } else {
        throw new Error('Video analysis failed')
      }

    } catch (err) {
      console.error('Video analysis error:', err)
      setError(err instanceof Error ? err.message : 'Video analysis failed. Please try again.')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-mc-blue to-blue-700 border-b-4 border-black p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                <span className="text-2xl">🎥</span>
              </div>
              <div>
                <h2 className="font-minecraft-bold text-xl text-white">
                  Video Facial Emotion Analysis
                </h2>
                <p className="text-xs text-white/80 font-minecraft">
                  Step 3: Analyze your facial expressions
                </p>
              </div>
            </div>
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

        {/* Content */}
        <div className="p-6">
          {currentView === 'input' ? (
            // Input View
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-4 border-mc-blue p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-mc-blue border-2 border-black">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-minecraft-bold text-lg mb-2">Upload Video Recording</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Upload a video of yourself speaking. Our AI will analyze your facial expressions
                      to detect emotional patterns over time.
                    </p>
                    <p className="text-xs text-gray-600">
                      Supported formats: {ACCEPTED_FORMATS.join(', ')} (max {MAX_FILE_SIZE / 1024 / 1024}MB)
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
                />

                {!videoFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-gray-400 bg-white p-12 text-center cursor-pointer hover:border-mc-blue hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="font-minecraft-bold text-lg text-gray-700 mb-2">
                      Click to Upload Video File
                    </p>
                    <p className="text-sm text-gray-600">
                      or drag and drop your file here
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border-4 border-black p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-mc-blue border-2 border-black">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-minecraft-bold text-lg text-gray-800">
                          {videoFile.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <MinecraftButton
                        onClick={() => {
                          setVideoFile(null)
                          if (videoPreview) {
                            URL.revokeObjectURL(videoPreview)
                          }
                          setVideoPreview(null)
                          play('click')
                        }}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </MinecraftButton>
                    </div>

                    {videoPreview && (
                      <div className="border-2 border-gray-300 p-2 bg-gray-50">
                        <video controls className="w-full max-h-64">
                          <source src={videoPreview} type={videoFile.type} />
                          Your browser does not support video playback.
                        </video>
                      </div>
                    )}

                    {/* Frame Skip Setting */}
                    <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-300">
                      <label className="font-minecraft text-sm text-gray-700 mb-2 block">
                        Analysis Speed (Frame Skip): {frameSkip} frames
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Higher values = faster processing but less detailed analysis
                      </p>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={frameSkip}
                        onChange={(e) => setFrameSkip(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>More Detail (5)</span>
                        <span>Balanced (10-15)</span>
                        <span>Faster (30)</span>
                      </div>
                    </div>
                  </div>
                )}
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
                  icon={Video}
                  iconPosition="right"
                  disabled={!videoFile || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
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
                <div className="w-24 h-24 border-8 border-black border-t-mc-blue border-r-mc-green border-b-mc-purple border-l-mc-yellow rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-minecraft-bold text-2xl text-gray-800">
                  Analyzing Your Video...
                </h3>
                <p className="text-gray-600">
                  Processing frames and detecting facial expressions
                </p>
                <p className="text-sm text-gray-500">
                  This may take a few minutes depending on video length
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
            results && results.summary && (
              <div className="space-y-6">
                {/* Overall Risk Assessment */}
                {results.risk_assessment && (
                  <div className={`border-4 p-6 ${
                    results.risk_assessment.overall_risk_level === 'CRITICAL' ? 'bg-red-50 border-mc-red' :
                    results.risk_assessment.overall_risk_level === 'HIGH' ? 'bg-orange-50 border-mc-orange' :
                    results.risk_assessment.overall_risk_level === 'MEDIUM' ? 'bg-yellow-50 border-mc-yellow' :
                    'bg-green-50 border-mc-green'
                  }`}>
                    <div className="text-center">
                      <div className="text-6xl mb-3">{getRiskEmoji(results.risk_assessment.overall_risk_level)}</div>
                      <h3 className="font-minecraft-bold text-3xl mb-2">
                        Risk Level: {results.risk_assessment.overall_risk_level}
                      </h3>
                      <div className="max-w-md mx-auto mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-minecraft text-sm">Risk Score</span>
                          <span className="font-minecraft-bold text-lg">
                            {results.risk_assessment.risk_score.toFixed(1)}/100
                          </span>
                        </div>
                        <ProgressBar
                          value={results.risk_assessment.risk_score}
                          max={100}
                          size="lg"
                          showLabel={false}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Frames Analyzed: {results.total_frames_analyzed} • 
                        Duration: {results.duration.toFixed(1)}s • 
                        Processing: {results.processing_time.toFixed(1)}s
                      </p>
                    </div>
                  </div>
                )}

                {/* Most Frequent Emotion */}
                <div className="bg-white border-4 border-black p-6">
                  <h4 className="font-minecraft-bold text-xl mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-mc-blue" />
                    Most Frequent Emotion
                  </h4>
                  <div className="text-center">
                    <div className="inline-block px-8 py-4 bg-gradient-to-b from-mc-blue to-blue-700 border-4 border-black">
                      <span className="font-minecraft-bold text-3xl text-white capitalize">
                        {results.summary.most_frequent_emotion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emotion Distribution */}
                {results.summary.emotion_distribution && (
                  <div className="bg-white border-4 border-black p-4">
                    <h4 className="font-minecraft-bold text-lg mb-3">
                      Emotion Distribution Across Video
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(results.summary.emotion_distribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([emotion, percentage]) => (
                          <div key={emotion}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-minecraft text-sm capitalize">{emotion}</span>
                              <span className="font-minecraft-bold text-sm">{percentage.toFixed(1)}%</span>
                            </div>
                            <ProgressBar
                              value={percentage}
                              max={100}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Emotional Stability */}
                <div className="bg-white border-4 border-black p-4">
                  <h4 className="font-minecraft-bold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-mc-blue" />
                    Emotional Stability
                  </h4>
                  <div className="mb-2">
                    <ProgressBar
                      value={results.summary.emotional_stability * 100}
                      max={100}
                      size="lg"
                      showLabel={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {results.summary.emotional_stability >= 0.7 
                      ? '✅ Your emotions appear relatively stable throughout the video'
                      : results.summary.emotional_stability >= 0.4
                      ? '⚠️ Your emotions show some fluctuation'
                      : '⚠️ Significant emotional fluctuation detected'}
                  </p>
                </div>

                {/* Risk Indicators */}
                {results.summary.risk_indicators && results.summary.risk_indicators.length > 0 && (
                  <div className="bg-yellow-50 border-4 border-mc-yellow p-4">
                    <h4 className="font-minecraft-bold text-lg mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-mc-yellow" />
                      Concern Flags
                    </h4>
                    <ul className="space-y-2">
                      {results.summary.risk_indicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-mc-yellow rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
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
                          <div className="w-2 h-2 bg-mc-blue rounded-full mt-1.5 flex-shrink-0"></div>
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
                    Complete Step 3 & Finish
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