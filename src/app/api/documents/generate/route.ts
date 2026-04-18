export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { documents, users } from '@/lib/db'
import {
  generateMedicalPOA,
  generateHIPAAAuth,
  generateDigitalAssets,
  generateBeneficiaryChecklist,
  generateLetterOfInstruction,
  generateAdvanceDirective,
  generateFinancialPOA,
} from '@/lib/pdf-generator'
import { putPdf } from '@/lib/kv-store'

const GENERATORS: Record<string, (answers: any) => Promise<Buffer>> = {
  medical_poa: generateMedicalPOA,
  hipaa_auth: generateHIPAAAuth,
  digital_assets: generateDigitalAssets,
  beneficiary_checklist: generateBeneficiaryChecklist,
  letter_of_instruction: generateLetterOfInstruction,
  advance_directive: generateAdvanceDirective,
  financial_poa: generateFinancialPOA,
}

const FILE_PREFIXES: Record<string, string> = {
  medical_poa: 'medical-poa',
  hipaa_auth: 'hipaa-auth',
  digital_assets: 'digital-assets',
  beneficiary_checklist: 'beneficiary-checklist',
  letter_of_instruction: 'letter-of-instruction',
  advance_directive: 'advance-directive',
  financial_poa: 'financial-poa',
}

// Free tier — the Healthcare POA is intentionally free for everyone. All other
// document types require an active subscription. Keep this list in sync with
// the marketing copy and pricing page.
const FREE_DOC_TYPES = new Set<string>(['medical_poa'])

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, answers } = await request.json()

    const generator = GENERATORS[type]
    if (!generator) return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 })

    // Paywall enforcement. Without this check a free user can invoke the
    // generate endpoint directly and receive Pro-only PDFs.
    if (!FREE_DOC_TYPES.has(type)) {
      const user = await users.findById(session.user.id)
      if (user?.subscriptionStatus !== 'active') {
        return NextResponse.json(
          { error: 'Pro subscription required for this document type' },
          { status: 403 }
        )
      }
    }

    const pdfBuffer = await generator(answers)
    const prefix = FILE_PREFIXES[type] || type
    const filename = `${prefix}-${Date.now()}.pdf`

    // Store the PDF in the blob store. The key doubles as a path: the user
    // id scopes ownership, the filename is unique per generation. The
    // Document row stores this key — it is NOT a filesystem path.
    const blobKey = `${session.user.id}/${filename}`
    await putPdf(blobKey, pdfBuffer)

    const existingDoc = await documents.findByUserAndType(session.user.id, type)
    if (existingDoc) {
      await documents.update(existingDoc.id, {
        status: 'ready_to_sign',
        state: answers.state_select || null,
        data: JSON.stringify(answers),
        pdfPath: blobKey,
        completedAt: new Date().toISOString(),
      })
    } else {
      await documents.create({
        userId: session.user.id,
        type,
        status: 'ready_to_sign',
        state: answers.state_select || null,
        data: JSON.stringify(answers),
        pdfPath: blobKey,
        completedAt: new Date().toISOString(),
      })
    }
    return NextResponse.json({ ok: true, filename })
  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
