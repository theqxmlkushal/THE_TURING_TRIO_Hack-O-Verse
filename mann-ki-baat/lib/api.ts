const API_BASE_URL = 'https://mkb-text-based-analysis.onrender.com'

export interface TextAnalysisRequest {
  text: string
  user_id?: string
  session_id?: string
  language?: 'english' | 'hindi_mixed' | 'regional'
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

export class SentimentAnalysisAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async analyzeText(request: TextAnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || error.error || 'Analysis failed')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to analyze text: ${error.message}`)
      }
      throw new Error('Failed to analyze text: Unknown error')
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  async getResources() {
    try {
      const response = await fetch(`${this.baseURL}/resources`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch mental health resources:', error)
      return null
    }
  }
}

export const sentimentAPI = new SentimentAnalysisAPI()
