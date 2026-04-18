import type { ReactNode } from 'react'

interface ContentPageProps {
  title: string
  subtitle?: string
  lastUpdated?: string
  children: ReactNode
}

export default function ContentPage({ title, subtitle, lastUpdated, children }: ContentPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 sm:py-14">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl">
            {subtitle}
          </p>
        )}
        {lastUpdated && (
          <p className="mt-4 text-xs text-gray-400 uppercase tracking-wide">
            Last updated {lastUpdated}
          </p>
        )}
      </header>

      <div className="prose-content text-gray-700 leading-relaxed space-y-5 text-[15px] sm:text-base
        [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-7 [&_h3]:mb-2
        [&_p]:leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5
        [&_a]:text-indigo-600 [&_a]:underline hover:[&_a]:text-indigo-700
        [&_strong]:text-gray-900
        [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm">
        {children}
      </div>
    </div>
  )
}
