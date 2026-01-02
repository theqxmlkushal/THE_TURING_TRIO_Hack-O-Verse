// Minecraft Color Palette
export const MINECRAFT_COLORS = {
  // Grass & Nature
  GRASS: '#7CBD6B',
  GRASS_DARK: '#5CAD4A',
  GRASS_DARKER: '#3B7C2F',
  LEAVES: '#5B7C3A',
  LEAVES_DARK: '#4A6B2F',
  
  // Dirt & Earth
  DIRT: '#9C7C5A',
  DIRT_DARK: '#8B7355',
  DIRT_DARKER: '#6B4F32',
  SAND: '#E6D7A8',
  SAND_DARK: '#D4C097',
  
  // Stone & Minerals
  STONE: '#A0A0A0',
  STONE_DARK: '#7F7F7F',
  STONE_DARKER: '#5A5A5A',
  COBBLESTONE: '#7F7F7F',
  COBBLESTONE_DARK: '#6D6D6D',
  
  // Ore & Gems
  COAL: '#1A1A1A',
  IRON: '#D8D8D8',
  GOLD: '#FFD700',
  DIAMOND: '#4FC3F7',
  EMERALD: '#00E676',
  REDSTONE: '#FF0000',
  LAPIS: '#1E5EB8',
  
  // Wood
  OAK: '#AB8B65',
  OAK_DARK: '#8B7355',
  SPRUCE: '#7A5C3A',
  BIRCH: '#F0E6D2',
  JUNGLE: '#B88765',
  ACACIA: '#D4A15F',
  DARK_OAK: '#4C3B27',
  
  // Water & Ice
  WATER: '#3A7EAA',
  WATER_DARK: '#2A5C8A',
  ICE: '#A0E0FF',
  PACKED_ICE: '#80C0FF',
  BLUE_ICE: '#60A0FF',
  
  // Sky & Atmosphere
  SKY: '#7EC0EE',
  SKY_DARK: '#3D7EAA',
  CLOUDS: '#FFFFFF',
  NIGHT_SKY: '#0C0C1C',
  SUN: '#FFD83D',
  MOON: '#F0F0F0',
  
  // Nether
  NETHERRACK: '#6A0000',
  SOUL_SAND: '#4A3728',
  GLOWSTONE: '#FFBC5C',
  NETHER_BRICK: '#2A0808',
  
  // End
  END_STONE: '#E0E0A0',
  PURPUR: '#A040A0',
  END_ROD: '#F0F0FF',
  
  // UI & Interface
  UI_BACKGROUND: '#C6C6C6',
  UI_BORDER: '#8B8B8B',
  UI_HIGHLIGHT: '#FFFFFF',
  UI_SHADOW: '#555555',
  TEXT: '#FFFFFF',
  TEXT_DARK: '#000000',
  TEXT_SHADOW: '#00000080',
} as const

// Game Categories
export const GAME_CATEGORIES = [
  { id: 'mindfulness', label: 'Mindfulness Games', color: MINECRAFT_COLORS.GRASS, icon: '🧠' },
  { id: 'anxiety', label: 'Anxiety Relief', color: MINECRAFT_COLORS.SKY, icon: '🌀' },
  { id: 'depression', label: 'Depression Support', color: MINECRAFT_COLORS.DIAMOND, icon: '💎' },
  { id: 'focus', label: 'Focus & ADHD', color: MINECRAFT_COLORS.GOLD, icon: '🎯' },
  { id: 'sleep', label: 'Sleep Improvement', color: MINECRAFT_COLORS.MOON, icon: '🌙' },
  { id: 'stress', label: 'Stress Management', color: MINECRAFT_COLORS.EMERALD, icon: '🌿' },
  { id: 'anger', label: 'Anger Management', color: MINECRAFT_COLORS.REDSTONE, icon: '⚡' },
  { id: 'social', label: 'Social Anxiety', color: MINECRAFT_COLORS.WATER, icon: '👥' },
] as const

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { level: 'easy', label: 'Easy', color: MINECRAFT_COLORS.GRASS, time: '5-10 min' },
  { level: 'medium', label: 'Medium', color: MINECRAFT_COLORS.GOLD, time: '10-20 min' },
  { level: 'hard', label: 'Hard', color: MINECRAFT_COLORS.REDSTONE, time: '20-30 min' },
] as const

// Assessment Types
export const ASSESSMENT_TYPES = [
  { type: 'text', label: 'Text Analysis', icon: '📝', color: MINECRAFT_COLORS.GRASS, description: 'Write about your feelings' },
  { type: 'voice', label: 'Voice Analysis', icon: '🎤', color: MINECRAFT_COLORS.SKY, description: 'Speak your thoughts' },
  { type: 'video', label: 'Video Analysis', icon: '📹', color: MINECRAFT_COLORS.DIAMOND, description: 'Video emotional analysis' },
] as const

// Progress Milestones
export const PROGRESS_MILESTONES = [
  { level: 1, label: 'Beginner', xp: 0, color: MINECRAFT_COLORS.DIRT, icon: '🪵' },
  { level: 2, label: 'Explorer', xp: 100, color: MINECRAFT_COLORS.STONE, icon: '⛏️' },
  { level: 3, label: 'Builder', xp: 250, color: MINECRAFT_COLORS.IRON, icon: '🔨' },
  { level: 4, label: 'Crafter', xp: 500, color: MINECRAFT_COLORS.GOLD, icon: '⚒️' },
  { level: 5, label: 'Artisan', xp: 1000, color: MINECRAFT_COLORS.DIAMOND, icon: '💎' },
  { level: 6, label: 'Master', xp: 2000, color: MINECRAFT_COLORS.EMERALD, icon: '👑' },
  { level: 7, label: 'Legend', xp: 5000, color: MINECRAFT_COLORS.NETHER_BRICK, icon: '🔥' },
] as const

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'consistency', label: 'Consistency', color: MINECRAFT_COLORS.GRASS, icon: '📅' },
  { id: 'progress', label: 'Progress', color: MINECRAFT_COLORS.DIAMOND, icon: '📈' },
  { id: 'mastery', label: 'Mastery', color: MINECRAFT_COLORS.GOLD, icon: '🏆' },
  { id: 'community', label: 'Community', color: MINECRAFT_COLORS.SKY, icon: '👥' },
  { id: 'exploration', label: 'Exploration', color: MINECRAFT_COLORS.EMERALD, icon: '🧭' },
] as const

// Daily Check-in Questions
export const DAILY_CHECKIN_QUESTIONS = [
  "How are you feeling today?",
  "What's one thing you're grateful for?",
  "How well did you sleep last night?",
  "What's your energy level today?",
  "Any particular thoughts on your mind?",
  "How connected do you feel to others?",
  "What are you looking forward to today?",
] as const

// Mental Health Resources
export const MENTAL_HEALTH_RESOURCES = [
  {
    title: 'Crisis Helpline',
    number: '9152987821',
    description: '24/7 mental health support',
    color: MINECRAFT_COLORS.REDSTONE,
    icon: '🚨'
  },
  {
    title: 'Therapist Directory',
    url: 'https://example.com/therapists',
    description: 'Find professional help',
    color: MINECRAFT_COLORS.SKY,
    icon: '👨‍⚕️'
  },
  {
    title: 'Self-Help Guides',
    url: 'https://example.com/guides',
    description: 'Guided self-help resources',
    color: MINECRAFT_COLORS.GRASS,
    icon: '📚'
  },
  {
    title: 'Support Groups',
    url: 'https://example.com/groups',
    description: 'Join supportive communities',
    color: MINECRAFT_COLORS.DIAMOND,
    icon: '👥'
  },
] as const

// Game Mechanics Constants
export const GAME_CONSTANTS = {
  XP_PER_SESSION: 10,
  XP_BONUS_STREAK: 5,
  MAX_STREAK_DAYS: 7,
  SESSION_COOLDOWN: 3600000, // 1 hour in milliseconds
  DAILY_GOAL: 3,
  WEEKLY_GOAL: 15,
  MONTHLY_GOAL: 60,
} as const

// Audio Constants
export const AUDIO_CONSTANTS = {
  DEFAULT_VOLUME: 0.3,
  MAX_VOLUME: 1.0,
  MIN_VOLUME: 0.0,
  FADE_DURATION: 1000, // milliseconds
  AMBIENT_SOURCES: [
    '/audio/minecraft-ambient.mp3',
    '/audio/minecraft-ambient.ogg',
    '/audio/calm-forest.mp3',
    '/audio/gentle-rain.mp3',
  ],
  SOUND_EFFECTS: {
    CLICK: '/audio/click.mp3',
    SUCCESS: '/audio/success.mp3',
    ERROR: '/audio/error.mp3',
    ACHIEVEMENT: '/audio/achievement.mp3',
    GAME_START: '/audio/game-start.mp3',
  },
} as const

// UI Constants
export const UI_CONSTANTS = {
  BLOCK_SIZE: 16,
  HALF_BLOCK: 8,
  QUARTER_BLOCK: 4,
  BORDER_WIDTH: 4,
  SHADOW_OFFSET: 2,
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  Z_INDEX: {
    MODAL: 1000,
    TOOLTIP: 900,
    HEADER: 800,
    FOOTER: 700,
  },
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'mann-ki-baat-progress',
  GAME_STATS: 'mann-ki-baat-stats',
  USER_SETTINGS: 'mann-ki-baat-settings',
  SESSION_HISTORY: 'mann-ki-baat-sessions',
  ACHIEVEMENTS: 'mann-ki-baat-achievements',
  ASSESSMENT_RESULTS: 'mann-ki-baat-assessment-results',
} as const

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  ASSESSMENTS: '/api/assessments',
  GAMES: '/api/games',
  PROGRESS: '/api/progress',
  ACHIEVEMENTS: '/api/achievements',
  USERS: '/api/users',
  SESSIONS: '/api/sessions',
  ANALYTICS: '/api/analytics',
} as const