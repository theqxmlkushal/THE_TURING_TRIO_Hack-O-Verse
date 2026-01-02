'use client'

import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface MinecraftButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

export default function MinecraftButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false
}: MinecraftButtonProps) {
  // Variant styles
  const variantClasses = {
    primary: 'bg-gradient-to-b from-mc-green to-mc-dark-green hover:from-green-600 hover:to-green-800',
    secondary: 'bg-gradient-to-b from-mc-brown to-mc-dark-brown hover:from-yellow-700 hover:to-yellow-900',
    danger: 'bg-gradient-to-b from-mc-red to-#A02020 hover:from-red-600 hover:to-red-800',
    success: 'bg-gradient-to-b from-mc-blue to-mc-dark-blue hover:from-blue-600 hover:to-blue-800',
    warning: 'bg-gradient-to-b from-mc-yellow to-#D4A017 hover:from-yellow-500 hover:to-yellow-700'
  }

  // Size styles
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const baseClasses = `
    relative font-minecraft font-bold
    border-4 border-black
    text-white text-center cursor-pointer
    transition-all duration-150
    hover:brightness-110 hover:scale-105
    active:scale-95 active:brightness-90
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  // 3D effect styles
  const buttonContent = (
    <div className="relative">
      {/* Button shadow */}
      <div className="absolute inset-0 bg-black translate-y-2 translate-x-2"></div>
      
      {/* Main button */}
      <div className={`
        relative border-2 border-black px-6 py-3
        flex items-center justify-center gap-2
        ${disabled ? 'bg-gray-500' : variantClasses[variant]}
        transition-all duration-200
        group-hover:-translate-y-0.5 group-hover:-translate-x-0.5
        ${loading ? 'opacity-70' : ''}
      `}>
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Icon */}
        {Icon && iconPosition === 'left' && (
          <Icon className={`w-5 h-5 ${loading ? 'opacity-0' : ''}`} />
        )}

        {/* Text */}
        <span className={`${loading ? 'opacity-0' : ''} text-shadow`}>
          {children}
        </span>

        {/* Icon */}
        {Icon && iconPosition === 'right' && (
          <Icon className={`w-5 h-5 ${loading ? 'opacity-0' : ''}`} />
        )}

        {/* Top highlight */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={`${baseClasses} inline-block ${disabled ? 'pointer-events-none' : ''}`}>
        {buttonContent}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {buttonContent}
    </button>
  )
}