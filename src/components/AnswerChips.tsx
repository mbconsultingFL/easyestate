'use client'

import { motion } from 'framer-motion'

interface AnswerChipsProps {
  options: { label: string; value: string; description?: string }[]
  onSelect: (value: string) => void
  disabled?: boolean
}

/**
 * Single-select chip group.
 *
 * When ANY option carries a `description`, the whole group renders as
 * stacked cards (label on top, description below) instead of pill chips.
 * This keeps a uniform look for sets where some options need extra
 * context — splitting the layout per-chip would look uneven.
 */
export default function AnswerChips({ options, onSelect, disabled }: AnswerChipsProps) {
  const hasDescriptions = options.some((o) => !!o.description)

  if (hasDescriptions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col gap-2 mb-3 sm:mb-4 items-end"
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && onSelect(option.value)}
            disabled={disabled}
            className="touch-manipulation transition-all active:scale-[0.98] text-left"
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontFamily: 'inherit',
              borderRadius: '14px',
              border: '1.5px solid #F0F0F0',
              background: disabled ? '#F5F5F5' : '#fff',
              color: disabled ? '#9A9A9A' : '#1A1A1A',
              cursor: disabled ? 'not-allowed' : 'pointer',
              maxWidth: '320px',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = '#007AFF'
                e.currentTarget.style.background = '#F5F9FF'
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = '#F0F0F0'
                e.currentTarget.style.background = '#fff'
              }
            }}
          >
            <div style={{ fontWeight: 600, letterSpacing: '-0.1px' }}>
              {option.label}
            </div>
            {option.description && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: disabled ? '#B0B0B0' : '#6B7280',
                }}
              >
                {option.description}
              </div>
            )}
          </button>
        ))}
      </motion.div>
    )
  }

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
