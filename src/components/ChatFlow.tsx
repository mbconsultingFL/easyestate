'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ChatMessage from './ChatMessage'
import AnswerChips from './AnswerChips'
import MultiChipSelect from './MultiChipSelect'
import TextInput from './TextInput'
import AddressInput from './AddressInput'
import MultiEntryInput from './MultiEntryInput'
import { getFlowDefinition, getQuestion, getNextQuestion, SUPPORTED_STATES, FLOW_DISPLAY_NAMES } from '@/lib/flow-engine'
import type { FlowQuestion } from '@/lib/flow-engine'

interface Message {
  text: string
  isBot: boolean
}

/** Format a multi-entry JSON answer for display in a chat bubble */
function formatMultiEntryDisplay(value: string): string {
  try {
    const rows = JSON.parse(value) as Record<string, string>[]
    if (!Array.isArray(rows) || rows.length === 0) return 'None'
    return rows.map(row => Object.values(row).filter(v => v.trim()).join(' — ')).join(', ')
  } catch {
    return value
  }
}

/**
 * Format a multi-chip answer (comma-separated values) using the labels from
 * the question options. Falls back to the raw value if a label is missing.
 */
function formatMultiChipDisplay(
  value: string,
  options?: { label: string; value: string }[],
): string {
  const vals = value.split(',').map(v => v.trim()).filter(Boolean)
  if (vals.length === 0) return value
  return vals
    .map(v => options?.find(o => o.value === v)?.label || v)
    .join(' + ')
}

/** Format any answer for display in the user's chat bubble. */
function formatAnswerDisplay(value: string, question: FlowQuestion | null): string {
  if (!question) return value
  if (question.type === 'multi-entry') return formatMultiEntryDisplay(value)
  if (question.type === 'multi-chip') return formatMultiChipDisplay(value, question.options)
  return question.options?.find(o => o.value === value)?.label || value
}

interface ChatFlowProps {
  flowType?: string
}

export default function ChatFlow({ flowType = 'medical_poa' }: ChatFlowProps) {
  const flow = getFlowDefinition(flowType)!
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<FlowQuestion | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flowComplete, setFlowComplete] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [flowSessionId, setFlowSessionId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    loadOrStartFlow()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadOrStartFlow = async () => {
    try {
      const res = await fetch(`/api/flow/current?type=${flowType}`)
      const data = await res.json()

      if (data.session && !data.session.completed) {
        const savedAnswers = JSON.parse(data.session.answers || '{}')
        setFlowSessionId(data.session.id)
        setAnswers(savedAnswers)

        const replayMessages: Message[] = []
        let questionId = flow.startQuestion

        for (const [, value] of Object.entries(savedAnswers)) {
          const q = getQuestion(flow, questionId)
          if (q) {
            replayMessages.push({ text: q.text, isBot: true })
            replayMessages.push({ text: formatAnswerDisplay(value as string, q), isBot: false })
            const nextQ = getNextQuestion(flow, questionId, value as string, savedAnswers)
            questionId = nextQ?.id || questionId
          }
        }

        setMessages(replayMessages)
        const nextQ = getQuestion(flow, questionId)
        if (nextQ) {
          setTimeout(() => {
            setMessages(prev => [...prev, { text: nextQ.text, isBot: true }])
            setCurrentQuestion(nextQ)
          }, 300)
        }
      } else {
        const createRes = await fetch('/api/flow/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentType: flowType }),
        })
        const createData = await createRes.json()
        setFlowSessionId(createData.id)

        const firstQ = getQuestion(flow, flow.startQuestion)!
        const displayName = FLOW_DISPLAY_NAMES[flowType] || flow.name
        setMessages([{ text: `Welcome! I'll help you create your ${displayName}. This takes about 5 minutes.`, isBot: true }])

        setTimeout(() => {
          setMessages(prev => [...prev, { text: firstQ.text, isBot: true }])
          setCurrentQuestion(firstQ)
        }, 800)
      }
    } catch {
      const firstQ = getQuestion(flow, flow.startQuestion)!
      const fallbackName = FLOW_DISPLAY_NAMES[flowType] || flow.name
      setMessages([{ text: `Welcome! I'll help you create your ${fallbackName}. This takes about 5 minutes.`, isBot: true }])
      setTimeout(() => {
        setMessages(prev => [...prev, { text: firstQ.text, isBot: true }])
        setCurrentQuestion(firstQ)
      }, 800)
    }
  }

  const handleAnswer = async (value: string) => {
    if (!currentQuestion) return

    const displayValue = formatAnswerDisplay(value, currentQuestion)
    setMessages(prev => [...prev, { text: displayValue, isBot: false }])

    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    if (flowSessionId) {
      fetch('/api/flow/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: flowSessionId, answers: newAnswers, currentStep: currentQuestion.id }),
      })
    }

    const nextQ = getNextQuestion(flow, currentQuestion.id, value, newAnswers)

    if (!nextQ) {
      if (value === 'generate') {
        setCurrentQuestion(null)
        setFlowComplete(true)
        handleGenerate(newAnswers)
      } else if (value === 'notify') {
        setCurrentQuestion(null)
        setMessages(prev => [...prev, { text: "We've added you to the waitlist! We'll email you when your state is supported.", isBot: true }])
      } else {
        setCurrentQuestion(null)
        setFlowComplete(true)
        handleGenerate(newAnswers)
      }
      return
    }

    setCurrentQuestion(null)
    setTimeout(() => {
      setMessages(prev => [...prev, { text: nextQ.text, isBot: true }])
      setCurrentQuestion(nextQ)
    }, 500)
  }

  const handleGenerate = async (finalAnswers: Record<string, string>) => {
    setGenerating(true)
    const genDisplayName = FLOW_DISPLAY_NAMES[flowType] || flow.name
    setMessages(prev => [...prev, { text: `Generating your ${genDisplayName}...`, isBot: true }])

    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: flowType, answers: finalAnswers, flowSessionId }),
      })

      if (res.ok) {
        const stateLabel = finalAnswers.state_select ? (SUPPORTED_STATES[finalAnswers.state_select]?.name || 'your state') : ''
        setMessages(prev => [
          ...prev,
          { text: `Your ${genDisplayName}${stateLabel ? ` for ${stateLabel}` : ''} is ready! You can download the draft below or sign it via DocuSign.`, isBot: true },
        ])

        if (flowSessionId) {
          fetch('/api/flow/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: flowSessionId }),
          })
        }
      } else {
        setMessages(prev => [...prev, { text: 'There was an issue generating your document. Please try again.', isBot: true }])
      }
    } catch {
      setMessages(prev => [...prev, { text: 'Something went wrong. Please try again.', isBot: true }])
    }
    setGenerating(false)
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/documents/download-latest?type=${flowType}`)
      const json = await res.json()
      if (json.ok && json.data) {
        const byteChars = atob(json.data)
        const byteArray = new Uint8Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) {
          byteArray[i] = byteChars.charCodeAt(i)
        }
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = json.filename || 'document.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch {
      alert('Error downloading PDF. Please try again.')
    }
  }

  return (
    <div className="flex flex-col h-full max-w-[680px] mx-auto w-full">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
        {messages.map((msg, i) => (
          <ChatMessage key={i} text={msg.text} isBot={msg.isBot} animate={i >= messages.length - 2} />
        ))}

        {currentQuestion && !flowComplete && (
          <div className="mt-2">
            {currentQuestion.type === 'chip-select' && currentQuestion.options && (
              <AnswerChips options={currentQuestion.options} onSelect={handleAnswer} />
            )}
            {currentQuestion.type === 'multi-chip' && currentQuestion.options && (
              <MultiChipSelect options={currentQuestion.options} onSubmit={handleAnswer} />
            )}
            {currentQuestion.type === 'text-input' && (
              <TextInput placeholder={currentQuestion.placeholder} onSubmit={handleAnswer} validation={currentQuestion.validation} />
            )}
            {currentQuestion.type === 'address-input' && (
              <AddressInput placeholder={currentQuestion.placeholder} onSubmit={handleAnswer} validation={currentQuestion.validation} />
            )}
            {currentQuestion.type === 'multi-entry' && currentQuestion.columns && (
              <MultiEntryInput
                columns={currentQuestion.columns}
                minRows={currentQuestion.minRows}
                maxRows={currentQuestion.maxRows}
                addLabel={currentQuestion.addLabel}
                onSubmit={handleAnswer}
              />
            )}
          </div>
        )}

        {/* Completion card */}
        {flowComplete && !generating && (
          <div className="mt-6 p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #F0F0F0' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 10.5 8.5 14 15 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Document ready</h3>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>Download your draft or sign digitally</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#007AFF' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M4.5 7.5 8 11l3.5-3.5M3 14h10"/></svg>
                Download PDF
              </button>

              <button
                className="w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#1A1A1A', color: '#fff' }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 2.5l2 2M6 8l5.5-5.5 2 2L8 10l-2.5.5L6 8z"/><path d="M3 13h10"/></svg>
                Sign via DocuSign
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 text-xs font-medium transition-colors"
                style={{ color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        )}

        {generating && (
          <div className="flex justify-start mb-4">
            <div className="px-5 py-3 rounded-2xl" style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: '18px 18px 18px 4px' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#007AFF', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#007AFF', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#007AFF', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </div>
  )
}
