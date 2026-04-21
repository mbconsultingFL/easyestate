'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface AddressSuggestion {
  id: string
  label: string
  sublabel: string
  value: string
}

interface AddressInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  disabled?: boolean
  validation?: {
    pattern?: RegExp
    message?: string
    required?: boolean
  }
  /** Two-letter state code (e.g. "NY") to bias autocomplete results */
  stateCode?: string
}

/**
 * Address field with live suggestion dropdown.
 *
 * Debounces keystrokes and hits /api/address/suggest (an OpenStreetMap
 * Nominatim proxy). Picking a suggestion replaces the value; typing freely and
 * hitting Enter still works so users can always submit an address Nominatim
 * didn't return.
 */
export default function AddressInput({
  placeholder,
  onSubmit,
  disabled,
  validation,
  stateCode,
}: AddressInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // Set to true for a single render cycle after a suggestion is picked so the
  // change-triggered refetch doesn't immediately reopen the dropdown.
  const [justPicked, setJustPicked] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Debounced fetch of suggestions.
  useEffect(() => {
    if (justPicked) {
      setJustPicked(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const query = value.trim()
    if (query.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const ctl = new AbortController()
      abortRef.current = ctl
      try {
        const params = new URLSearchParams({ q: query })
        if (stateCode) params.set('state', stateCode)
        const res = await fetch(
          `/api/address/suggest?${params.toString()}`,
          { signal: ctl.signal },
        )
        if (!res.ok) return
        const data = (await res.json()) as { suggestions: AddressSuggestion[] }
        setSuggestions(data.suggestions || [])
        setOpen((data.suggestions || []).length > 0)
        setActiveIndex(-1)
      } catch {
        // aborted or network error — silently drop; the user can still type.
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Close dropdown on outside click.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

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

  const pickSuggestion = (s: AddressSuggestion) => {
    setValue(s.value)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
    setJustPicked(true)
    setError(null)
    inputRef.current?.focus()
  }

  const submit = () => {
    if (disabled) return
    const trimmed = value.trim()
    if (!trimmed) return
    if (!validate(trimmed)) return
    onSubmit(trimmed)
    setValue('')
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (open && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => (i + 1) % suggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1))
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setActiveIndex(-1)
        return
      }
      if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          e.preventDefault()
          pickSuggestion(suggestions[activeIndex])
          return
        }
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mb-3 sm:mb-4 relative"
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          onFocus={e => {
            if (!error) e.currentTarget.style.borderColor = '#007AFF'
            if (suggestions.length > 0) setOpen(true)
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? '#FF3B30' : '#F0F0F0'
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type your answer...'}
          disabled={disabled}
          autoComplete="street-address"
          aria-autocomplete="list"
          aria-expanded={open}
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
          autoFocus
        />
        <button
          type="button"
          onClick={submit}
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

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 mt-1 z-20 overflow-hidden"
          style={{
            background: '#fff',
            border: '1px solid #F0F0F0',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            maxWidth: 'calc(100% - 52px)',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={e => {
                // mousedown (not click) so the input's onBlur doesn't fire
                // first and close the dropdown before we pick.
                e.preventDefault()
                pickSuggestion(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: '10px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                background: i === activeIndex ? '#F5F9FF' : '#fff',
                borderTop: i === 0 ? 'none' : '1px solid #F5F5F5',
              }}
            >
              <div style={{ color: '#1A1A1A', fontWeight: 500 }}>{s.label}</div>
              <div style={{ color: '#9A9A9A', fontSize: '11px', marginTop: 2 }}>{s.sublabel}</div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-xs mt-1.5 ml-1" style={{ color: '#FF3B30' }}>{error}</p>
      )}
    </motion.div>
  )
}
