'use client'

import Link from 'next/link'
import { Brain, Home, ClipboardCheck, Gamepad2 } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const menuItems = [
    { label: 'HOME', href: '/', icon: Home },
    { label: 'ASSESSMENT', href: '/test', icon: ClipboardCheck },
    { label: 'GAMES', href: '#games', icon: Gamepad2 },
    { label: 'MINDFULNESS', href: '#exercises', icon: Brain },
    // { label: 'PROGRESS', href: '#progress', icon: Brain },
    // { label: 'COMMUNITY', href: '#community', icon: Brain },
  ]

  return (
    <header className="relative bg-gradient-to-r from-mc-dirt to-mc-brown border-b-4 border-black shadow-lg">
      {/* Top border decoration */}
      <div className="h-2 bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow"></div>
      
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group relative"
            onClick={() => setMenuOpen(false)}
          >
            {/* Animated background block */}
            <div className="absolute -inset-2 bg-mc-green/20 rounded-lg group-hover:animate-pulse-glow"></div>
            
            {/* Minecraft block logo */}
            <div className="relative z-10">
              <div className="w-14 h-14 border-4 border-black bg-gradient-to-b from-mc-blue to-mc-dark-blue flex items-center justify-center group-hover:animate-pixel-bounce">
                <Brain className="w-8 h-8 text-white" />
                {/* Block shine effect */}
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/40 to-transparent"></div>
              </div>
            </div>
            
            {/* Text */}
            <div className="relative z-10">
              <h1 className="font-minecraft-bold text-3xl text-white tracking-wide">
                <span className="text-mc-yellow">Mann</span>
                <span className="text-mc-green"> ki</span>
                <span className="text-mc-blue"> Baat</span>
              </h1>
              <p className="font-minecraft text-sm text-white/90 mt-1">
                Aapka mann aapka saathi
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group"
                >
                  <div className="relative">
                    {/* Button shadow */}
                    <div className="absolute inset-0 bg-black translate-y-1 translate-x-1 border-2 border-black"></div>
                    
                    {/* Main button */}
                    <div className="
                      relative bg-gradient-to-b from-mc-gray to-mc-dark-gray 
                      border-2 border-black px-4 py-2
                      group-hover:bg-gradient-to-b from-mc-green to-mc-dark-green
                      transition-all duration-200
                      group-hover:-translate-y-0.5 group-hover:-translate-x-0.5
                    ">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-white" />
                        <span className="font-minecraft text-white text-sm">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/90 border-2 border-mc-green px-3 py-1 whitespace-nowrap">
                      <span className="font-minecraft text-white text-xs">
                        Go to {item.label.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative"
          >
            <div className="relative">
              {/* Button shadow */}
              <div className="absolute inset-0 bg-black translate-y-1 translate-x-1 border-2 border-black"></div>
              
              {/* Main button */}
              <div className="relative bg-gradient-to-b from-mc-gray to-mc-dark-gray border-2 border-black px-4 py-2">
                <span className="font-minecraft text-white text-sm">
                  MENU
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-mc-brown to-mc-dark-brown border-t-4 border-black z-40 animate-block-place">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="relative"
                  >
                    <div className="relative">
                      {/* Button shadow */}
                      <div className="absolute inset-0 bg-black translate-y-1 translate-x-1 border-2 border-black"></div>
                      
                      {/* Main button */}
                      <div className="relative bg-gradient-to-b from-mc-gray to-mc-dark-gray border-2 border-black p-3 text-center group-hover:bg-gradient-to-b from-mc-green to-mc-dark-green transition-colors">
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="w-5 h-5 text-white" />
                          <span className="font-minecraft text-white text-xs">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}