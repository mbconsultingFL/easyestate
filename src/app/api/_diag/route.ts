import { NextResponse } from 'next/server'
import { getStore } from '@netlify/blobs'

/**
 * TEMPORARY diagnostic endpoint.
 *
 * GET /api/_diag → JSON snapshot of the things that most commonly break a
 * first Netlify deploy of this app:
 *   - Is the NETLIFY runtime flag set (so kv-store picks the Blobs backend)?
 *   - Are NEXTAUTH_URL / NEXTAUTH_SECRET configured with non-placeholder
 *     values of sensible length?
 *   - Can we actually open the `easyestate-db` Blobs store and do a trivial
 *     round-trip? (If Blobs context isn't injected, this throws
 *     MissingBlobsEnvironmentError — that error text will be returned.)
 *
 * DELETE this file once the site is live. It doesn't leak secrets (only
 * booleans/lengths), but it also has no purpose in a healthy prod deploy.
 */
export async function GET() {
  const secret = process.env.NEXTAUTH_SECRET ?? ''
  const PLACEHOLDERS = new Set([
    '',
    'dev-secret-change-in-production',
    'replace-me-with-a-random-32-byte-base64-string',
  ])

  const env = {
    NETLIFY: process.env.NETLIFY ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    NEXTAUTH_SECRET_set: secret.length > 0,
    NEXTAUTH_SECRET_placeholder: PLACEHOLDERS.has(secret),
    NEXTAUTH_SECRET_length: secret.length,
  }

  // Try a round-trip against Netlify Blobs. We use a throwaway key in the
  // same store the app actually uses, so if Blobs is misconfigured for the
  // site (or the runtime didn't inject context), we see the exact error.
  let blobs: Record<string, unknown> = { attempted: false }
  if (process.env.NETLIFY === 'true') {
    blobs = { attempted: true }
    try {
      const store = getStore({ name: 'easyestate-db', consistency: 'strong' })
      const probeKey = `__diag_probe_${Date.now()}`
      await store.setJSON(probeKey, { ok: true, at: new Date().toISOString() })
      const readBack = await store.get(probeKey, { type: 'json' })
      await store.delete(probeKey)
      blobs = { attempted: true, ok: true, readBack }
    } catch (error) {
      blobs = {
        attempted: true,
        ok: false,
        error: {
          name: error instanceof Error ? error.name : 'UnknownError',
          message: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  return NextResponse.json({ env, blobs }, { status: 200 })
}
