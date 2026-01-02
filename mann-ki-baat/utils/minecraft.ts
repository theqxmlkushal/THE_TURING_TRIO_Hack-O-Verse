import { MINECRAFT_COLORS } from './constants'

export class MinecraftUtils {
  // Convert hex color to Minecraft-like color with dithering
  static createMinecraftGradient(baseColor: string, direction: 'horizontal' | 'vertical' = 'horizontal'): string {
    const darkColor = this.darkenColor(baseColor, 20)
    
    if (direction === 'horizontal') {
      return `linear-gradient(to right, ${baseColor}, ${darkColor})`
    } else {
      return `linear-gradient(to bottom, ${baseColor}, ${darkColor})`
    }
  }

  static darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) - amt
    const G = (num >> 8 & 0x00FF) - amt
    const B = (num & 0x0000FF) - amt
    
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1)
  }

  static lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    
    return '#' + (
      0x1000000 +
      (R > 255 ? 255 : R) * 0x10000 +
      (G > 255 ? 255 : G) * 0x100 +
      (B > 255 ? 255 : B)
    ).toString(16).slice(1)
  }

  // Create block pattern background
  static createBlockPattern(type: 'grass' | 'dirt' | 'stone' | 'wood' | 'planks'): string {
    const patterns = {
      grass: `
        linear-gradient(45deg, ${MINECRAFT_COLORS.GRASS} 25%, ${MINECRAFT_COLORS.GRASS_DARK} 25%, ${MINECRAFT_COLORS.GRASS_DARK} 50%, 
        ${MINECRAFT_COLORS.GRASS} 50%, ${MINECRAFT_COLORS.GRASS} 75%, ${MINECRAFT_COLORS.GRASS_DARK} 75%, ${MINECRAFT_COLORS.GRASS_DARK})
      `,
      dirt: `
        linear-gradient(45deg, ${MINECRAFT_COLORS.DIRT} 25%, ${MINECRAFT_COLORS.DIRT_DARK} 25%, ${MINECRAFT_COLORS.DIRT_DARK} 50%, 
        ${MINECRAFT_COLORS.DIRT} 50%, ${MINECRAFT_COLORS.DIRT} 75%, ${MINECRAFT_COLORS.DIRT_DARK} 75%, ${MINECRAFT_COLORS.DIRT_DARK})
      `,
      stone: `
        linear-gradient(45deg, ${MINECRAFT_COLORS.STONE} 25%, ${MINECRAFT_COLORS.STONE_DARK} 25%, ${MINECRAFT_COLORS.STONE_DARK} 50%, 
        ${MINECRAFT_COLORS.STONE} 50%, ${MINECRAFT_COLORS.STONE} 75%, ${MINECRAFT_COLORS.STONE_DARK} 75%, ${MINECRAFT_COLORS.STONE_DARK})
      `,
      wood: `
        linear-gradient(45deg, ${MINECRAFT_COLORS.OAK} 25%, ${MINECRAFT_COLORS.OAK_DARK} 25%, ${MINECRAFT_COLORS.OAK_DARK} 50%, 
        ${MINECRAFT_COLORS.OAK} 50%, ${MINECRAFT_COLORS.OAK} 75%, ${MINECRAFT_COLORS.OAK_DARK} 75%, ${MINECRAFT_COLORS.OAK_DARK})
      `,
      planks: `
        linear-gradient(90deg, ${MINECRAFT_COLORS.OAK} 50%, ${MINECRAFT_COLORS.OAK_DARK} 50%)
      `
    }

    return `${patterns[type]}`
  }

  // Calculate block shadow
  static getBlockShadow(depth: number = 1): string {
    const shadows = []
    for (let i = 1; i <= depth; i++) {
      shadows.push(`${i}px ${i}px 0 rgba(0,0,0,0.3)`)
    }
    return shadows.join(', ')
  }

  static getBlockHighlight(): string {
    return `inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.3)`
  }

  // Generate random Minecraft username
  static generateUsername(): string {
    const prefixes = ['Mighty', 'Brave', 'Swift', 'Clever', 'Wise', 'Silent', 'Royal', 'Ancient']
    const suffixes = ['Warrior', 'Explorer', 'Builder', 'Miner', 'Crafter', 'Wizard', 'Knight', 'Dragon']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${suffix}${numbers}`
  }

  // Calculate XP needed for next level
  static calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  // Calculate level from XP
  static calculateLevelFromXP(xp: number): { level: number, progress: number, xpForNext: number } {
    let level = 1
    let xpNeeded = 0
    let totalXpNeeded = 0
    
    while (true) {
      xpNeeded = this.calculateXPForLevel(level)
      if (xp < totalXpNeeded + xpNeeded) {
        break
      }
      totalXpNeeded += xpNeeded
      level++
    }
    
    const xpIntoLevel = xp - totalXpNeeded
    const progress = (xpIntoLevel / xpNeeded) * 100
    
    return {
      level,
      progress,
      xpForNext: xpNeeded - xpIntoLevel
    }
  }

  // Format time in Minecraft style (e.g., "3d 5h 20m")
  static formatMinecraftTime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours % 24 > 0) parts.push(`${hours % 24}h`)
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`)
    if (seconds % 60 > 0 && days === 0 && hours === 0) parts.push(`${seconds % 60}s`)

    return parts.join(' ') || '0s'
  }

  // Generate achievement description
  static generateAchievementDescription(achievement: string): string {
    const descriptions = {
      'first_session': 'Complete your first mindfulness session!',
      'streak_3': 'Maintain a 3-day streak!',
      'streak_7': 'Maintain a 7-day streak!',
      'streak_30': 'Maintain a 30-day streak!',
      'master_mindfulness': 'Complete all mindfulness games!',
      'anxiety_conqueror': 'Complete all anxiety relief games!',
      'focus_master': 'Complete all focus games!',
      'sleep_expert': 'Complete all sleep improvement games!',
      'community_helper': 'Help 10 other users!',
      'explorer': 'Try every type of game!',
      'dedicated': 'Complete 100 sessions!',
      'legendary': 'Reach level 10!',
    }

    return descriptions[achievement as keyof typeof descriptions] || 'New achievement unlocked!'
  }

  // Create inventory-like item display
  static createInventorySlot(item: string, count: number = 1): string {
    const items: Record<string, { emoji: string, color: string }> = {
      'heart': { emoji: '❤️', color: MINECRAFT_COLORS.REDSTONE },
      'brain': { emoji: '🧠', color: MINECRAFT_COLORS.DIAMOND },
      'star': { emoji: '⭐', color: MINECRAFT_COLORS.GOLD },
      'book': { emoji: '📚', color: MINECRAFT_COLORS.OAK },
      'potion': { emoji: '🧪', color: MINECRAFT_COLORS.EMERALD },
      'compass': { emoji: '🧭', color: MINECRAFT_COLORS.IRON },
      'clock': { emoji: '⏰', color: MINECRAFT_COLORS.GOLD },
      'treasure': { emoji: '💎', color: MINECRAFT_COLORS.DIAMOND },
    }

    const itemData = items[item] || { emoji: '❓', color: MINECRAFT_COLORS.STONE }
    
    return `
      <div style="
        display: inline-block;
        width: 40px;
        height: 40px;
        background: ${this.createMinecraftGradient(itemData.color)};
        border: 2px solid black;
        position: relative;
        margin: 2px;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px;
        ">
          ${itemData.emoji}
        </div>
        ${count > 1 ? `
          <div style="
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: black;
            color: white;
            font-size: 10px;
            padding: 1px 3px;
            border-radius: 2px;
            font-family: monospace;
          ">
            ${count}
          </div>
        ` : ''}
      </div>
    `
  }

  // Generate random world seed
  static generateWorldSeed(): string {
    const adjectives = ['Peaceful', 'Serene', 'Calm', 'Tranquil', 'Quiet', 'Gentle', 'Soothing']
    const nouns = ['Meadow', 'Forest', 'Valley', 'Grove', 'Garden', 'Sanctuary', 'Haven']
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${adjective}${noun}${numbers}`
  }

  // Calculate session score
  static calculateSessionScore(accuracy: number, timeSpent: number, difficulty: string): number {
    const difficultyMultiplier = {
      'easy': 1.0,
      'medium': 1.5,
      'hard': 2.0
    }[difficulty] || 1.0

    const timeBonus = Math.max(0, 1 - (timeSpent / 600)) // Bonus for completing faster
    const accuracyBonus = accuracy / 100
    
    return Math.floor((accuracyBonus * 100 + timeBonus * 50) * difficultyMultiplier)
  }

  // Get biome color based on mood
  static getBiomeForMood(mood: number): { name: string, color: string, emoji: string } {
    if (mood >= 80) return { name: 'Sunflower Plains', color: MINECRAFT_COLORS.GRASS, emoji: '🌻' }
    if (mood >= 60) return { name: 'Cherry Grove', color: '#FFB7C5', emoji: '🌸' }
    if (mood >= 40) return { name: 'Forest', color: MINECRAFT_COLORS.LEAVES, emoji: '🌳' }
    if (mood >= 20) return { name: 'Taiga', color: '#5D8AA8', emoji: '🌲' }
    return { name: 'Snowy Tundra', color: MINECRAFT_COLORS.ICE, emoji: '❄️' }
  }
}

// Utility functions for React components
export const minecraft = {
  // Create CSS for block button
  createBlockButtonCSS: (color: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: { padding: '8px 16px', fontSize: '12px' },
      md: { padding: '12px 24px', fontSize: '14px' },
      lg: { padding: '16px 32px', fontSize: '16px' }
    }

    return `
      display: inline-block;
      padding: ${sizes[size].padding};
      font-family: 'Minecraft', monospace;
      font-size: ${sizes[size].fontSize};
      font-weight: bold;
      color: white;
      text-align: center;
      text-decoration: none;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
      background: ${MinecraftUtils.createMinecraftGradient(color)};
      border: 4px solid black;
      cursor: pointer;
      position: relative;
      transition: all 0.1s ease;
      
      &:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
      }
      
      &:active {
        transform: translateY(1px);
        filter: brightness(0.9);
      }
      
      &:before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
        border: 2px solid rgba(255,255,255,0.2);
        pointer-events: none;
      }
    `
  },

  // Create CSS for block card
  createBlockCardCSS: (backgroundColor: string) => {
    return `
      background: ${MinecraftUtils.createMinecraftGradient(backgroundColor, 'vertical')};
      border: 4px solid black;
      position: relative;
      padding: 16px;
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255,255,255,0.3);
      }
      
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(0,0,0,0.3);
      }
    `
  },

  // Create CSS for progress bar
  createProgressBarCSS: (color: string, height: string = '20px') => {
    return `
      height: ${height};
      background: rgba(0,0,0,0.3);
      border: 2px solid black;
      position: relative;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: ${MinecraftUtils.createMinecraftGradient(color)};
        transition: width 0.5s ease;
        position: relative;
        
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
        }
        
        &:after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 2px;
          background: white;
          animation: pulse 1s infinite;
        }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `
  }
}