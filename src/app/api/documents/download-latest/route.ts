export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { documents } from '@/lib/db'
import { getPdf } from '@/lib/kv-store'

const FILE_PREFIXES: Record<string, string> = {
  medical_poa: 'medical-poa',
  hipaa_auth: 'hipaa-auth',
  advance_directive: 'advance-directive',
  financial_poa: 'financial-poa',
  digital_assets: 'digital-assets',
  beneficiary_checklist: 'beneficiary-checklist',
  letter_of_instruction: 'letter-of-instruction',
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'medical_poa'
    // `direct=1` is used by plain `<a href>` links (e.g., dashboard cards) that
    // expect the browser to download the file. Without it, we respond as JSON
    // with a base64 payload (used by fetch() callers like the ChatFlow
    // completion card).
    const direct = searchParams.get('direct') === '1'

    const userDocs = await documents.findByUser(session.user.id)
    const doc = userDocs
      .filter(d => d.type === type && (d.status === 'complete' || d.status === 'ready_to_sign'))
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))[0]

    if (!doc || !doc.pdfPath) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // pdfPath now holds a blob-store key (e.g., "userId/filename.pdf"), not a
    // filesystem path. Retrieve the bytes from the adapter.
    const fileBuffer = await getPdf(doc.pdfPath)
    if (!fileBuffer) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    const prefix = FILE_PREFIXES[type] || type
    const filename = `${prefix}-${doc.state || 'us'}.pdf`

    if (direct) {
      // Stream the PDF bytes back so a plain <a href> triggers a real file
      // download instead of dumping JSON text into the browser tab.
      const uint8 = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength)
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(uint8)
          controller.close()
        },
      })
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': String(fileBuffer.length),
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'private, no-store',
        },
      })
    }

    const base64 = fileBuffer.toString('base64')
    return NextResponse.json({
      ok: true,
      filename,
      data: base64,
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
