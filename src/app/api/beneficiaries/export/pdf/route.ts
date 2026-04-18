import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { beneficiaryAccounts, users } from '@/lib/db'
import { generateBeneficiaryPDF } from '@/lib/pdf-generator'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await users.findById(session.user.id)
  if (user?.subscriptionStatus === 'free') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  try {
    const accounts = await beneficiaryAccounts.findByUser(session.user.id)
    const pdfBuffer = await generateBeneficiaryPDF(accounts, user?.name || user?.email || 'User')

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="beneficiary-list-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Beneficiary PDF generation error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
