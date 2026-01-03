'use client'

import React, { useEffect, useRef } from 'react'
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
  size?: 'sm' | 'md' | 'lg' | 'xl'
  maxHeight?: string // Optional max height prop
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
  size = 'md',
  maxHeight = '80vh' // Default max height
}: MinecraftModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const heightClasses = {
    sm: 'max-h-[60vh]',
    md: 'max-h-[70vh]',
    lg: 'max-h-[80vh]',
    xl: 'max-h-[90vh]'
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

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`relative ${sizeClasses[size]} w-full animate-block-place`}
        style={{ maxHeight: maxHeight }}
      >
        {/* Outer Border */}
        <div className="absolute -inset-2 bg-gradient-to-r from-mc-brown via-mc-gray to-mc-dark-brown border-4 border-black rounded"></div>
        
        {/* Inner Container */}
        <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-black p-1 h-full flex flex-col">
          {/* Header - Fixed */}
          <div className={`border-b-4 border-black p-4 ${typeConfig[type].color} flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/20 border-2 border-black">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-minecraft-bold text-2xl text-white">{title}</h2>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 bg-black/30 border-2 border-black hover:bg-black/50 transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Scrollable Content Area */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-6 min-h-0" // min-h-0 is important for flex scrolling
            style={{
              maxHeight: `calc(${maxHeight} - 160px)`, // Account for header and footer
            }}
          >
            <div className="space-y-4">
              {children}
            </div>
          </div>

          {/* Scrollbar styling for webkit browsers */}
          <style jsx global>{`
            .overflow-y-auto::-webkit-scrollbar {
              width: 12px;
            }
            .overflow-y-auto::-webkit-scrollbar-track {
              background: #d1d5db;
              border: 2px solid #000;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb {
              background: #5B7C3A;
              border: 2px solid #000;
              border-radius: 0;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb:hover {
              background: #4A6B2F;
            }
          `}</style>

          {/* Footer - Fixed */}
          <div className="border-t-4 border-black p-4 bg-gray-100 flex-shrink-0">
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