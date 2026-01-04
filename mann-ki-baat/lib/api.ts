// api.ts - Complete API client for Mental Health Analysis
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface TextAnalysisRequest {
  text: string
  user_id?: string
  session_id?: string
  language?: string
}

export interface MentalHealthResources {
  emergency_helplines: Record<string, string>
  telemedicine_services: Record<string, string>
  government_resources: Record<string, string>
  regional_support: Record<string, string>
}

export interface AnalysisResponse {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_score: number
  confidence: number
  sentiment_scores: Record<string, number>
  detected_emotions: string[]
  keywords_found: string[]
  recommendations: string[]
  next_step: string
  analysis_timestamp: string
  session_id?: string
  model_used: string
  warning_flags: string[]
  mental_health_resources: MentalHealthResources
  context_notes: string[]
}

export interface AudioAnalysisResponse {
  status: string
  primary_emotion: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_score: number
  confidence: number
  detected_emotions: string[]
  emotion_probabilities: Record<string, number>
  recommendations: string[]
  model_used: string
  processing_time: number
  session_id?: string
  user_id?: string
  filename?: string
}

export interface VideoAnalysisResponse {
  status: string
  total_frames_analyzed: number
  duration: number
  processing_time: number
  summary: {
    most_frequent_emotion: string
    emotion_distribution: Record<string, number>
    emotional_stability: number
    risk_indicators: string[]
  }
  frame_results: Array<{
    frame_number: number
    timestamp: number
    emotions_detected: Record<string, number>
    dominant_emotion: string
  }>
  risk_assessment: {
    overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    risk_score: number
    concern_flags: string[]
  }
  recommendations: string[]
  model_used: string
  metadata?: {
    filename: string
    content_type: string
    frame_skip: number
    processed_at: string
  }
}

export interface CombinedAnalysisResponse {
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  overall_risk_score: number
  overall_confidence: number
  text_analysis?: AnalysisResponse | null
  audio_analysis?: AudioAnalysisResponse | null
  video_analysis?: VideoAnalysisResponse | null
  combined_emotions: string[]
  ai_recommendations: string[]
  personalized_advice: string
  next_steps: string[]
  emergency_resources: Record<string, string>
  analysis_timestamp: string
  models_used: Record<string, string>
  session_id?: string
}

export interface APIHealthStatus {
  status: string
  timestamp: string
  modules: {
    text_analyzer: {
      available: boolean
      initialized: boolean
    }
    audio_analyzer: {
      available: boolean
      initialized: boolean
    }
    video_analyzer: {
      available: boolean
      initialized: boolean
    }
    gemini_integrator: {
      available: boolean
      initialized: boolean
    }
  }
}

export interface ModelsInfo {
  text_models: {
    sentiment: string
    recommendations: string
    status: string
  }
  audio_models: {
    emotion_recognition: string
    status: string
  }
  video_models: {
    facial_emotion: string
    face_detection: string
    status: string
  }
  ai_integration: {
    final_recommendations: string
    status: string
  }
  python_version: string
}

export class SentimentAnalysisAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }



  /**
   * Analyze text with sentiment analysis
   */
  async analyzeText(request: TextAnalysisRequest): Promise<AnalysisResponse> {
    try {
      console.log('Sending text analysis request to:', `${this.baseURL}/analyze/text`)
      console.log('Request payload:', JSON.stringify(request, null, 2))
      
      const response = await fetch(`${this.baseURL}/analyze/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Text analysis failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
          console.error('API error details:', errorData)
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Text analysis successful:', result)
      return result
    } catch (error) {
      console.error('Text analysis error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to analyze text: ${error.message}`)
      }
      throw new Error('Failed to analyze text: Unknown error')
    }
  }

  /**
   * Analyze audio file for emotion detection
   */
  async analyzeAudio(
    audioFile: File,
    userId?: string,
    sessionId?: string
  ): Promise<AudioAnalysisResponse> {
    try {
      console.log('Sending audio analysis request to:', `${this.baseURL}/analyze/audio`)
      console.log('Audio file:', audioFile.name, audioFile.size, 'bytes')
      
      const formData = new FormData()
      formData.append('file', audioFile)
      if (userId) formData.append('user_id', userId)
      if (sessionId) formData.append('session_id', sessionId)

      const response = await fetch(`${this.baseURL}/analyze/audio`, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Audio analysis failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
          console.error('API error details:', errorData)
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Audio analysis successful:', result)
      return result
    } catch (error) {
      console.error('Audio analysis error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to analyze audio: ${error.message}`)
      }
      throw new Error('Failed to analyze audio: Unknown error')
    }
  }

  /**
   * Analyze video file for facial emotion detection
   */
  async analyzeVideo(
    videoFile: File,
    frameSkip: number = 10
  ): Promise<VideoAnalysisResponse> {
    try {
      console.log('Sending video analysis request to:', `${this.baseURL}/analyze/video`)
      console.log('Video file:', videoFile.name, videoFile.size, 'bytes')
      
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('frame_skip', frameSkip.toString())

      const response = await fetch(`${this.baseURL}/analyze/video`, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Video analysis failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
          console.error('API error details:', errorData)
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Video analysis successful:', result)
      return result
    } catch (error) {
      console.error('Video analysis error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to analyze video: ${error.message}`)
      }
      throw new Error('Failed to analyze video: Unknown error')
    }
  }

  /**
   * Perform combined multi-modal analysis
   */
  async analyzeCombined(
    text?: string,
    audioFile?: File,
    videoFile?: File,
    userId?: string,
    sessionId?: string
  ): Promise<CombinedAnalysisResponse> {
    try {
      console.log('Sending combined analysis request to:', `${this.baseURL}/analyze/combined`)
      
      const formData = new FormData()
      if (text) formData.append('text', text)
      if (audioFile) formData.append('audio_file', audioFile)
      if (videoFile) formData.append('video_file', videoFile)
      if (userId) formData.append('user_id', userId)
      if (sessionId) formData.append('session_id', sessionId)

      const response = await fetch(`${this.baseURL}/analyze/combined`, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Combined analysis failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
          console.error('API error details:', errorData)
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Combined analysis successful:', result)
      return result
    } catch (error) {
      console.error('Combined analysis error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to perform combined analysis: ${error.message}`)
      }
      throw new Error('Failed to perform combined analysis: Unknown error')
    }
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<APIHealthStatus> {
    try {
      console.log('Checking API health at:', `${this.baseURL}/health`)
      const response = await fetch(`${this.baseURL}/health`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      const data = await response.json()
      console.log('API health status:', data)
      return data
    } catch (error) {
      console.error('Health check error:', error)
      throw error
    }
  }

  /**
   * Get models information
   */
  async getModels(): Promise<ModelsInfo> {
    try {
      console.log('Fetching model info from:', `${this.baseURL}/models`)
      const response = await fetch(`${this.baseURL}/models`)
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }
      const data = await response.json()
      console.log('Models info:', data)
      return data
    } catch (error) {
      console.error('Failed to fetch model info:', error)
      throw error
    }
  }

  /**
   * Get mental health resources (if endpoint exists)
   */
  async getResources() {
    try {
      console.log('Fetching resources from:', `${this.baseURL}/resources`)
      const response = await fetch(`${this.baseURL}/resources`)
      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status}`)
      }
      const data = await response.json()
      console.log('Resources fetched:', data)
      return data
    } catch (error) {
      console.error('Failed to fetch mental health resources:', error)
      return null
    }
  }
}

export const sentimentAPI = new SentimentAnalysisAPI()