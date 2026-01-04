'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Shield, Clock, Lock, CheckCircle, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StepCard from '@/components/StepCard'
import MinecraftButton from '@/components/MinecraftButton'
import ProgressBar from '@/components/ProgressBar'
import MinecraftModal from '@/components/MinecraftModal'
import TextAnalysisModal from '@/components/TextAnalysisModal'
import AudioAnalysisModal from '@/components/AudioAnalysisModal'
import VideoAnalysisModal from '@/components/VideoAnalysisModal'
import { useSounds } from '@/lib/sounds'

type StepStatus = 'locked' | 'unlocked' | 'completed'
type StepType = 'text' | 'voice' | 'video'

interface AssessmentStep {
  step: number
  title: string
  description: string
  type: StepType
  status: StepStatus
  estimatedTime: string
}

export default function TestPage() {
  const router = useRouter()
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showTextAnalysisModal, setShowTextAnalysisModal] = useState(false)
  const [showAudioAnalysisModal, setShowAudioAnalysisModal] = useState(false)
  const [showVideoAnalysisModal, setShowVideoAnalysisModal] = useState(false)
  const { play } = useSounds()

  // Initialize steps with state
  const [assessmentSteps, setAssessmentSteps] = useState<AssessmentStep[]>([
    {
      step: 1,
      title: 'Text Based Sentimental Analysis',
      description: 'Share your thoughts and feelings through writing. Our AI analyzes your text to understand your emotional state and provides personalized insights. This step helps identify patterns in your thinking.',
      type: 'text',
      status: 'unlocked',
      estimatedTime: '5-7 minutes'
    },
    {
      step: 2,
      title: 'Voice Based Sentimental Analysis',
      description: 'Speak your mind in a safe space. Voice analysis helps detect emotional tones and patterns that text might miss. We analyze pitch, tone, and speech patterns to understand your emotional state.',
      type: 'voice',
      status: 'locked',
      estimatedTime: '8-10 minutes'
    },
    {
      step: 3,
      title: 'Video Based Sentimental Analysis',
      description: 'Optional video recording for comprehensive analysis of facial expressions and vocal patterns together. This provides the most complete picture of your emotional wellbeing.',
      type: 'video',
      status: 'locked',
      estimatedTime: '10-12 minutes'
    }
  ])

  // Check if all steps are completed
  const allCompleted = assessmentSteps.every(step => step.status === 'completed')
  const completedSteps = assessmentSteps.filter(step => step.status === 'completed').length
  const progress = completedSteps / 3 * 100

  // Redirect to risk-score page when all steps are completed
  useEffect(() => {
    if (allCompleted) {
      // Small delay to show completion animation
      const timer = setTimeout(() => {
        
        // Store completion timestamp
        sessionStorage.setItem('assessmentCompleted', Date.now().toString())
        // Redirect to risk-score page
        router.push('/risk-score')
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [allCompleted, play, router])

  const handleStepStart = (step: number) => {
    play('game_start')
    
    if (step === 1) {
      setShowTextAnalysisModal(true)
    } else if (step === 2) {
      setShowAudioAnalysisModal(true)
    } else if (step === 3) {
      setShowVideoAnalysisModal(true)
    }
  }

  const handleTextAnalysisComplete = () => {
    play('achievement')
    
    // Mark step 1 as completed and unlock step 2
    setAssessmentSteps(prevSteps => {
      const updatedSteps = [...prevSteps]
      updatedSteps[0] = {
        ...updatedSteps[0],
        status: 'completed'
      }
      updatedSteps[1] = {
        ...updatedSteps[1],
        status: 'unlocked'
      }
      return updatedSteps
    })

    // Store text analysis results in sessionStorage
    const textResults = sessionStorage.getItem('textAnalysisResults')
    if (textResults) {
      localStorage.setItem('step1TextResults', textResults)
    }
  }

  const handleAudioAnalysisComplete = () => {
    play('achievement')
    
    // Mark step 2 as completed and unlock step 3
    setAssessmentSteps(prevSteps => {
      const updatedSteps = [...prevSteps]
      updatedSteps[1] = {
        ...updatedSteps[1],
        status: 'completed'
      }
      updatedSteps[2] = {
        ...updatedSteps[2],
        status: 'unlocked'
      }
      return updatedSteps
    })

    // Store audio analysis results in sessionStorage
    const audioResults = sessionStorage.getItem('audioAnalysisResults')
    if (audioResults) {
      localStorage.setItem('step2AudioResults', audioResults)
    }
  }

  const handleVideoAnalysisComplete = () => {
    play('achievement')
    
    // Mark step 3 as completed
    setAssessmentSteps(prevSteps => {
      const updatedSteps = [...prevSteps]
      updatedSteps[2] = {
        ...updatedSteps[2],
        status: 'completed'
      }
      return updatedSteps
    })

    // Store video analysis results in sessionStorage
    const videoResults = sessionStorage.getItem('videoAnalysisResults')
    if (videoResults) {
      localStorage.setItem('step3VideoResults', videoResults)
    }

    // Show completion message before redirect
    play('success')
  }

  const handleBeginAll = () => {
    play('achievement')
    setShowInfoModal(true)
  }

  const handleConfirmStart = () => {
    play('game_start')
    setShowInfoModal(false)
    setShowTextAnalysisModal(true)
  }

  const handleViewRiskScore = () => {
    play('click')
    router.push('/risk-score')
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-minecraft text-mc-brown hover:text-mc-green transition-colors group"
          onClick={() => play('click')}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          {/* Title Background */}
          <div className="absolute -inset-3 bg-gradient-to-r from-mc-green via-mc-blue to-mc-brown border-4 border-black opacity-80"></div>
          
          {/* Title Content */}
          <div className="relative bg-white border-4 border-black px-10 py-8">
            <h1 className="font-minecraft-bold text-4xl text-mc-green mb-2">
              Mental Health Assessment
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete our three-step assessment to understand your emotional wellbeing.
              Each step is designed to be engaging, safe, and insightful.
            </p>
          </div>
          
          {/* Decorative Corners */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-mc-green border-2 border-black rotate-45"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-mc-blue border-2 border-black rotate-45"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-mc-brown border-2 border-black rotate-45"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-mc-yellow border-2 border-black rotate-45"></div>
        </div>

        {/* Progress Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-gradient-to-b from-mc-green to-mc-dark-green flex items-center justify-center">
                <span className="font-minecraft text-white">📊</span>
              </div>
              <span className="font-minecraft text-gray-700">Assessment Progress</span>
            </div>
            <span className="font-minecraft-bold text-mc-green text-lg">
              {completedSteps}/3 Complete ({Math.round(progress)}%)
            </span>
          </div>
          
          <ProgressBar
            value={progress}
            max={100}
            variant="experience"
            size="lg"
            showLabel={false}
          />

          {allCompleted && (
            <div className="mt-4 bg-gradient-to-r from-mc-green/20 to-mc-blue/20 border-2 border-mc-green p-4 animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-mc-green animate-bounce" />
                <span className="font-minecraft-bold text-mc-green">
                  🎉 All Steps Completed! Redirecting to Risk Score Analysis...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Steps Grid */}
      <div className="space-y-8 mb-12">
        {assessmentSteps.map((step) => (
          <StepCard
            key={step.step}
            step={step.step}
            title={step.title}
            description={step.description}
            type={step.type}
            status={step.status}
            estimatedTime={step.estimatedTime}
            onStart={() => handleStepStart(step.step)}
          />
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Privacy Card */}
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 border-4 border-mc-blue p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-mc-blue/20 border-2 border-mc-blue">
              <Shield className="w-6 h-6 text-mc-blue" />
            </div>
            <h3 className="font-minecraft-bold text-lg text-gray-800">Privacy First</h3>
          </div>
          <p className="text-gray-600 text-sm">
            All your data is encrypted and stored securely. We never share personal information.
          </p>
        </div>

        {/* Time Card */}
        <div className="bg-gradient-to-b from-green-50 to-green-100 border-4 border-mc-green p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-mc-green/20 border-2 border-mc-green">
              <Clock className="w-6 h-6 text-mc-green" />
            </div>
            <h3 className="font-minecraft-bold text-lg text-gray-800">Quick & Easy</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Complete all three steps in under 30 minutes. Take breaks whenever you need.
          </p>
        </div>

        {/* Lock Card */}
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-4 border-gray-400 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-400/20 border-2 border-gray-400">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-minecraft-bold text-lg text-gray-800">Step by Step</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Complete each step to unlock the next. Take your time and proceed at your own pace.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black p-6 mb-8">
        <h2 className="font-minecraft-bold text-2xl text-mc-brown mb-4 flex items-center gap-2">
          <HelpCircle className="w-6 h-6" />
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-gray-300 p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-mc-green border-2 border-black flex items-center justify-center">
                <span className="font-minecraft-bold text-white text-xs">1</span>
              </div>
              <div className="font-minecraft text-mc-green">STEP 1</div>
            </div>
            <p className="text-sm">Click "Start" on Text Analysis to begin</p>
          </div>
          <div className="border-2 border-gray-300 p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-mc-blue border-2 border-black flex items-center justify-center">
                <span className="font-minecraft-bold text-white text-xs">2</span>
              </div>
              <div className="font-minecraft text-mc-blue">STEP 2</div>
            </div>
            <p className="text-sm">Complete the interactive assessment</p>
          </div>
          <div className="border-2 border-gray-300 p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-mc-brown border-2 border-black flex items-center justify-center">
                <span className="font-minecraft-bold text-white text-xs">3</span>
              </div>
              <div className="font-minecraft text-mc-brown">STEP 3</div>
            </div>
            <p className="text-sm">Receive personalized insights and recommendations</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-400 p-6 mb-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-400 border-2 border-black flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-minecraft-bold text-xl text-yellow-800 mb-2">
              Important Note
            </h3>
            <p className="text-yellow-700">
              This assessment is for self-awareness and is not a substitute for professional medical advice.
              If you're in crisis, please contact a mental health professional immediately.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <MinecraftButton
                variant="danger"
                size="sm"
                onClick={() => {
                  play('click')
                  window.open('tel:9152987821', '_blank')
                }}
              >
                Crisis Helpline
              </MinecraftButton>
              
              <MinecraftButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  play('click')
                  alert('Professional help directory coming soon!')
                }}
              >
                Find Professional Help
              </MinecraftButton>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center">
        <div className="inline-block mb-4">
          <MinecraftButton
            onClick={handleBeginAll}
            variant="success"
            size="lg"
            icon={CheckCircle}
            iconPosition="right"
            disabled={allCompleted}
          >
            {allCompleted ? '✅ Assessment Complete!' : 'Begin Complete Assessment Journey'}
          </MinecraftButton>
        </div>
        <p className="text-gray-500 text-sm">
          All data is processed securely and anonymously. Your journey is private.
        </p>

        {allCompleted && (
          <div className="mt-6">
            <MinecraftButton
              onClick={handleViewRiskScore}
              variant="primary"
              size="lg"
              className="animate-pulse"
            >
              View Your Risk Score Analysis →
            </MinecraftButton>
          </div>
        )}
      </div>

      {/* Info Modal */}
      <MinecraftModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Begin Your Journey"
        type="info"
        confirmText="Start Now"
        onConfirm={handleConfirmStart}
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-block p-4 bg-gradient-to-b from-mc-green/20 to-mc-blue/20 border-2 border-mc-green rounded-lg mb-4">
              <span className="text-4xl">🎮</span>
            </div>
            
            <h3 className="font-minecraft-bold text-xl text-gray-800 mb-2">
              Ready to Start?
            </h3>
            
            <p className="text-gray-600">
              You're about to begin your mental wellness assessment journey. 
              Here's what to expect:
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mc-green border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="font-minecraft-bold text-white text-xs">1</span>
              </div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Text Analysis:</span> Share your thoughts through writing (5-7 min)
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mc-blue border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="font-minecraft-bold text-white text-xs">2</span>
              </div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Audio Analysis:</span> Upload audio recording of your voice (8-10 min)
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mc-brown border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="font-minecraft-bold text-white text-xs">3</span>
              </div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Video Analysis:</span> Upload video for facial emotion detection (10-12 min)
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm text-center">
              Total estimated time: 25-30 minutes • Complete at your own pace
            </p>
          </div>
        </div>
      </MinecraftModal>

      {/* Text Analysis Modal - Step 1 */}
      <TextAnalysisModal
        isOpen={showTextAnalysisModal}
        onClose={() => setShowTextAnalysisModal(false)}
        onComplete={handleTextAnalysisComplete}
      />

      {/* Audio Analysis Modal - Step 2 */}
      <AudioAnalysisModal
        isOpen={showAudioAnalysisModal}
        onClose={() => setShowAudioAnalysisModal(false)}
        onComplete={handleAudioAnalysisComplete}
      />

      {/* Video Analysis Modal - Step 3 */}
      <VideoAnalysisModal
        isOpen={showVideoAnalysisModal}
        onClose={() => setShowVideoAnalysisModal(false)}
        onComplete={handleVideoAnalysisComplete}
      />
    </div>
  )
}