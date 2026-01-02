# 🎮 Mann ki Baat - Minecraft Mental Health Platform

## 📋 Project Overview

**Mann ki Baat** (Aapka mann aapka saathi) is a Minecraft-themed mental health rehabilitation platform that combines gamification with therapeutic exercises in a comforting, familiar gaming interface.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git (optional)

### Step 1: Clone or Create Project
```bash
# Option A: Clone existing project
git clone <your-repo-url> mann-ki-baat
cd mann-ki-baat

# Option B: Create fresh Next.js project
npx create-next-app@latest mann-ki-baat --typescript --tailwind --app --no-eslint
cd mann-ki-baat
```

### Step 2: Install Dependencies
```bash
# Install required packages
npm install lucide-react

# Optional: Clean install
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Project Structure Setup
```bash
# Create directory structure
mkdir -p public/audio components hooks lib styles types utils
```

### Step 4: Copy Project Files
Copy all the provided code files to their respective directories:

```
📦 mann-ki-baat
├── 📁 app
│   ├── layout.tsx
│   ├── page.tsx
│   ├── test/
│   │   └── page.tsx
│   └── globals.css
├── 📁 components
│   ├── AudioToggle.tsx
│   ├── Header.tsx
│   ├── MinecraftButton.tsx
│   ├── MinecraftModal.tsx
│   ├── PixelArt.tsx
│   ├── ProgressBar.tsx
│   ├── ResourceCard.tsx
│   └── StepCard.tsx
├── 📁 hooks
│   ├── useAudio.ts
│   └── useMinecraftAnimation.ts
├── 📁 lib
│   └── sounds.ts
├── 📁 types
│   └── index.ts
├── 📁 utils
│   ├── audio.ts
│   ├── constants.ts
│   └── minecraft.ts
├── tailwind.config.js
├── next.config.js
├── postcss.config.js
├── package.json
└── tsconfig.json
```

### Step 5: Configuration Files

#### **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mc-green': '#5CAD4A',
        'mc-dark-green': '#3B7C2F',
        'mc-brown': '#8B7355',
        'mc-dark-brown': '#6B4F32',
        'mc-gray': '#9C9C9C',
        'mc-dark-gray': '#6D6D6D',
        'mc-blue': '#3D7EAA',
        'mc-dark-blue': '#2A5C8A',
        'mc-red': '#B02E26',
        'mc-yellow': '#FED83D',
        'mc-dirt': '#9C7C5A',
        'mc-grass': '#7CBD6B',
        'mc-stone': '#A0A0A0',
        'mc-wood': '#AB8B65',
        'mc-water': '#3A7EAA',
        'mc-sky': '#7EC0EE',
      },
      fontFamily: {
        'minecraft': ['Minecraft', 'monospace'],
        'minecraft-bold': ['Minecraft-Bold', 'monospace'],
        'minecraft-ten': ['Minecraft-Ten', 'monospace'],
      },
      animation: {
        'block-break': 'block-break 0.5s ease-out',
        'block-place': 'block-place 0.3s ease-out',
        'pixel-bounce': 'pixel-bounce 0.5s ease-in-out',
        'item-spin': 'item-spin 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'minecraft-load': 'minecraft-load 1s ease-in-out infinite',
        'float': 'float 10s linear infinite',
      },
    },
  },
  plugins: [],
}
```

#### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
}

module.exports = nextConfig
```

#### **postcss.config.js**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### **package.json**
```json
{
  "name": "mann-ki-baat",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
```

### Step 6: Add Audio Files
Place your Minecraft ambient audio files in `public/audio/`:

```bash
# Create audio directory
mkdir -p public/audio

# Place your audio files here:
# - minecraft-ambient.mp3 (main background music)
# - minecraft-ambient.ogg (fallback format)
# - Any other calming sounds
```

**Recommended audio sources:**
1. Minecraft soundtrack by C418
2. Calming nature sounds
3. Ambient forest/ocean sounds

### Step 7: Start Development Server
```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
npm install

# Start development
npm run dev
```

## 🎯 Features Checklist

### ✅ Core Features
- [ ] Minecraft-themed UI with pixel art
- [ ] Audio system with ambient music toggle
- [ ] Mental health assessment flow (3 steps)
- [ ] Resource library with games and exercises
- [ ] Progress tracking system
- [ ] Responsive design for mobile/desktop

### ✅ UI Components
- [ ] Minecraft-style buttons with 3D effects
- [ ] Block cards for resources
- [ ] Progress bars with XP system
- [ ] Modals for notifications
- [ ] Pixel art illustrations
- [ ] Audio visualizer

### ✅ Pages
- [ ] Home page with hero section
- [ ] Assessment test page
- [ ] Resource categories
- [ ] Progress dashboard
- [ ] Settings page

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. **Client Component Error**
```
'client-only' cannot be imported from a Server Component module
```
**Solution:** Make sure all components using React hooks have `'use client'` at the top.

#### 2. **Audio Not Playing**
- Check if audio files exist in `public/audio/`
- Ensure browser permissions for audio
- Check console for CORS errors

#### 3. **Fonts Not Loading**
- Check internet connection for CDN fonts
- Use fallback fonts in CSS
- Consider downloading fonts locally

#### 4. **Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next node_modules/.cache
npm run build
```

## 🎨 Customization Guide

### Change Colors
Edit `tailwind.config.js` to modify Minecraft color palette:

```javascript
colors: {
  'mc-green': '#YOUR_COLOR',
  // ... other colors
}
```

### Add New Resource Categories
Edit `app/page.tsx` categories array:

```typescript
const categories = [
  {
    id: 'new-category',
    title: 'New Category',
    description: 'Description here',
    items: [...]
  }
]
```

### Modify Audio Settings
Edit `hooks/useAudio.ts`:
- Change default volume
- Modify audio sources
- Add new sound effects

### Add New Games
1. Create new game component in `components/`
2. Add to resource categories in `app/page.tsx`
3. Update types in `types/index.ts`

## 📱 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build for Production
```bash
# Build project
npm run build

# Start production server
npm start
```

## 🗂️ File Structure Details

```
📦 mann-ki-baat
├── 📁 app/                    # Next.js 14 App Router
│   ├── layout.tsx           # Root layout with audio toggle
│   ├── page.tsx            # Home page with all resources
│   ├── test/               # Assessment flow
│   │   └── page.tsx       # Test page
│   └── globals.css        # Global styles and animations
├── 📁 components/           # Reusable UI components
│   ├── AudioToggle.tsx    # Audio control with visualizer
│   ├── Header.tsx         # Navigation header
│   ├── MinecraftButton.tsx # 3D Minecraft buttons
│   ├── MinecraftModal.tsx  # Popup modals
│   ├── PixelArt.tsx       # 8-bit pixel art generator
│   ├── ProgressBar.tsx    # XP/health progress bars
│   ├── ResourceCard.tsx   # Game/exercise cards
│   └── StepCard.tsx       # Assessment step cards
├── 📁 hooks/               # Custom React hooks
│   ├── useAudio.ts        # Audio playback hook
│   └── useMinecraftAnimation.ts # Animation utilities
├── 📁 lib/                 # Library code
│   └── sounds.ts          # Sound effect manager
├── 📁 types/               # TypeScript definitions
│   └── index.ts           # All type definitions
├── 📁 utils/               # Utility functions
│   ├── audio.ts           # Audio management
│   ├── constants.ts       # Game constants and config
│   └── minecraft.ts       # Minecraft-specific utilities
└── 📁 public/              # Static assets
    ├── audio/             # Audio files
    └── images/            # Image assets
```

## 🎮 Game Features

### Mental Health Games
1. **Mindful Crafting** - Mindfulness through virtual crafting
2. **Anxiety Adventure** - Navigate calming Minecraft worlds
3. **Emotion Blocks** - Identify and organize emotions
4. **Focus Building** - Improve concentration through building

### Assessment Types
1. **Text Analysis** - Write about feelings
2. **Voice Analysis** - Speak your thoughts
3. **Video Analysis** - Comprehensive emotional analysis

### Progress System
- XP points for completed sessions
- Achievement badges
- Daily streaks
- Level progression

## 🔒 Privacy & Security

- All data processed locally
- No personal data storage required
- Encrypted audio processing
- Optional cloud sync

## 📞 Support & Resources

### Crisis Helpline: 9152987821
- 24/7 mental health support
- Professional therapist directory
- Self-help resources
- Community support groups

## 🚀 Performance Optimization

### Build Optimizations
```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
# Use next/image for automatic optimization
```

### Audio Optimization
- Use OGG format for better compression
- Implement lazy loading for audio
- Use Web Audio API for better performance

## 📝 License

This project is open-source for educational purposes. For commercial use, please contact the developers.

## 🙏 Acknowledgements

- Minecraft for UI inspiration
- C418 for Minecraft soundtrack
- Mental health professionals for therapeutic content
- Open-source community for tools and libraries

---

## 🆘 Need Help?

### Common Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Fix linting issues
npm run lint
```

### Contact Support
- GitHub Issues for bugs
- Email: support@mannkibaat.com
- Discord Community: [Link]

---

**Remember:** This platform is for self-awareness and is not a substitute for professional medical advice. If you're in crisis, please contact a mental health professional immediately.

**Aapka mann aapka saathi** 💚