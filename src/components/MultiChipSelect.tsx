'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface MultiChipSelectProps {
  options: { label: string; value: string }[]
  /** Emits a comma-separated list of selected values */
  onSubmit: (value: string) => void
  disabled?: boolean
  minSelections?: number
}

/**
 * Multi-select chip group.
 *
 * Unlike AnswerChips (which auto-submits on a single tap), this lets the user
 * toggle several chips on/off and then confirms with a Continue button. It
 * emits a comma-separated string of the selected option values — same shape
 * the flow engine stores in `answers.family_situation` — so the chat replay
 * and branching helpers can parse it uniformly.
 */
export default function MultiChipSelect({
  options,
  onSubmit,
  disabled,
  minSelections = 1,
}: MultiChipSelectProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (value: string) => {
    if (disabled) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const canSubmit = !disabled && selected.size >= minSelections

  const handleSubmit = () => {
    if (!canSubmit) return
    // Preserve the option order so the rendered chat bubble reads naturally.
    const ordered = options
      .map(o => o.value)
      .filter(v => selected.has(v))
      .join(',')
    onSubmit(ordered)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mb-3 sm:mb-4"
    >
      <div className="flex flex-wrap gap-2 justify-end">
        {options.map(option => {
          const isOn = selected.has(option.value)
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              disabled={disabled}
              className="touch-manipulation transition-all active:scale-95"
              style={{
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '-0.1px',
                borderRadius: '28px',
                border: `1.5px solid ${isOn ? '#007AFF' : '#F0F0F0'}`,
                background: disabled ? '#F5F5F5' : isOn ? '#E8F2FF' : '#fff',
                color: disabled ? '#9A9A9A' : isOn ? '#007AFF' : '#1A1A1A',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isOn && (
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8.5 6.5 12 13 5" />
                </svg>
              )}
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="touch-manipulation transition-opacity"
          style={{
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '14px',
            border: 'none',
            background: canSubmit ? '#007AFF' : '#E0E0E0',
            color: '#fff',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          Continue{selected.size > 0 ? ` (${selected.size})` : ''}
        </button>
      </div>
    </motion.div>
  )
}
