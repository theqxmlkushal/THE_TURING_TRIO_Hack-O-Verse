import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import AudioToggle from '@/components/AudioToggle'
import LoadingScreen from '@/components/LoadingScreen'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Mann ki Baat - Minecraft Mental Wellness',
  description: 'A gamified Minecraft-themed mental health rehabilitation platform',
  keywords: ['mental health', 'minecraft', 'therapy', 'gamification', 'wellness'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload audio */}
        <link rel="preload" href="/audio/minecraft-ambient.mp3" as="audio" type="audio/mpeg" />
        <link rel="preload" href="/audio/minecraft-ambient.ogg" as="audio" type="audio/ogg" />
        
        {/* Minecraft favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧱</text></svg>" />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-mc-sky via-blue-100 to-emerald-50 font-minecraft pixelated">
        <div className="min-h-screen flex flex-col">
          {/* Minecraft-style background grid */}
          <div className="fixed inset-0 opacity-5 pointer-events-none bg-grid" />
          
          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col">
            <Suspense fallback={
              <LoadingScreen 
                isLoading={true}
                progress={50}
                message="Initializing Minecraft UI..."
              />
            }>
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              
              {/* Footer */}
              <footer className="relative bg-gradient-to-r from-mc-brown to-mc-dark-brown border-t-4 border-black mt-12">
                {/* Top border */}
                <div className="h-2 bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow"></div>
                
                <div className="container mx-auto px-4 py-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <div className="font-minecraft-bold text-xl text-white mb-2">
                        Mann ki Baat
                      </div>
                      <p className="font-minecraft text-white/80 text-sm">
                        Aapka mann aapka saathi
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex gap-4 mb-3 justify-center">
                        {['🏠', '🎮', '🧠', '🎵', '📊'].map((icon, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 border-2 border-black bg-gradient-to-b from-mc-gray to-mc-dark-gray flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                          >
                            <span className="text-lg">{icon}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-minecraft text-white/60 text-xs">
                        © 2024 Mann ki Baat. All rights reserved.
                      </p>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="font-minecraft text-white/90 text-sm mb-2">
                        Need Help?
                      </div>
                      <button className="font-minecraft text-white text-xs bg-gradient-to-b from-mc-red to-#A02020 border-2 border-black px-4 py-2 hover:brightness-110 transition-all">
                        CRISIS SUPPORT
                      </button>
                    </div>
                  </div>
                </div>
              </footer>
            </Suspense>
          </div>
          
          {/* Audio Control */}
          <AudioToggle position="bottom-right" />
          
          {/* Ambient Particles */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 border-2 border-black"
                style={{
                  backgroundColor: i % 3 === 0 ? '#7CBD6B' : i % 3 === 1 ? '#9C7C5A' : '#3A7EAA',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${10 + Math.random() * 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: 0.1
                }}
              />
            ))}
          </div>
        </div>
      </body>
    </html>
  )
}