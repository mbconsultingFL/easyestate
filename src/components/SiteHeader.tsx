'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function SiteHeader() {
  const { data: session, status } = useSession()
  const isAuthed = status === 'authenticated' && !!session

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-lg font-bold text-gray-900">EasyEstatePlan</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm text-gray-600">
          <Link href="/#how" className="hover:text-gray-900">How it works</Link>
          <Link href="/#pricing" className="hover:text-gray-900">Pricing</Link>
          <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-24 h-8" aria-hidden />
          ) : isAuthed ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
