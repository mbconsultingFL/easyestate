/**
 * Unified key-value / object store.
 *
 * Production (Netlify): backed by Netlify Blobs. Two stores —
 *   - "easyestate-db"    → JSON tables (users, documents, etc.)
 *   - "easyestate-pdfs"  → generated PDF binaries
 *
 * Local development (`next dev` without `netlify dev`): backed by the local
 * filesystem under `.data/` and `.data/pdfs/`. This keeps local dev working
 * without needing a Netlify token or the CLI.
 *
 * Everything here is async because Netlify Blobs is async. Callers that used
 * to treat `src/lib/db.ts` synchronously now `await` every operation.
 */

import { getStore, type Store } from '@netlify/blobs'
import { readFile, writeFile, mkdir, unlink, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Detect Netlify runtime. Netlify sets NETLIFY=true for build and functions.
// We avoid reading NODE_ENV here because we want local `next dev` to use the
// file adapter even when NODE_ENV=production (e.g., a local prod preview).
const IS_NETLIFY = process.env.NETLIFY === 'true'

const LOCAL_ROOT = path.join(process.cwd(), '.data')
const LOCAL_PDF_ROOT = path.join(LOCAL_ROOT, 'pdfs')

// ─── JSON table store (used by src/lib/db.ts) ─────────────────────────

let _dbStore: Store | null = null
function dbStore(): Store {
  if (_dbStore) return _dbStore
  _dbStore = getStore({ name: 'easyestate-db', consistency: 'strong' })
  return _dbStore
}

export async function getJSON<T>(key: string): Promise<T | null> {
  if (IS_NETLIFY) {
    const value = await dbStore().get(key, { type: 'json' })
    return (value as T) ?? null
  }
  const file = path.join(LOCAL_ROOT, `${key}.json`)
  if (!existsSync(file)) return null
  const raw = await readFile(file, 'utf-8')
  return JSON.parse(raw) as T
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  if (IS_NETLIFY) {
    await dbStore().setJSON(key, value)
    return
  }
  await mkdir(LOCAL_ROOT, { recursive: true })
  await writeFile(
    path.join(LOCAL_ROOT, `${key}.json`),
    JSON.stringify(value, null, 2),
    'utf-8'
  )
}

// ─── PDF / binary object store (used by documents/generate, download) ─

let _pdfStore: Store | null = null
function pdfStore(): Store {
  if (_pdfStore) return _pdfStore
  _pdfStore = getStore({ name: 'easyestate-pdfs' })
  return _pdfStore
}

export async function putPdf(key: string, buffer: Buffer): Promise<void> {
  if (IS_NETLIFY) {
    // Netlify Blobs' BlobInput is `string | ArrayBuffer | Blob`. A Node Buffer
    // is a view over an ArrayBuffer-like and may sit inside a larger pool, so
    // we copy the exact bytes into a fresh ArrayBuffer before handing it off.
    const ab = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer
    await pdfStore().set(key, ab, { metadata: { type: 'application/pdf' } })
    return
  }
  await mkdir(LOCAL_PDF_ROOT, { recursive: true })
  await writeFile(path.join(LOCAL_PDF_ROOT, sanitizeKey(key)), buffer)
}

export async function getPdf(key: string): Promise<Buffer | null> {
  if (IS_NETLIFY) {
    const blob = await pdfStore().get(key, { type: 'arrayBuffer' })
    if (!blob) return null
    return Buffer.from(blob as ArrayBuffer)
  }
  const file = path.join(LOCAL_PDF_ROOT, sanitizeKey(key))
  if (!existsSync(file)) return null
  return readFile(file)
}

export async function deletePdf(key: string): Promise<void> {
  if (IS_NETLIFY) {
    await pdfStore().delete(key)
    return
  }
  const file = path.join(LOCAL_PDF_ROOT, sanitizeKey(key))
  if (existsSync(file)) await unlink(file)
}

/**
 * Keys used for PDFs look like "userId/filename.pdf". The local adapter flattens
 * the slash because we store everything in a single directory; the Blobs
 * adapter preserves it because Blobs keys support slashes natively.
 */
function sanitizeKey(key: string): string {
  return key.replace(/[\\/]/g, '__')
}

/** True if keys are being stored in Netlify Blobs. Callers should not branch
 *  on this in business logic — it is exposed for diagnostics and docs. */
export const isNetlifyRuntime = IS_NETLIFY

// Utility used by scripts/migrations only.
export async function listLocalTables(): Promise<string[]> {
  if (IS_NETLIFY) return []
  if (!existsSync(LOCAL_ROOT)) return []
  const entries = await readdir(LOCAL_ROOT)
  return entries.filter((e) => e.endsWith('.json')).map((e) => e.replace(/\.json$/, ''))
}
