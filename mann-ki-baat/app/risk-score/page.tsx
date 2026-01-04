// /app/risk-score/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart3, Heart, Brain, Activity, AlertTriangle, CheckCircle, Download, Share2, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MinecraftButton from '@/components/MinecraftButton'
import ProgressBar from '@/components/ProgressBar'
import { useSounds } from '@/lib/sounds'

interface CombinedAnalysis {
  overallRisk: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  textAnalysis: {
    score: number
    primaryEmotion: string
    confidence: number
  }
  audioAnalysis: {
    score: number
    primaryEmotion: string
    confidence: number
  }
  videoAnalysis?: {
    score: number
    primaryEmotion: string
    confidence: number
  }
  timestamp: string
  recommendations: string[]
  insights: string[]
}

export default function RiskScorePage() {
  const router = useRouter()
  const { play } = useSounds()
  const [analysis, setAnalysis] = useState<CombinedAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed assessment
    const isCompleted = sessionStorage.getItem('assessmentCompleted')
    if (!isCompleted) {
      // Redirect back to test page if not completed
      router.push('/test')
      return
    }

    // Simulate loading analysis data
    setTimeout(() => {
      // In real implementation, this would come from your backend API
      const mockAnalysis: CombinedAnalysis = {
        overallRisk: 68.5,
        riskLevel: 'HIGH',
        textAnalysis: {
          score: 72,
          primaryEmotion: 'Anxiety',
          confidence: 0.85
        },
        audioAnalysis: {
          score: 65,
          primaryEmotion: 'Stress',
          confidence: 0.78
        },
        videoAnalysis: {
          score: 70,
          primaryEmotion: 'Tension',
          confidence: 0.82
        },
        timestamp: new Date().toISOString(),
        recommendations: [
          'Consider practicing daily mindfulness meditation for 10-15 minutes',
          'Schedule regular breaks during work to reduce stress levels',
          'Connect with a support group or mental health professional',
          'Maintain a consistent sleep schedule of 7-8 hours per night',
          'Engage in physical activity for at least 30 minutes daily'
        ],
        insights: [
          'Text analysis shows strong patterns of anxious thinking',
          'Voice tone indicates elevated stress levels',
          'Facial expressions suggest ongoing tension',
          'Consistent patterns across all three assessment methods',
          'Recommend follow-up assessment in 2-4 weeks'
        ]
      }

      // Try to get real data from localStorage
      try {
        const textResults = localStorage.getItem('step1TextResults')
        const audioResults = localStorage.getItem('step2AudioResults')
        const videoResults = localStorage.getItem('step3VideoResults')

        if (textResults) {
          const parsed = JSON.parse(textResults)
          mockAnalysis.textAnalysis.score = parsed.risk_score || mockAnalysis.textAnalysis.score
          mockAnalysis.textAnalysis.primaryEmotion = parsed.primary_emotion || mockAnalysis.textAnalysis.primaryEmotion
          mockAnalysis.textAnalysis.confidence = parsed.confidence || mockAnalysis.textAnalysis.confidence
        }

        if (audioResults) {
          const parsed = JSON.parse(audioResults)
          mockAnalysis.audioAnalysis.score = parsed.risk_score || mockAnalysis.audioAnalysis.score
          mockAnalysis.audioAnalysis.primaryEmotion = parsed.primary_emotion || mockAnalysis.audioAnalysis.primaryEmotion
          mockAnalysis.audioAnalysis.confidence = parsed.confidence || mockAnalysis.audioAnalysis.confidence
        }

        // Recalculate overall risk based on individual scores
        const scores = [
          mockAnalysis.textAnalysis.score,
          mockAnalysis.audioAnalysis.score,
          mockAnalysis.videoAnalysis?.score || mockAnalysis.textAnalysis.score // fallback
        ].filter(score => score !== undefined)
        
        if (scores.length > 0) {
          mockAnalysis.overallRisk = scores.reduce((sum, score) => sum + score, 0) / scores.length
          
          // Determine risk level
          if (mockAnalysis.overallRisk >= 80) mockAnalysis.riskLevel = 'CRITICAL'
          else if (mockAnalysis.overallRisk >= 60) mockAnalysis.riskLevel = 'HIGH'
          else if (mockAnalysis.overallRisk >= 40) mockAnalysis.riskLevel = 'MEDIUM'
          else mockAnalysis.riskLevel = 'LOW'
        }
      } catch (error) {
        console.error('Error parsing stored results:', error)
      }

      setAnalysis(mockAnalysis)
      setIsLoading(false)
      // play('achievement')
    }, 1000)
  }, [router])

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

  const handleDownloadReport = () => {
    play('click')
    // In real implementation, this would generate a PDF report
    alert('Downloading comprehensive report... This feature generates a PDF with your complete analysis.')
  }

  const handleShareInsights = () => {
    play('click')
    // In real implementation, this would share with healthcare provider
    alert('Sharing insights with healthcare provider... This feature securely shares your anonymized results.')
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-mc-green mx-auto mb-4"></div>
          <h2 className="font-minecraft-bold text-2xl text-gray-800 mb-2">
            Analyzing Your Results...
          </h2>
          <p className="text-gray-600">
            Calculating your comprehensive mental health risk score
          </p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-mc-yellow mx-auto mb-4" />
          <h2 className="font-minecraft-bold text-2xl text-gray-800 mb-2">
            No Analysis Data Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please complete the assessment to view your risk score
          </p>
          <Link href="/test">
            <MinecraftButton variant="primary" size="lg">
              Go to Assessment
            </MinecraftButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Back Navigation */}
      <div className="mb-8 flex justify-between items-center">
        <Link 
          href="/test" 
          className="inline-flex items-center gap-2 font-minecraft text-mc-brown hover:text-mc-green transition-colors group"
          onClick={() => play('click')}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO ASSESSMENT
        </Link>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-minecraft text-mc-blue hover:text-mc-green transition-colors group"
          onClick={() => play('click')}
        >
          <Home className="w-4 h-4" />
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
              Your Risk Score Analysis
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive analysis of your mental wellbeing based on all three assessment methods
            </p>
          </div>
          
          {/* Decorative Corners */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-mc-green border-2 border-black rotate-45"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-mc-blue border-2 border-black rotate-45"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-mc-brown border-2 border-black rotate-45"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-mc-yellow border-2 border-black rotate-45"></div>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className={`border-4 p-8 mb-8 ${
        analysis.riskLevel === 'CRITICAL' ? 'bg-red-50 border-mc-red' :
        analysis.riskLevel === 'HIGH' ? 'bg-orange-50 border-mc-orange' :
        analysis.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-mc-yellow' :
        'bg-green-50 border-mc-green'
      }`}>
        <div className="text-center">
          <div className="text-8xl mb-4">{getRiskEmoji(analysis.riskLevel)}</div>
          <h2 className="font-minecraft-bold text-4xl mb-2">
            Overall Risk: {analysis.riskLevel}
          </h2>
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-minecraft text-lg">Risk Score</span>
              <span className="font-minecraft-bold text-2xl">{analysis.overallRisk.toFixed(1)}/100</span>
            </div>
            <ProgressBar
              value={analysis.overallRisk}
              max={100}
              size="lg"
              showLabel={false}
            />
          </div>
          <p className="text-gray-700">
            Based on combined analysis of text, audio, and video assessments
          </p>
        </div>
      </div>

      {/* Individual Assessment Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Text Analysis */}
        <div className="bg-white border-4 border-mc-green p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-mc-green border-2 border-black">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-minecraft-bold text-xl">Text Analysis</h3>
          </div>
          <div className="mb-4">
            <div className="text-center mb-3">
              <span className="font-minecraft-bold text-3xl text-mc-green">
                {analysis.textAnalysis.score.toFixed(1)}
              </span>
              <span className="text-gray-600">/100</span>
            </div>
            <ProgressBar
              value={analysis.textAnalysis.score}
              max={100}
              size="md"
              showLabel={false}
            />
          </div>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Primary Emotion:</span>{' '}
              <span className="capitalize">{analysis.textAnalysis.primaryEmotion}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Confidence:</span>{' '}
              {(analysis.textAnalysis.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Audio Analysis */}
        <div className="bg-white border-4 border-mc-blue p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-mc-blue border-2 border-black">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-minecraft-bold text-xl">Voice Analysis</h3>
          </div>
          <div className="mb-4">
            <div className="text-center mb-3">
              <span className="font-minecraft-bold text-3xl text-mc-blue">
                {analysis.audioAnalysis.score.toFixed(1)}
              </span>
              <span className="text-gray-600">/100</span>
            </div>
            <ProgressBar
              value={analysis.audioAnalysis.score}
              max={100}
              size="md"
              showLabel={false}
            />
          </div>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Primary Emotion:</span>{' '}
              <span className="capitalize">{analysis.audioAnalysis.primaryEmotion}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Confidence:</span>{' '}
              {(analysis.audioAnalysis.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Video Analysis */}
        <div className="bg-white border-4 border-mc-purple p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-mc-purple border-2 border-black">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-minecraft-bold text-xl">Video Analysis</h3>
          </div>
          <div className="mb-4">
            <div className="text-center mb-3">
              <span className="font-minecraft-bold text-3xl text-mc-purple">
                {analysis.videoAnalysis?.score.toFixed(1) || 'N/A'}
              </span>
              <span className="text-gray-600">/100</span>
            </div>
            {analysis.videoAnalysis && (
              <>
                <ProgressBar
                  value={analysis.videoAnalysis.score}
                  max={100}
                  size="md"
                  showLabel={false}
                />
                <div className="space-y-2 mt-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Primary Emotion:</span>{' '}
                    <span className="capitalize">{analysis.videoAnalysis.primaryEmotion}</span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Confidence:</span>{' '}
                    {(analysis.videoAnalysis.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black p-6 mb-8">
        <h2 className="font-minecraft-bold text-2xl text-mc-brown mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Key Insights
        </h2>
        <div className="space-y-3">
          {analysis.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 bg-white border-2 border-gray-300 p-4">
              <div className="w-6 h-6 bg-mc-green border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="font-minecraft-bold text-white text-xs">{index + 1}</span>
              </div>
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-b from-green-50 to-blue-50 border-4 border-mc-green p-6 mb-8">
        <h2 className="font-minecraft-bold text-2xl text-mc-green mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          Personalized Recommendations
        </h2>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mc-blue border-2 border-black flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-minecraft-bold text-white text-xs">{index + 1}</span>
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
        <MinecraftButton
          onClick={handleDownloadReport}
          variant="primary"
          size="lg"
          icon={Download}
          className="flex-1 md:flex-none"
        >
          Download Full Report
        </MinecraftButton>
        
        <MinecraftButton
          onClick={handleShareInsights}
          variant="secondary"
          size="lg"
          icon={Share2}
          className="flex-1 md:flex-none"
        >
          Share with Professional
        </MinecraftButton>
        
        <Link href="/test" className="flex-1 md:flex-none">
          <MinecraftButton
            variant="success"
            size="lg"
            onClick={() => play('click')}
          >
            Retake Assessment
          </MinecraftButton>
        </Link>
      </div>

      {/* Safety Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-400 p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-400 border-2 border-black flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-minecraft-bold text-xl text-yellow-800 mb-2">
              Important Safety Note
            </h3>
            <p className="text-yellow-700 mb-4">
              This risk score is based on AI analysis and is for informational purposes only. 
              It is not a medical diagnosis. If you're experiencing mental health challenges, 
              please seek help from a qualified healthcare professional.
            </p>
            <MinecraftButton
              variant="danger"
              size="sm"
              onClick={() => {
                play('click')
                window.open('tel:9152987821', '_blank')
              }}
            >
              Immediate Crisis Support
            </MinecraftButton>
          </div>
        </div>
      </div>
    </div>
  )
}