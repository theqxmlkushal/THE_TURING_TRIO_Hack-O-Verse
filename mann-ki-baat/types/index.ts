// Component Props
export interface MinecraftButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

export interface ResourceCardProps {
  title: string
  description: string
  category: 'game' | 'exercise' | 'yoga' | 'audio' | 'meditation' | 'education'
  thumbnailColor: string
  progress?: number
  duration?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  onStart?: () => void
}

export interface StepCardProps {
  step: number
  title: string
  description: string
  type: 'text' | 'voice' | 'video'
  status: 'locked' | 'unlocked' | 'completed'
  estimatedTime?: string
  onStart?: () => void
}

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'health' | 'experience' | 'stamina' | 'custom'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  className?: string
}

export interface PixelArtProps {
  type: 'heart' | 'brain' | 'tree' | 'sun' | 'moon' | 'star' | 'flower' | 'cloud' | 'custom'
  size?: number
  animated?: boolean
  colors?: string[]
  customPixels?: number[][]
  className?: string
}

export interface MinecraftModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface AudioToggleProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
}

// Game Types
export interface GameSession {
  id: string
  title: string
  category: string
  duration: number
  difficulty: string
  completed: boolean
  score?: number
  date: Date
}

export interface AssessmentResult {
  id: string
  type: 'text' | 'voice' | 'video'
  score: number
  insights: string[]
  recommendations: string[]
  date: Date
}

export interface UserProgress {
  totalSessions: number
  completedGames: number
  streakDays: number
  averageScore: number
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  dateUnlocked?: Date
}

// Audio Types
export interface AudioConfig {
  src: string
  volume: number
  loop: boolean
  preload?: 'auto' | 'metadata' | 'none'
}

// Theme Types
export interface MinecraftTheme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    success: string
    warning: string
    error: string
  }
  fonts: {
    primary: string
    secondary: string
    pixel: string
  }
  spacing: {
    block: string
    halfBlock: string
    quarterBlock: string
  }
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Form Types
export interface AssessmentFormData {
  textResponse?: string
  audioFile?: File
  videoFile?: File
  mood: number
  stressLevel: number
  additionalNotes?: string
}

// Utility Types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & {
  createdAt: Date
  updatedAt: Date
}

// Enums
export enum GameCategory {
  MINDFULNESS = 'mindfulness',
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  FOCUS = 'focus',
  SLEEP = 'sleep'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum AssessmentType {
  TEXT = 'text',
  VOICE = 'voice',
  VIDEO = 'video'
}

export enum UserRole {
  USER = 'user',
  THERAPIST = 'therapist',
  ADMIN = 'admin'
}