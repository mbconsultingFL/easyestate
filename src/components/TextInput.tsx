'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface TextInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  disabled?: boolean
  validation?: {
    pattern?: RegExp
    message?: string
    required?: boolean
  }
}

export default function TextInput({ placeholder, onSubmit, disabled, validation }: TextInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validate = (v: string): boolean => {
    if (!validation) return true
    if (validation.required && !v.trim()) {
      setError('This field is required')
      return false
    }
    if (validation.pattern && !validation.pattern.test(v.trim())) {
      setError(validation.message || 'Invalid input')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    const trimmed = value.trim()
    if (!trimmed) return
    if (!validate(trimmed)) return
    onSubmit(trimmed)
    setValue('')
    setError(null)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="mb-3 sm:mb-4"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(null) }}
          placeholder={placeholder || 'Type your answer...'}
          disabled={disabled}
          className="flex-1 outline-none"
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'inherit',
            border: `1.5px solid ${error ? '#FF3B30' : '#F0F0F0'}`,
            borderRadius: '14px',
            color: '#1A1A1A',
            background: disabled ? '#F9F9F9' : '#fff',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = '#007AFF' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#FF3B30' : '#F0F0F0' }}
          autoFocus
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="touch-manipulation transition-opacity"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            border: 'none',
            background: disabled || !value.trim() ? '#E0E0E0' : '#007AFF',
            color: '#fff',
            fontSize: '18px',
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="10" x2="15" y2="10" /><polyline points="10 5 15 10 10 15" />
          </svg>
        </button>
      </div>
      {error && (
        <p className="text-xs mt-1.5 ml-1" style={{ color: '#FF3B30' }}>{error}</p>
      )}
    </motion.form>
  )
}
