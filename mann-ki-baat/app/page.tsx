'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, Trophy, Users, Target } from 'lucide-react'
import MinecraftButton from '@/components/MinecraftButton'
import ResourceCard from '@/components/ResourceCard'
import ProgressBar from '@/components/ProgressBar'
import PixelArt from '@/components/PixelArt'
import MinecraftModal from '@/components/MinecraftModal'
import { useSounds } from '@/lib/sounds'

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const { play } = useSounds()

  const handleStartTest = () => {
    play('game_start')
    // Navigation would happen here
    window.location.href = '/test'
  }

  const handleCardClick = (title: string) => {
    play('click')
    alert(`Starting ${title}...`)
  }

  const categories = [
    {
      id: 'games',
      title: 'Mental Health Rehabilitation Games',
      description: 'Minecraft-themed therapeutic games designed for mental wellness',
      items: [
        {
          title: 'Mindful Crafting',
          description: 'Craft virtual items while practicing mindfulness techniques',
          category: 'game' as const,
          thumbnailColor: '#5B7C3A',
          progress: 25,
          duration: '15-20 min',
          difficulty: 'easy' as const,
          tags: ['Mindfulness', 'Focus', 'Relaxation']
        },
        {
          title: 'Anxiety Adventure',
          description: 'Navigate through calming Minecraft worlds to manage anxiety',
          category: 'game' as const,
          thumbnailColor: '#7EC0EE',
          progress: 0,
          duration: '20-30 min',
          difficulty: 'medium' as const,
          tags: ['Anxiety', 'Calming', 'Adventure']
        },
        {
          title: 'Emotion Blocks',
          description: 'Identify and organize emotions using block-building mechanics',
          category: 'game' as const,
          thumbnailColor: '#8B7355',
          progress: 75,
          duration: '10-15 min',
          difficulty: 'easy' as const,
          tags: ['Emotions', 'Self-awareness', 'Therapy']
        }
      ]
    },
    {
      id: 'exercises',
      title: 'Mindfulness Exercises',
      description: 'Breathing exercises and focus activities for daily practice',
      items: [
        {
          title: 'Square Breathing',
          description: '4-4-4-4 breathing technique with visual guides',
          category: 'exercise' as const,
          thumbnailColor: '#4A90E2',
          progress: 50,
          duration: '5-10 min',
          difficulty: 'easy' as const,
          tags: ['Breathing', 'Calm', 'Focus']
        },
        {
          title: 'Grounding 5-4-3-2-1',
          description: 'Sensory grounding exercise in virtual nature',
          category: 'exercise' as const,
          thumbnailColor: '#7EC0EE',
          progress: 100,
          duration: '8-12 min',
          difficulty: 'easy' as const,
          tags: ['Grounding', 'Anxiety', 'Present']
        },
        {
          title: 'Focus Building',
          description: 'Build structures to improve concentration',
          category: 'exercise' as const,
          thumbnailColor: '#5B7C3A',
          progress: 30,
          duration: '15-20 min',
          difficulty: 'medium' as const,
          tags: ['Focus', 'ADHD', 'Productivity']
        }
      ]
    },
    {
      id: 'yoga',
      title: 'Yoga for Mental Wellness',
      description: 'Gentle yoga sessions for stress relief and mental clarity',
      items: [
        {
          title: 'Morning Calm Flow',
          description: 'Start your day with peaceful Minecraft sunrise yoga',
          category: 'yoga' as const,
          thumbnailColor: '#FFD700',
          progress: 0,
          duration: '20-25 min',
          difficulty: 'easy' as const,
          tags: ['Morning', 'Energy', 'Calm']
        },
        {
          title: 'Anxiety Relief Poses',
          description: 'Specific asanas to reduce anxiety symptoms',
          category: 'yoga' as const,
          thumbnailColor: '#98FB98',
          progress: 60,
          duration: '15-20 min',
          difficulty: 'medium' as const,
          tags: ['Anxiety', 'Stress', 'Relief']
        },
        {
          title: 'Sleep Preparation',
          description: 'Evening routine for better sleep quality',
          category: 'yoga' as const,
          thumbnailColor: '#4B0082',
          progress: 40,
          duration: '25-30 min',
          difficulty: 'hard' as const,
          tags: ['Sleep', 'Relaxation', 'Evening']
        }
      ]
    },
    {
      id: 'audio',
      title: 'Soothing Audio & Meditation Tunes',
      description: 'Minecraft-inspired calming music and meditation guides',
      items: [
        {
          title: 'Forest Ambience',
          description: 'Calming Minecraft forest sounds for meditation',
          category: 'audio' as const,
          thumbnailColor: '#228B22',
          progress: 100,
          duration: '30-45 min',
          difficulty: 'easy' as const,
          tags: ['Nature', 'Meditation', 'Calm']
        },
        {
          title: 'Ocean Meditation',
          description: 'Gentle ocean waves with soft piano melodies',
          category: 'audio' as const,
          thumbnailColor: '#1E90FF',
          progress: 80,
          duration: '20-30 min',
          difficulty: 'easy' as const,
          tags: ['Ocean', 'Sleep', 'Meditation']
        },
        {
          title: 'Cave Serenity',
          description: 'Deep cave echoes with calming drips and hums',
          category: 'audio' as const,
          thumbnailColor: '#696969',
          progress: 20,
          duration: '15-20 min',
          difficulty: 'medium' as const,
          tags: ['Ambient', 'Focus', 'Deep']
        }
      ]
    }
  ]

  const stats = [
    { label: 'Active Users', value: '2,847', icon: Users, color: 'text-mc-green' },
    { label: 'Sessions Completed', value: '15,892', icon: Trophy, color: 'text-mc-yellow' },
    { label: 'Success Rate', value: '94%', icon: Target, color: 'text-mc-blue' },
    { label: 'Avg. Improvement', value: '68%', icon: Sparkles, color: 'text-mc-green' }
  ]

  return (
    <div className="space-y-16">
      {/* Welcome Modal */}
      <MinecraftModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        title="Welcome to Mann ki Baat!"
        type="success"
        confirmText="Start Journey"
        onConfirm={() => {
          play('game_start')
          setShowWelcomeModal(false)
        }}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-center my-4">
            <PixelArt type="heart" size={80} animated />
          </div>
          
          <div className="text-center space-y-3">
            <h3 className="font-minecraft-bold text-2xl text-gray-800">
              Aapka mann aapka saathi
            </h3>
            
            <p className="text-gray-600">
              Welcome to your Minecraft-themed mental wellness journey! 
              Our gamified platform combines therapy with the familiar, 
              comforting world of Minecraft to help you build a healthier mind.
            </p>
            
            <div className="bg-gradient-to-r from-mc-green/20 to-mc-blue/20 border-2 border-mc-green p-4 rounded">
              <h4 className="font-minecraft-bold text-mc-green mb-2">🎮 How it works:</h4>
              <ul className="text-left space-y-1 text-sm text-gray-700">
                <li>• Complete assessments to understand your mental state</li>
                <li>• Play therapeutic games designed by mental health experts</li>
                <li>• Track your progress with Minecraft-style achievements</li>
                <li>• Join a supportive community of fellow travelers</li>
              </ul>
            </div>
            
            <div className="pt-4">
              <div className="font-minecraft text-gray-500 text-sm">
                Ready to build a better you?
              </div>
            </div>
          </div>
        </div>
      </MinecraftModal>

      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(45deg, #5B7C3A 25%, transparent 25%),
              linear-gradient(-45deg, #5B7C3A 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #5B7C3A 75%),
              linear-gradient(-45deg, transparent 75%, #5B7C3A 75%)
            `,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 0 16px, 16px -16px, -16px 0px'
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          {/* Logo Animation */}
          <div className="mb-8 animate-pulse-slow">
            <div className="inline-block p-2 border-4 border-black bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow">
              <PixelArt type="brain" size={100} animated />
            </div>
          </div>
          
          {/* Title */}
          <div className="mb-6">
            <div className="inline-block border-4 border-black bg-white/95 px-8 py-6 mb-4">
              <h1 className="font-minecraft-bold text-4xl md:text-6xl mb-4">
                <span className="text-mc-green">Mann</span>{' '}
                <span className="text-mc-brown">ki</span>{' '}
                <span className="text-mc-blue">Baat</span>
              </h1>
              <p className="font-minecraft text-2xl text-mc-dark-brown">
                Aapka mann aapka saathi
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mb-10">
            <p className="text-xl mb-6 font-semibold text-gray-800">
              Test your mental health now
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="animate-pulse-glow">
                <MinecraftButton
                  onClick={handleStartTest}
                  variant="success"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Start Test
                </MinecraftButton>
              </div>
              
              <MinecraftButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  play('click')
                  document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Explore Games
              </MinecraftButton>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-b from-white to-gray-100 border-4 border-black p-4"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="font-minecraft text-gray-600 text-sm">
                      {stat.label}
                    </span>
                  </div>
                  <div className="font-minecraft-bold text-2xl md:text-3xl text-gray-800">
                    {stat.value}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-mc-brown to-mc-dark-brown border-4 border-black p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="font-minecraft-bold text-3xl text-white mb-2">3</div>
              <div className="font-minecraft text-white/80">Simple Steps</div>
            </div>
            <div className="text-center">
              <div className="font-minecraft-bold text-3xl text-white mb-2">24/7</div>
              <div className="font-minecraft text-white/80">Available Support</div>
            </div>
            <div className="text-center">
              <div className="font-minecraft-bold text-3xl text-white mb-2">100%</div>
              <div className="font-minecraft text-white/80">Confidential</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Sections */}
      {categories.map((category) => (
        <section key={category.id} id={category.id} className="container mx-auto px-4">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-3 h-8 bg-gradient-to-b from-mc-green to-mc-dark-green"></div>
              <h2 className="font-minecraft-bold text-3xl text-gray-800">
                {category.title}
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl">{category.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.items.map((item, index) => (
              <ResourceCard
                key={index}
                title={item.title}
                description={item.description}
                category={item.category}
                thumbnailColor={item.thumbnailColor}
                progress={item.progress}
                duration={item.duration}
                difficulty={item.difficulty}
                tags={item.tags}
                onStart={() => handleCardClick(item.title)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden border-4 border-black">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow opacity-90"></div>
          
          {/* Content */}
          <div className="relative p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-minecraft-bold text-3xl md:text-4xl text-white mb-4">
                Ready to Begin Your Wellness Journey?
              </h2>
              
              <p className="text-white/90 mb-8 text-lg">
                Join thousands who have found peace and balance through our 
                gamified mental health platform. Your journey to better mental 
                health starts with a single click.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MinecraftButton
                  href="/test"
                  variant="success"
                  size="lg"
                  onClick={() => play('game_start')}
                >
                  Start Assessment Now
                </MinecraftButton>
                
                <MinecraftButton
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    play('click')
                    alert('Coming soon: Community features!')
                  }}
                >
                  Join Community
                </MinecraftButton>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/70 text-sm">
                  All data is processed securely and anonymously. 
                  Your privacy is our priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}