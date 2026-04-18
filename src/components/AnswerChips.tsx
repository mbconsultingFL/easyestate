'use client'

import { motion } from 'framer-motion'

interface AnswerChipsProps {
  options: { label: string; value: string }[]
  onSelect: (value: string) => void
  disabled?: boolean
}

export default function AnswerChips({ options, onSelect, disabled }: AnswerChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mb-3 sm:mb-4 justify-end"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !disabled && onSelect(option.value)}
          disabled={disabled}
          className="touch-manipulation transition-all active:scale-95"
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '-0.1px',
            borderRadius: '28px',
            border: '1.5px solid #F0F0F0',
            background: disabled ? '#F5F5F5' : '#fff',
            color: disabled ? '#9A9A9A' : '#1A1A1A',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = '#007AFF'
              e.currentTarget.style.background = '#E8F2FF'
              e.currentTarget.style.color = '#007AFF'
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = '#F0F0F0'
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.color = '#1A1A1A'
            }
          }}
        >
          {option.label}
        </button>
      ))}
    </motion.div>
  )
}
