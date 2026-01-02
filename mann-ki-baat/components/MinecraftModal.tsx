'use client'

import React, { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react'
import MinecraftButton from './MinecraftButton'

interface MinecraftModalProps {
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

export default function MinecraftModal({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCloseButton = true,
  size = 'md'
}: MinecraftModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const typeConfig = {
    info: { icon: Info, color: 'bg-mc-blue', border: 'border-mc-blue' },
    success: { icon: CheckCircle, color: 'bg-mc-green', border: 'border-mc-green' },
    warning: { icon: AlertCircle, color: 'bg-mc-yellow', border: 'border-mc-yellow' },
    error: { icon: AlertCircle, color: 'bg-mc-red', border: 'border-mc-red' },
    confirm: { icon: HelpCircle, color: 'bg-mc-brown', border: 'border-mc-brown' }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

  const Icon = typeConfig[type].icon

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Modal Container */}
      <div className={`relative ${sizeClasses[size]} w-full animate-block-place`}>
        {/* Outer Border */}
        <div className="absolute -inset-2 bg-gradient-to-r from-mc-brown via-mc-gray to-mc-dark-brown border-4 border-black"></div>
        
        {/* Inner Container */}
        <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black p-1">
          {/* Header */}
          <div className={`border-b-4 border-black p-4 ${typeConfig[type].color} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/20 border-2 border-black">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-minecraft-bold text-2xl text-white">{title}</h2>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 bg-black/30 border-2 border-black hover:bg-black/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="border-t-4 border-black p-4 bg-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              {(type === 'confirm' || type === 'warning') && (
                <MinecraftButton
                  variant="secondary"
                  onClick={handleCancel}
                  size="sm"
                >
                  {cancelText}
                </MinecraftButton>
              )}
              
              <MinecraftButton
                variant={type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'}
                onClick={type === 'confirm' || type === 'warning' ? handleConfirm : onClose}
                size="sm"
              >
                {type === 'confirm' || type === 'warning' ? confirmText : 'Close'}
              </MinecraftButton>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-mc-brown border-2 border-black rotate-45"></div>
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-mc-brown border-2 border-black rotate-45"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-mc-brown border-2 border-black rotate-45"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-mc-brown border-2 border-black rotate-45"></div>
        </div>
      </div>
    </div>
  )
}