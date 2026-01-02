'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, AlertTriangle, Heart, Brain, Shield, Phone, Volume2, VolumeX } from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import ProgressBar from '@/components/ProgressBar'
import { useSounds } from '@/lib/sounds'
import { sentimentAPI, AnalysisResponse } from '@/lib/api'

interface TextAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function TextAnalysisModal({ isOpen, onClose, onComplete }: TextAnalysisModalProps) {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0)
  const [speechBatch, setSpeechBatch] = useState<string[]>([])
  const [showTTSControls, setShowTTSControls] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [ttsAvailable, setTtsAvailable] = useState(false)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { play } = useSounds()

  const charCount = text.length
  const minChars = 10
  const maxChars = 5000
  const charProgress = (charCount / maxChars) * 100
  const isValid = charCount >= minChars && charCount <= maxChars

  // Load and select Indian female voice
  useEffect(() => {
    const loadAndSelectVoice = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices()
        setTtsAvailable(voices.length > 0)
        
        // Try to find Indian female voice
        let voice = voices.find(voice => 
          voice.lang.includes('IN') || 
          voice.lang.includes('India') ||
          voice.name.toLowerCase().includes('indian')
        )
        
        // If no Indian voice, try any female voice
        if (!voice) {
          voice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('zira') // Windows female voice
          )
        }
        
        // Fallback to first available voice
        if (!voice && voices.length > 0) {
          voice = voices[0]
        }
        
        setSelectedVoice(voice || null)
      } else {
        setTtsAvailable(false)
      }
    }

    // Load voices when component mounts
    loadAndSelectVoice()
    
    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadAndSelectVoice
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  // Text-to-Speech functionality
  const initializeTTS = (recommendations: string[]) => {
    if (!ttsAvailable || !selectedVoice) {
      console.warn('Text-to-speech not available')
      return
    }

    // Split recommendations into batches (max 20 words per batch)
    const batches: string[] = []
    recommendations.forEach(rec => {
      const words = rec.split(' ')
      for (let i = 0; i < words.length; i += 20) {
        const batch = words.slice(i, i + 20).join(' ')
        batches.push(batch)
      }
    })

    // Add intro and outro with friendly, supportive tone
    const intro = "Here are some personalized recommendations for your mental wellness."
    const outro = "Remember to be kind to yourself. Take what feels helpful for you."
    
    setSpeechBatch([intro, ...batches, outro])
    setShowTTSControls(true)
  }

  const speakText = (text: string) => {
    if (!ttsAvailable || !selectedVoice || isSpeaking) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Use selected voice
    utterance.voice = selectedVoice
    
    // Adjust settings for natural Indian female voice
    utterance.rate = 0.9  // Slightly slower for clarity
    utterance.pitch = selectedVoice.name.toLowerCase().includes('female') ? 1.1 : 1.0
    utterance.volume = 1.0
    
    // utterance.onstart = () => {
    //   setIsSpeaking(true)
    //   play('success')
    // }
    
    utterance.onend = () => {
      setIsSpeaking(false)
      if (currentSpeechIndex < speechBatch.length - 1) {
        setCurrentSpeechIndex(prev => prev + 1)
      } else {
        // Reset when finished
        setCurrentSpeechIndex(0)
      }
    }
    
    utterance.onerror = () => {
      setIsSpeaking(false)
      setCurrentSpeechIndex(0)
    }
    
    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setCurrentSpeechIndex(0)
    }
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech()
    } else {
      if (speechBatch.length > 0) {
        if (currentSpeechIndex === 0) {
          // Start from beginning
          speakText(speechBatch[0])
        } else {
          // Resume from current position
          speakText(speechBatch[currentSpeechIndex])
        }
      }
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeech()
    }
  }, [])

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('')
      setResults(null)
      setError(null)
      setCurrentView('input')
      setIsSpeaking(false)
      setCurrentSpeechIndex(0)
      setSpeechBatch([])
      setShowTTSControls(false)
      stopSpeech()
    }
  }, [isOpen])

  const handleAnalyze = async () => {
    if (!isValid) return

    setIsAnalyzing(true)
    setError(null)
    play('game_start')

    try {
      const response = await sentimentAPI.analyzeText({
        text,
        language: 'english',
        session_id: `session_${Date.now()}`
      })

      setResults(response)
      setCurrentView('results')
      play('achievement')

      if (response.recommendations && response.recommendations.length > 0 && ttsAvailable) {
        initializeTTS(response.recommendations)
      }

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      play('error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleComplete = () => {
    stopSpeech()
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
        <div className="sticky top-0 z-10 bg-gradient-to-b from-mc-green to-mc-dark-green border-b-4 border-black p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="font-minecraft-bold text-xl text-white">
                Text Based Sentiment Analysis
              </h2>
            </div>
            <button
              onClick={() => {
                play('click')
                stopSpeech()
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
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-minecraft-bold text-lg mb-2">Share Your Thoughts</h3>
                    <p className="text-sm text-gray-700">
                      Write about how you're feeling, what's on your mind, or any challenges you're facing.
                      Be honest and open - this is a safe space.
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-minecraft text-gray-700">Your Thoughts:</label>
                  <div className="flex items-center gap-2">
                    <span className={`font-minecraft text-sm ${charCount < minChars ? 'text-mc-red' : charCount > maxChars * 0.9 ? 'text-mc-orange' : 'text-mc-green'}`}>
                      {charCount} / {maxChars}
                    </span>
                  </div>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing here... Share what's on your mind, how you're feeling, or any challenges you're facing."
                  className="w-full h-64 p-4 bg-white border-4 border-black font-mono text-gray-800 resize-none focus:outline-none focus:border-mc-green"
                  disabled={isAnalyzing}
                />

                <div className="mt-2">
                  <ProgressBar
                    value={charProgress}
                    max={100}
                    size="sm"
                    showLabel={false}
                  />
                </div>

                {charCount < minChars && charCount > 0 && (
                  <p className="text-sm text-mc-red font-minecraft">
                    ⚠️ Please write at least {minChars - charCount} more characters
                  </p>
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
                  icon={Send}
                  iconPosition="right"
                  disabled={!isValid || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze My Text'}
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
          ) : (
            // Results View
            results && (
              <div className="space-y-6">
                {/* TTS Controls */}
                {showTTSControls && ttsAvailable && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-4 border-mc-purple p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-mc-purple border-2 border-black">
                          <Volume2 className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-minecraft-bold text-lg text-gray-800">
                            Listen to Recommendations
                          </h4>
                          <p className="text-sm text-gray-600">
                            {isSpeaking 
                              ? `Playing part ${currentSpeechIndex + 1} of ${speechBatch.length}` 
                              : 'Click to hear personalized advice'}
                          </p>
                          {selectedVoice && (
                            <p className="text-xs text-gray-500 mt-1">
                              Voice: {selectedVoice.name}
                              {selectedVoice.name.toLowerCase().includes('indian') && ' (Indian)'}
                              {selectedVoice.name.toLowerCase().includes('female') && ' (Female)'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MinecraftButton
                          onClick={toggleSpeech}
                          variant={isSpeaking ? "danger" : "primary"}
                          size="sm"
                          icon={isSpeaking ? VolumeX : Volume2}
                        >
                          {isSpeaking ? 'Stop' : 'Listen'}
                        </MinecraftButton>
                        <span className="text-sm text-gray-500 font-minecraft">
                          {currentSpeechIndex + 1}/{speechBatch.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TTS Not Available Warning */}
                {showTTSControls && !ttsAvailable && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-mc-yellow p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-mc-yellow border-2 border-black">
                        <VolumeX className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h4 className="font-minecraft-bold text-lg text-gray-800">
                          Text-to-Speech Not Available
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your browser doesn't support text-to-speech. You can read the recommendations below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                      Confidence: {(results.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Critical Warning */}
                {(results.risk_level === 'CRITICAL' || results.risk_level === 'HIGH') && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-4 border-mc-red p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-mc-red border-2 border-black">
                        <AlertTriangle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-minecraft-bold text-2xl text-red-800 mb-3">
                          🚨 Immediate Support Available
                        </h3>
                        <p className="text-red-700 mb-4">
                          We're concerned about your wellbeing. Please reach out to professional help immediately.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {results.mental_health_resources && results.mental_health_resources.emergency_helplines ? (
                            Object.entries(results.mental_health_resources.emergency_helplines)
                              .slice(0, 4)
                              .map(([name, number]) => (
                                <a
                                  key={name}
                                  href={`tel:${number}`}
                                  onClick={() => play('click')}
                                  className="flex items-center gap-2 p-3 bg-white border-2 border-mc-red hover:bg-red-50 transition-colors"
                                >
                                  <Phone className="w-4 h-4 text-mc-red" />
                                  <div className="text-left">
                                    <div className="font-minecraft text-sm text-gray-800">{name}</div>
                                    <div className="font-minecraft-bold text-mc-red">{number}</div>
                                  </div>
                                </a>
                              ))
                          ) : (
                            <div className="p-4 bg-yellow-50 border border-yellow-200">
                              <p className="text-yellow-800">Emergency resources not available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detected Emotions */}
                {results.detected_emotions && results.detected_emotions.length > 0 && (
                  <div className="bg-white border-4 border-black p-4">
                    <h4 className="font-minecraft-bold text-lg mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Detected Emotions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {results.detected_emotions.map((emotion, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-b from-mc-blue to-mc-dark-blue border-2 border-black"
                        >
                          <span className="font-minecraft text-white capitalize">{emotion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations && (
                  <div className="bg-white border-4 border-black p-4">
                    <h4 className="font-minecraft-bold text-lg mb-3">📋 AI-Generated Recommendations</h4>
                    <ul className="space-y-2">
                      {results.recommendations.slice(0, 5).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-mc-green rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-mc-blue/10 to-mc-green/10 border-4 border-mc-blue p-4">
                  <h4 className="font-minecraft-bold text-lg mb-2">🎯 Next Steps</h4>
                  <p className="text-sm whitespace-pre-line">{results.next_step}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <MinecraftButton
                    onClick={handleComplete}
                    variant="success"
                    size="lg"
                    className="flex-1"
                  >
                    Complete Step 1 & Continue
                  </MinecraftButton>
                  <MinecraftButton
                    onClick={() => {
                      stopSpeech()
                      setCurrentView('input')
                    }}
                    variant="secondary"
                    size="lg"
                  >
                    Retry Analysis
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