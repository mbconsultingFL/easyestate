export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { documents } from '@/lib/db'
import { getPdf } from '@/lib/kv-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type } = await params
    const docType = type === 'latest' ? 'medical_poa' : type
    const userDocs = await documents.findByUser(session.user.id)
    const doc = userDocs
      .filter(d => d.type === docType && d.status === 'complete')
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))[0]

    if (!doc || !doc.pdfPath) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // pdfPath is a blob-store key — retrieve bytes via the adapter.
    const fileBuffer = await getPdf(doc.pdfPath)
    if (!fileBuffer) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
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
        'Content-Disposition': `attachment; filename="${docType}-${doc.state || 'us'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
