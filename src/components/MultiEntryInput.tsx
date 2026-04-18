'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { EntryColumn } from '@/lib/flow-engine'

interface MultiEntryInputProps {
  columns: EntryColumn[]
  minRows?: number
  maxRows?: number
  addLabel?: string
  onSubmit: (value: string) => void
  disabled?: boolean
}

type Row = Record<string, string>

export default function MultiEntryInput({
  columns,
  minRows = 1,
  maxRows = 8,
  addLabel = '+ Add another',
  onSubmit,
  disabled,
}: MultiEntryInputProps) {
  const emptyRow = (): Row => Object.fromEntries(columns.map(c => [c.key, '']))
  const initialRows = Array.from({ length: Math.max(minRows, 1) }, emptyRow)
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [skipped, setSkipped] = useState(false)

  const updateCell = (rowIdx: number, key: string, value: string) => {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r))
  }

  const addRow = () => {
    if (rows.length < maxRows) {
      setRows(prev => [...prev, emptyRow()])
    }
  }

  const removeRow = (idx: number) => {
    if (rows.length > Math.max(minRows, 1)) {
      setRows(prev => prev.filter((_, i) => i !== idx))
    }
  }

  const hasAnyData = rows.some(r => Object.values(r).some(v => v.trim()))

  const handleSubmit = () => {
    if (disabled) return
    // Filter to rows that have at least one non-empty cell
    const filledRows = rows.filter(r => Object.values(r).some(v => v.trim()))
    if (filledRows.length === 0 && minRows === 0) {
      onSubmit('[]') // empty = skipped
      return
    }
    if (filledRows.length === 0) return
    onSubmit(JSON.stringify(filledRows))
  }

  const handleSkip = () => {
    setSkipped(true)
    onSubmit('[]')
  }

  const isSingleColumn = columns.length === 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mb-3 sm:mb-4"
    >
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #F0F0F0' }}>
        {/* Column headers — only show for multi-column */}
        {!isSingleColumn && (
          <div className="flex gap-2 px-4 pt-3 pb-1">
            {columns.map(col => (
              <div
                key={col.key}
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  color: '#9A9A9A',
                  flex: col.width ? `0 0 ${col.width}` : '1',
                }}
              >
                {col.label}
              </div>
            ))}
            <div style={{ width: '28px', flexShrink: 0 }} />
          </div>
        )}

        {/* Rows */}
        <div className="px-4 pb-2 pt-1 flex flex-col gap-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 items-center">
              {columns.map(col => (
                <input
                  key={col.key}
                  type="text"
                  value={row[col.key]}
                  onChange={e => updateCell(rowIdx, col.key, e.target.value)}
                  placeholder={col.placeholder}
                  disabled={disabled}
                  className="outline-none text-sm"
                  style={{
                    flex: col.width ? `0 0 ${col.width}` : '1',
                    padding: '10px 12px',
                    border: '1.5px solid #F0F0F0',
                    borderRadius: '10px',
                    color: '#1A1A1A',
                    fontFamily: 'inherit',
                    background: disabled ? '#F9F9F9' : '#FAFAFA',
                    transition: 'border-color 0.15s',
                    minWidth: 0,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#007AFF' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#F0F0F0' }}
                />
              ))}
              {rows.length > Math.max(minRows, 1) ? (
                <button
                  onClick={() => removeRow(rowIdx)}
                  className="shrink-0 flex items-center justify-center transition-colors"
                  style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'none', color: '#CCCCCC', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#FF3B30'; e.currentTarget.style.background = '#FFF0F0' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#CCCCCC'; e.currentTarget.style.background = 'none' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="8" x2="12" y2="8" /></svg>
                </button>
              ) : (
                <div style={{ width: '28px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #F0F0F0' }}>
          <div className="flex gap-2">
            {rows.length < maxRows && (
              <button
                onClick={addRow}
                disabled={disabled}
                className="text-xs font-medium transition-colors"
                style={{ color: '#007AFF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {addLabel}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {minRows === 0 && !hasAnyData && (
              <button
                onClick={handleSkip}
                disabled={disabled}
                className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ color: '#6B6B6B', background: 'none', border: '1px solid #F0F0F0', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                Skip
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={disabled || (!hasAnyData && minRows > 0)}
              className="text-xs font-semibold px-5 py-2 rounded-lg transition-opacity active:scale-[0.98]"
              style={{
                background: (disabled || (!hasAnyData && minRows > 0)) ? '#E0E0E0' : '#007AFF',
                color: '#fff',
                border: 'none',
                cursor: (disabled || (!hasAnyData && minRows > 0)) ? 'not-allowed' : 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
