'use client'

import { motion } from 'framer-motion'

interface ChatMessageProps {
  text: string
  isBot: boolean
  animate?: boolean
}

export default function ChatMessage({ text, isBot, animate = true }: ChatMessageProps) {
  const Wrapper = animate ? motion.div : 'div' as any
  const animProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {}

  return (
    <Wrapper {...animProps} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3 sm:mb-4`}>
      <div
        className="max-w-[88%] sm:max-w-[460px] px-[18px] py-[14px] text-sm leading-relaxed tracking-tight"
        style={isBot ? {
          background: '#FFFFFF',
          border: '1px solid #F0F0F0',
          borderRadius: '18px 18px 18px 4px',
          color: '#1A1A1A',
        } : {
          background: '#007AFF',
          color: '#fff',
          borderRadius: '18px 18px 4px 18px',
        }}
      >
        <p>{text}</p>
      </div>
    </Wrapper>
  )
}
