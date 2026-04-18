import PDFDocument from 'pdfkit'
import { SUPPORTED_STATES } from './flow-engine'
import type { BeneficiaryAccount } from './db'

interface POAData {
  state_select: string
  principal_name: string
  principal_address: string
  agent_name: string
  agent_relationship: string
  agent_address: string
  agent_phone: string
  alternate_agent_yn?: string
  alternate_name?: string
  alternate_address?: string
  powers_scope: string
  mental_health_yn?: string
  effective_when: string
  durability: string
  age_range: string
  family_situation: string
}

const SCOPE_TEXT: Record<string, string> = {
  all: 'all healthcare decisions, including but not limited to consent, refusal of consent, or withdrawal of consent to any care, treatment, service, or procedure to maintain, diagnose, or otherwise affect my physical or mental condition',
  all_except_eol: 'all healthcare decisions except those relating to the withdrawal or withholding of life-sustaining treatment',
  incapacitated_only: 'healthcare decisions only during periods when I am unable to make or communicate my own healthcare decisions',
}

const RELATIONSHIP_TEXT: Record<string, string> = {
  spouse: 'my spouse/partner',
  parent: 'my parent',
  child: 'my adult child',
  sibling: 'my sibling',
  friend: 'my close friend',
  other: 'my designated agent',
}

export function generateMedicalPOA(data: POAData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const state = SUPPORTED_STATES[data.state_select]
    const stateName = state?.name || data.state_select

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text(`HEALTHCARE POWER OF ATTORNEY`, { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`State of ${stateName}`, { align: 'center' })
    doc.moveDown(1.5)

    // Disclaimer
    doc.fontSize(8).font('Helvetica-Oblique')
      .text('IMPORTANT: This document was assembled by EasyEstatePlan and does not constitute legal advice. Consult an attorney for guidance specific to your situation.', { align: 'center' })
    doc.moveDown(1.5)

    // Section 1: Declaration
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 1: DECLARATION OF PRINCIPAL')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
      .text(`I, ${data.principal_name}, residing at ${data.principal_address}, being of sound mind, do hereby designate and appoint the following individual as my Healthcare Agent to make healthcare decisions on my behalf:`)
    doc.moveDown(1)

    // Section 2: Designation of Agent
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 2: DESIGNATION OF HEALTHCARE AGENT')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Name: ${data.agent_name}`)
    doc.text(`Relationship: ${RELATIONSHIP_TEXT[data.agent_relationship] || data.agent_relationship}`)
    doc.text(`Address: ${data.agent_address}`)
    doc.text(`Phone: ${data.agent_phone}`)
    doc.moveDown(1)

    // Section 3: Alternate Agent (if applicable)
    if (data.alternate_agent_yn === 'yes' && data.alternate_name) {
      doc.fontSize(11).font('Helvetica-Bold').text('SECTION 3: ALTERNATE HEALTHCARE AGENT')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
        .text(`If my designated Healthcare Agent is unable, unwilling, or unavailable to serve, I designate the following as my Alternate Healthcare Agent:`)
      doc.moveDown(0.3)
      doc.text(`Name: ${data.alternate_name}`)
      if (data.alternate_address) doc.text(`Address: ${data.alternate_address}`)
      doc.moveDown(1)
    }

    // Section 4: Powers Granted
    const sectionNum = data.alternate_agent_yn === 'yes' ? 4 : 3
    doc.fontSize(11).font('Helvetica-Bold').text(`SECTION ${sectionNum}: POWERS GRANTED`)
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
      .text(`I grant my Healthcare Agent the authority to make ${SCOPE_TEXT[data.powers_scope] || SCOPE_TEXT.all}.`)
    doc.moveDown(0.5)

    if (data.mental_health_yn === 'yes') {
      doc.text('This authority includes the power to make decisions regarding my mental health treatment.')
      doc.moveDown(0.5)
    }

    // Effective date
    doc.text(`This Healthcare Power of Attorney shall become effective ${
      data.effective_when === 'immediately'
        ? 'immediately upon execution'
        : 'only upon a determination by my attending physician that I am unable to make or communicate my own healthcare decisions'
    }.`)
    doc.moveDown(0.5)

    // Durability
    doc.text(`This Healthcare Power of Attorney ${
      data.durability === 'durable'
        ? 'shall remain in full force and effect even if I become mentally incapacitated or disabled'
        : 'shall be revoked upon my mental incapacity or disability'
    }.`)
    doc.moveDown(1)

    // Section: State-specific requirements
    doc.fontSize(11).font('Helvetica-Bold').text(`SECTION ${sectionNum + 1}: EXECUTION`)
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')

    if (state?.requiresNotarization) {
      doc.text(`Pursuant to the laws of the State of ${stateName}, this document must be notarized to be valid.`)
      doc.moveDown(0.3)
    }

    doc.text(`This document requires ${state?.requiresWitnesses || 2} witness(es) under ${stateName} law.`)
    doc.moveDown(1.5)

    // Signature lines
    doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURES')
    doc.moveDown(1)

    doc.fontSize(10).font('Helvetica')
    doc.text('_____________________________________________')
    doc.text(`Principal: ${data.principal_name}`)
    doc.text('Date: ___________________')
    doc.moveDown(1)

    // Witness lines
    const witnessCount = state?.requiresWitnesses || 2
    for (let i = 1; i <= witnessCount; i++) {
      doc.text('_____________________________________________')
      doc.text(`Witness ${i} Name: ___________________________`)
      doc.text(`Witness ${i} Address: _________________________`)
      doc.text('Date: ___________________')
      doc.moveDown(0.8)
    }

    // Notary block
    if (state?.requiresNotarization) {
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica-Bold').text('NOTARY ACKNOWLEDGMENT')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(`State of ${stateName}`)
      doc.text('County of ___________________')
      doc.moveDown(0.3)
      doc.text(`On this _____ day of _______________, 20____, before me, a Notary Public, personally appeared ${data.principal_name}, proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument, and acknowledged to me that they executed the same in their authorized capacity and that by their signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.`)
      doc.moveDown(0.8)
      doc.text('_____________________________________________')
      doc.text('Notary Public')
      doc.text('My Commission Expires: ___________________')
    }

    doc.end()
  })
}

// ─── HIPAA Authorization PDF ─────────────────────────────────────────

interface HIPAAData {
  state_select: string
  patient_name: string
  patient_dob: string
  patient_address: string
  recipient_name: string
  recipient_relationship: string
  additional_recipient_yn?: string
  recipient2_name?: string
  recipient2_relationship?: string
  info_scope: string
  specific_conditions?: string
  purpose: string
  expiration: string
}

const HIPAA_SCOPE_TEXT: Record<string, string> = {
  all: 'all protected health information, including but not limited to medical records, laboratory results, imaging reports, treatment plans, prescriptions, billing records, and mental health and substance abuse treatment records',
  all_except_sensitive: 'all protected health information, excluding psychotherapy notes, substance abuse treatment records, and mental health records',
  specific: 'the specific protected health information described herein',
}

const HIPAA_PURPOSE_TEXT: Record<string, string> = {
  care_coordination: 'ongoing coordination of my healthcare among my providers and authorized persons',
  emergency: 'emergency preparedness and the ability to communicate with providers on my behalf in an emergency',
  insurance_legal: 'insurance, legal, or administrative purposes related to my healthcare',
  personal: 'personal and family record-keeping',
}

const HIPAA_EXPIRATION_TEXT: Record<string, string> = {
  '1_year': 'one (1) year from the date of execution',
  '2_years': 'two (2) years from the date of execution',
  no_expiration: 'only upon my written revocation delivered to the applicable healthcare provider(s)',
}

export function generateHIPAAAuth(data: HIPAAData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const state = SUPPORTED_STATES[data.state_select]
    const stateName = state?.name || data.state_select

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('AUTHORIZATION FOR RELEASE OF HEALTH INFORMATION', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text('Pursuant to the Health Insurance Portability and Accountability Act (HIPAA)', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).text(`State of ${stateName}`, { align: 'center' })
    doc.moveDown(1.5)

    // Disclaimer
    doc.fontSize(8).font('Helvetica-Oblique')
      .text('IMPORTANT: This document was assembled by EasyEstatePlan and does not constitute legal advice. Consult an attorney for guidance specific to your situation.', { align: 'center' })
    doc.moveDown(1.5)

    // Section 1: Patient Information
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 1: PATIENT INFORMATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Name: ${data.patient_name}`)
    doc.text(`Date of Birth: ${data.patient_dob}`)
    doc.text(`Address: ${data.patient_address}`)
    doc.moveDown(1)

    // Section 2: Authorized Person(s)
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 2: PERSONS AUTHORIZED TO RECEIVE INFORMATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`I, ${data.patient_name}, hereby authorize any healthcare provider, health plan, or healthcare clearinghouse that maintains my protected health information to disclose such information to the following person(s):`)
    doc.moveDown(0.5)
    doc.text(`1. ${data.recipient_name} (${RELATIONSHIP_TEXT[data.recipient_relationship] || data.recipient_relationship})`)
    if (data.additional_recipient_yn === 'yes' && data.recipient2_name) {
      doc.text(`2. ${data.recipient2_name} (${RELATIONSHIP_TEXT[data.recipient2_relationship || ''] || data.recipient2_relationship})`)
    }
    doc.moveDown(1)

    // Section 3: Scope
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 3: INFORMATION TO BE DISCLOSED')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`This authorization covers ${HIPAA_SCOPE_TEXT[data.info_scope]}.`)
    if (data.info_scope === 'specific' && data.specific_conditions) {
      doc.moveDown(0.3)
      doc.text(`Specific records authorized: ${data.specific_conditions}`)
    }
    doc.moveDown(1)

    // Section 4: Purpose
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 4: PURPOSE')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`The purpose of this authorization is: ${HIPAA_PURPOSE_TEXT[data.purpose] || data.purpose}.`)
    doc.moveDown(1)

    // Section 5: Expiration
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 5: EXPIRATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`This authorization shall expire ${HIPAA_EXPIRATION_TEXT[data.expiration]}.`)
    doc.moveDown(1)

    // Section 6: Patient Rights
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 6: PATIENT RIGHTS')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text('I understand that:')
    doc.moveDown(0.3)
    doc.text('• I have the right to revoke this authorization at any time by submitting a written revocation to the healthcare provider(s), except to the extent that action has already been taken in reliance on this authorization.')
    doc.moveDown(0.2)
    doc.text('• My treatment, payment, enrollment, or eligibility for benefits will not be conditioned on whether I sign this authorization.')
    doc.moveDown(0.2)
    doc.text('• Information disclosed pursuant to this authorization may be subject to re-disclosure by the recipient and may no longer be protected by federal privacy regulations.')
    doc.moveDown(1.5)

    // Signatures
    doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURES')
    doc.moveDown(1)
    doc.fontSize(10).font('Helvetica')
    doc.text('_____________________________________________')
    doc.text(`Patient: ${data.patient_name}`)
    doc.text('Date: ___________________')
    doc.moveDown(1.5)

    // Witness (one witness is standard for HIPAA forms)
    doc.text('_____________________________________________')
    doc.text('Witness Name: ___________________________')
    doc.text('Date: ___________________')

    doc.end()
  })
}

// ─── Digital Asset Inventory PDF ─────────────────────────────────────

interface DigitalAssetsData {
  owner_name: string
  trusted_person_name: string
  trusted_person_relationship: string
  trusted_person_contact: string
  email_accounts: string
  social_media: string
  financial_accounts: string
  subscriptions: string
  cloud_storage: string
  crypto_yn: string
  crypto_details?: string
  domains_yn: string
  domain_details?: string
  password_manager: string
  password_manager_name?: string
  access_instructions: string
}

export function generateDigitalAssets(data: DigitalAssetsData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('DIGITAL ASSET INVENTORY', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`Prepared for: ${data.owner_name}`, { align: 'center' })
    doc.fontSize(10)
      .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(8).font('Helvetica-Oblique')
      .text('CONFIDENTIAL — Store this document securely. Do not share electronically.', { align: 'center' })
    doc.moveDown(1.5)

    // Trusted person
    doc.fontSize(11).font('Helvetica-Bold').text('DESIGNATED DIGITAL EXECUTOR')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Name: ${data.trusted_person_name}`)
    doc.text(`Relationship: ${data.trusted_person_relationship}`)
    if (data.trusted_person_contact) doc.text(`Contact: ${data.trusted_person_contact}`)
    doc.moveDown(1)

    // Helper: parse multi-entry JSON or fall back to comma-separated
    const parseEntries = (raw: string): Record<string, string>[] => {
      if (!raw || raw === '[]' || raw.toLowerCase() === 'none') return []
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.filter((r: Record<string, string>) => Object.values(r).some(v => v?.trim()))
        return []
      } catch {
        // Legacy comma-separated fallback
        return raw.split(',').map(s => s.trim()).filter(Boolean).map(s => ({ value: s }))
      }
    }

    const addSection = (title: string, raw: string, columnLabels?: string[]) => {
      const entries = parseEntries(raw)
      if (entries.length === 0) return

      if (doc.y > 650) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text(title)
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica')

      entries.forEach(entry => {
        const values = Object.values(entry).filter(v => v?.trim())
        doc.text(`• ${values.join(' — ')}`)
      })
      doc.moveDown(0.8)
    }

    addSection('EMAIL ACCOUNTS', data.email_accounts)
    addSection('SOCIAL MEDIA', data.social_media)
    addSection('FINANCIAL / BANKING ACCOUNTS', data.financial_accounts)
    addSection('PAID SUBSCRIPTIONS', data.subscriptions)
    addSection('CLOUD STORAGE & FILES', data.cloud_storage)

    if (data.crypto_yn === 'yes' && data.crypto_details) {
      addSection('CRYPTOCURRENCY / DIGITAL WALLETS', data.crypto_details)
    }

    if (data.domains_yn === 'yes' && data.domain_details) {
      addSection('DOMAINS & WEBSITES', data.domain_details)
    }

    // Password manager
    if (doc.y > 650) doc.addPage()
    doc.fontSize(11).font('Helvetica-Bold').text('PASSWORD MANAGEMENT')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica')
    if (data.password_manager === 'yes' && data.password_manager_name) {
      doc.text(`Password Manager: ${data.password_manager_name}`)
    } else {
      doc.text('No password manager in use — individual account credentials should be stored securely offline.')
    }
    doc.moveDown(0.8)

    // Access instructions
    if (data.access_instructions && data.access_instructions.toLowerCase() !== 'none') {
      if (doc.y > 650) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text('ACCESS INSTRUCTIONS')
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica')
      doc.text(data.access_instructions)
      doc.moveDown(1)
    }

    // Footer
    if (doc.y > 650) doc.addPage()
    doc.moveDown(1)
    doc.fontSize(8).font('Helvetica-Oblique')
      .text(
        'This document was generated by EasyEstatePlan for personal record-keeping. ' +
        'Keep this document in a secure, physical location. Update it whenever you create new accounts or change services. ' +
        'EasyEstatePlan does not store your passwords or account credentials.',
        { align: 'center' }
      )

    doc.end()
  })
}

// ─── Beneficiary Designation Checklist PDF ───────────────────────────

interface BeneficiaryChecklistData {
  owner_name: string
  marital_status: string
  has_children: string
  retirement_accounts: string
  retirement_details?: string
  life_insurance: string
  life_insurance_details?: string
  bank_accounts: string
  bank_details?: string
  investment_accounts: string
  investment_details?: string
  hsa_accounts: string
  hsa_details?: string
  last_review: string
  review_frequency: string
  notes?: string
}

const REVIEW_LABELS: Record<string, string> = {
  within_year: 'Within the past year',
  '1_3_years': '1–3 years ago',
  over_3_years: 'More than 3 years ago',
  never: 'Never / Not sure',
}

const FREQ_LABELS_CHECKLIST: Record<string, string> = {
  semi_annual: 'Every 6 months',
  yearly: 'Once a year',
  biennial: 'Every 2 years',
}

export function generateBeneficiaryChecklist(data: BeneficiaryChecklistData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('BENEFICIARY DESIGNATION CHECKLIST', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`Prepared for: ${data.owner_name}`, { align: 'center' })
    doc.fontSize(10)
      .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
    doc.moveDown(1.5)

    // Personal info
    doc.fontSize(11).font('Helvetica-Bold').text('PERSONAL INFORMATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Marital Status: ${data.marital_status}`)
    doc.text(`Children: ${data.has_children === 'yes' ? 'Yes' : 'No'}`)
    doc.moveDown(1)

    const addAccountSection = (title: string, hasAccounts: string, details?: string) => {
      if (doc.y > 650) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text(title)
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica')
      if (hasAccounts === 'yes' && details) {
        const items = details.split(',').map(s => s.trim()).filter(Boolean)
        items.forEach(item => {
          doc.text(`☑ ${item}`)
          doc.moveDown(0.1)
        })
      } else if (hasAccounts === 'unsure') {
        doc.text('☐ Status unknown — action needed: contact institution to verify')
      } else {
        doc.text('☐ None / Not applicable')
      }
      doc.moveDown(0.8)
    }

    addAccountSection('RETIREMENT ACCOUNTS (401k, IRA, Roth IRA, 403b, Pension)', data.retirement_accounts, data.retirement_details)
    addAccountSection('LIFE INSURANCE POLICIES', data.life_insurance, data.life_insurance_details)
    addAccountSection('BANK ACCOUNTS (POD/TOD)', data.bank_accounts, data.bank_details)
    addAccountSection('INVESTMENT / BROKERAGE ACCOUNTS (TOD)', data.investment_accounts, data.investment_details)
    addAccountSection('HEALTH SAVINGS ACCOUNT (HSA)', data.hsa_accounts, data.hsa_details)

    // Review info
    if (doc.y > 600) doc.addPage()
    doc.fontSize(11).font('Helvetica-Bold').text('REVIEW SCHEDULE')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Last Review: ${REVIEW_LABELS[data.last_review] || data.last_review}`)
    doc.text(`Review Frequency: ${FREQ_LABELS_CHECKLIST[data.review_frequency] || data.review_frequency}`)
    doc.moveDown(1)

    // Notes
    if (data.notes && data.notes.toLowerCase() !== 'none') {
      doc.fontSize(11).font('Helvetica-Bold').text('NOTES & ACTION ITEMS')
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica')
      doc.text(data.notes)
      doc.moveDown(1)
    }

    // Action reminders
    if (doc.y > 600) doc.addPage()
    doc.fontSize(11).font('Helvetica-Bold').text('IMPORTANT REMINDERS')
    doc.moveDown(0.3)
    doc.fontSize(9).font('Helvetica')
    doc.text('• Review beneficiaries after any major life event (marriage, divorce, birth, death)')
    doc.text('• Beneficiary designations on financial accounts override your will')
    doc.text('• Contact each institution directly to make changes — this checklist is for your records only')
    doc.text('• Keep a copy of this checklist with your estate planning documents')
    doc.moveDown(1.5)

    // Footer
    doc.fontSize(8).font('Helvetica-Oblique')
      .text(
        'This document was generated by EasyEstatePlan for personal record-keeping. ' +
        'Contact each financial institution directly to verify and update beneficiary designations. ' +
        'EasyEstatePlan does not provide legal or financial advice.',
        { align: 'center' }
      )

    doc.end()
  })
}

// ─── Letter of Instruction PDF ──────────────────────────────────────

interface LetterOfInstructionData {
  author_name: string
  executor_name: string
  executor_relationship: string
  important_documents_location: string
  attorney_info: string
  financial_advisor_info: string
  insurance_info: string
  funeral_wishes: string
  funeral_details?: string
  organ_donation: string
  people_to_notify: string
  pets_yn: string
  pets_details?: string
  personal_message?: string
}

const FUNERAL_LABELS: Record<string, string> = {
  burial: 'Traditional burial',
  cremation: 'Cremation',
  celebration: 'Celebration of life',
  no_preference: 'No specific preference',
}

export function generateLetterOfInstruction(data: LetterOfInstructionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('LETTER OF INSTRUCTION', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`From: ${data.author_name}`, { align: 'center' })
    doc.fontSize(10)
      .text(`To: ${data.executor_name} (${RELATIONSHIP_TEXT[data.executor_relationship] || data.executor_relationship})`, { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(10)
      .text(`Prepared: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
    doc.moveDown(1)

    doc.fontSize(8).font('Helvetica-Oblique')
      .text('NOTE: This letter is not a legal document. It is a personal guide to help my executor and loved ones.', { align: 'center' })
    doc.moveDown(1.5)

    // Important documents
    doc.fontSize(11).font('Helvetica-Bold').text('WHERE TO FIND IMPORTANT DOCUMENTS')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(data.important_documents_location)
    doc.moveDown(1)

    // Key contacts
    doc.fontSize(11).font('Helvetica-Bold').text('KEY CONTACTS')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    if (data.attorney_info && data.attorney_info.toLowerCase() !== 'none') {
      doc.text(`Attorney: ${data.attorney_info}`)
    }
    if (data.financial_advisor_info && data.financial_advisor_info.toLowerCase() !== 'none') {
      doc.text(`Financial Advisor / Accountant: ${data.financial_advisor_info}`)
    }
    doc.moveDown(1)

    // Insurance
    if (data.insurance_info && data.insurance_info.toLowerCase() !== 'none') {
      if (doc.y > 650) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text('INSURANCE POLICIES')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      const policies = data.insurance_info.split(',').map(s => s.trim()).filter(Boolean)
      policies.forEach(p => doc.text(`• ${p}`))
      doc.moveDown(1)
    }

    // Funeral wishes
    if (doc.y > 620) doc.addPage()
    doc.fontSize(11).font('Helvetica-Bold').text('FUNERAL & MEMORIAL WISHES')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Preference: ${FUNERAL_LABELS[data.funeral_wishes] || data.funeral_wishes}`)
    if (data.funeral_details && data.funeral_details.toLowerCase() !== 'none') {
      doc.text(`Details: ${data.funeral_details}`)
    }
    doc.text(`Organ Donor: ${data.organ_donation === 'yes' ? 'Yes' : data.organ_donation === 'no' ? 'No' : 'Not sure / not registered'}`)
    doc.moveDown(1)

    // People to notify
    if (data.people_to_notify && data.people_to_notify.toLowerCase() !== 'none') {
      if (doc.y > 620) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text('PEOPLE TO NOTIFY')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      const people = data.people_to_notify.split(',').map(s => s.trim()).filter(Boolean)
      people.forEach(p => doc.text(`• ${p}`))
      doc.moveDown(1)
    }

    // Pets
    if (data.pets_yn === 'yes' && data.pets_details) {
      if (doc.y > 620) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text('PET CARE')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(data.pets_details)
      doc.moveDown(1)
    }

    // Personal message
    if (data.personal_message && data.personal_message.toLowerCase() !== 'skip' && data.personal_message.toLowerCase() !== 'none') {
      if (doc.y > 550) doc.addPage()
      doc.fontSize(11).font('Helvetica-Bold').text('PERSONAL MESSAGE')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(data.personal_message)
      doc.moveDown(1.5)
    }

    // Signature
    doc.fontSize(10).font('Helvetica')
    doc.text('With love,')
    doc.moveDown(0.5)
    doc.text('_____________________________________________')
    doc.text(data.author_name)
    doc.text('Date: ___________________')

    doc.end()
  })
}

// ─── Advance Directive / Living Will PDF ────────────────────────────

interface AdvanceDirectiveData {
  state_select: string
  principal_name: string
  principal_address: string
  terminal_condition: string
  permanent_unconsciousness: string
  artificial_nutrition: string
  pain_management: string
  organ_donation: string
  additional_instructions?: string
}

const TREATMENT_TEXT: Record<string, string> = {
  withhold_all: 'I direct that all life-sustaining treatment be withheld or withdrawn',
  comfort_only: 'I direct that only comfort care and pain management be provided',
  continue_all: 'I direct that all available treatments be continued',
}

const NUTRITION_TEXT: Record<string, string> = {
  withhold: 'I direct that artificial nutrition and hydration be withheld',
  comfort_then_withdraw: 'I direct that artificial nutrition and hydration be provided for comfort initially, then withdrawn when no longer beneficial',
  continue: 'I direct that artificial nutrition and hydration be continued as long as medically possible',
}

const PAIN_TEXT: Record<string, string> = {
  max_relief: 'I direct maximum pain relief, including medications that may hasten death as a secondary effect',
  balanced: 'I direct pain relief balanced with maintaining alertness when possible',
  minimal: 'I direct minimal pain medication to maintain maximum alertness',
}

const ORGAN_TEXT: Record<string, string> = {
  donate_all: 'I wish to donate any needed organs and tissues',
  transplant_only: 'I wish to donate organs for transplant purposes only',
  no_donation: 'I do not wish to donate organs or tissues',
}

export function generateAdvanceDirective(data: AdvanceDirectiveData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const state = SUPPORTED_STATES[data.state_select]
    const stateName = state?.name || data.state_select

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('ADVANCE DIRECTIVE / LIVING WILL', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`State of ${stateName}`, { align: 'center' })
    doc.moveDown(1.5)

    doc.fontSize(8).font('Helvetica-Oblique')
      .text('IMPORTANT: This document was assembled by EasyEstatePlan and does not constitute legal advice. Consult an attorney for guidance specific to your situation.', { align: 'center' })
    doc.moveDown(1.5)

    // Declaration
    doc.fontSize(11).font('Helvetica-Bold').text('DECLARATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`I, ${data.principal_name}, residing at ${data.principal_address}, being of sound mind, voluntarily make this Advance Directive to express my wishes regarding medical treatment in the event I am unable to communicate those decisions myself.`)
    doc.moveDown(1)

    // Terminal condition
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 1: TERMINAL CONDITION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`If I have a terminal condition with no reasonable hope of recovery: ${TREATMENT_TEXT[data.terminal_condition]}.`)
    doc.moveDown(1)

    // Permanent unconsciousness
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 2: PERMANENT UNCONSCIOUSNESS')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`If I am permanently unconscious with no reasonable hope of regaining consciousness: ${TREATMENT_TEXT[data.permanent_unconsciousness]}.`)
    doc.moveDown(1)

    // Artificial nutrition
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 3: ARTIFICIAL NUTRITION AND HYDRATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`${NUTRITION_TEXT[data.artificial_nutrition]}.`)
    doc.moveDown(1)

    // Pain management
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 4: PAIN MANAGEMENT')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`${PAIN_TEXT[data.pain_management]}.`)
    doc.moveDown(1)

    // Organ donation
    if (doc.y > 600) doc.addPage()
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 5: ORGAN AND TISSUE DONATION')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`${ORGAN_TEXT[data.organ_donation]}.`)
    doc.moveDown(1)

    // Additional instructions
    if (data.additional_instructions && data.additional_instructions.toLowerCase() !== 'none') {
      doc.fontSize(11).font('Helvetica-Bold').text('SECTION 6: ADDITIONAL INSTRUCTIONS')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(data.additional_instructions)
      doc.moveDown(1)
    }

    // Execution
    if (doc.y > 500) doc.addPage()
    const execSection = data.additional_instructions && data.additional_instructions.toLowerCase() !== 'none' ? 7 : 6
    doc.fontSize(11).font('Helvetica-Bold').text(`SECTION ${execSection}: EXECUTION`)
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')

    if (state?.requiresNotarization) {
      doc.text(`Pursuant to the laws of the State of ${stateName}, this document must be notarized to be valid.`)
      doc.moveDown(0.3)
    }
    doc.text(`This document requires ${state?.requiresWitnesses || 2} witness(es) under ${stateName} law.`)
    doc.moveDown(1.5)

    // Signatures
    doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURES')
    doc.moveDown(1)
    doc.fontSize(10).font('Helvetica')
    doc.text('_____________________________________________')
    doc.text(`Declarant: ${data.principal_name}`)
    doc.text('Date: ___________________')
    doc.moveDown(1)

    const witnessCount = state?.requiresWitnesses || 2
    for (let i = 1; i <= witnessCount; i++) {
      doc.text('_____________________________________________')
      doc.text(`Witness ${i} Name: ___________________________`)
      doc.text(`Witness ${i} Address: _________________________`)
      doc.text('Date: ___________________')
      doc.moveDown(0.8)
    }

    if (state?.requiresNotarization) {
      if (doc.y > 550) doc.addPage()
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica-Bold').text('NOTARY ACKNOWLEDGMENT')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(`State of ${stateName}`)
      doc.text('County of ___________________')
      doc.moveDown(0.3)
      doc.text(`On this _____ day of _______________, 20____, before me, a Notary Public, personally appeared ${data.principal_name}, proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument, and acknowledged to me that they executed the same in their authorized capacity.`)
      doc.moveDown(0.8)
      doc.text('_____________________________________________')
      doc.text('Notary Public')
      doc.text('My Commission Expires: ___________________')
    }

    doc.end()
  })
}

// ─── Durable Financial POA PDF ──────────────────────────────────────

interface FinancialPOAData {
  age_range: string
  state_select: string
  principal_name: string
  principal_address: string
  agent_name: string
  agent_relationship: string
  agent_address: string
  agent_phone: string
  alternate_agent_yn?: string
  alternate_name?: string
  alternate_address?: string
  powers_scope: string
  hot_powers: string
  tax_powers: string
  real_estate_powers: string
  effective_when: string
  durability: string
}

const FINANCIAL_SCOPE_TEXT: Record<string, string> = {
  all: 'all financial matters, including but not limited to banking, investments, real estate, tax, insurance, business operations, government benefits, and estate transactions',
  banking_only: 'banking and bill-paying matters, including managing deposit accounts, paying bills, and handling routine financial transactions',
  banking_investments_realestate: 'banking, investment, and real estate matters, including managing deposit and investment accounts, paying bills, and buying, selling, or managing real property',
}

export function generateFinancialPOA(data: FinancialPOAData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const state = SUPPORTED_STATES[data.state_select]
    const stateName = state?.name || data.state_select

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('DURABLE FINANCIAL POWER OF ATTORNEY', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`State of ${stateName}`, { align: 'center' })
    doc.moveDown(1.5)

    doc.fontSize(8).font('Helvetica-Oblique')
      .text('IMPORTANT: This document was assembled by EasyEstatePlan and does not constitute legal advice. This is a powerful legal document — consult an attorney before signing.', { align: 'center' })
    doc.moveDown(1.5)

    // Section 1: Declaration
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 1: DECLARATION OF PRINCIPAL')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`I, ${data.principal_name}, residing at ${data.principal_address}, being of sound mind, do hereby designate and appoint the following individual as my Agent (Attorney-in-Fact) to manage my financial affairs:`)
    doc.moveDown(1)

    // Section 2: Agent
    doc.fontSize(11).font('Helvetica-Bold').text('SECTION 2: DESIGNATION OF AGENT')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Name: ${data.agent_name}`)
    doc.text(`Relationship: ${RELATIONSHIP_TEXT[data.agent_relationship] || data.agent_relationship}`)
    doc.text(`Address: ${data.agent_address}`)
    doc.text(`Phone: ${data.agent_phone}`)
    doc.moveDown(1)

    // Alternate agent
    let sectionNum = 3
    if (data.alternate_agent_yn === 'yes' && data.alternate_name) {
      doc.fontSize(11).font('Helvetica-Bold').text('SECTION 3: ALTERNATE AGENT')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(`If my designated Agent is unable, unwilling, or unavailable to serve, I designate:`)
      doc.moveDown(0.3)
      doc.text(`Name: ${data.alternate_name}`)
      if (data.alternate_address) doc.text(`Address: ${data.alternate_address}`)
      doc.moveDown(1)
      sectionNum = 4
    }

    // Powers granted
    doc.fontSize(11).font('Helvetica-Bold').text(`SECTION ${sectionNum}: POWERS GRANTED`)
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`I grant my Agent authority over ${FINANCIAL_SCOPE_TEXT[data.powers_scope] || FINANCIAL_SCOPE_TEXT.all}.`)
    doc.moveDown(0.5)

    // Specific powers
    if (data.hot_powers === 'yes') {
      doc.text('GIFT AND BENEFICIARY POWERS: My Agent is authorized to make gifts on my behalf and to create, amend, revoke, or terminate beneficiary designations for my accounts and policies.')
      doc.moveDown(0.3)
    }
    if (data.tax_powers === 'yes') {
      doc.text('TAX POWERS: My Agent is authorized to prepare, sign, and file tax returns on my behalf, communicate with taxing authorities, and make elections regarding tax matters.')
      doc.moveDown(0.3)
    }
    if (data.real_estate_powers === 'yes') {
      doc.text('REAL PROPERTY POWERS: My Agent is authorized to buy, sell, lease, manage, maintain, improve, and encumber any real property I own or may acquire.')
      doc.moveDown(0.3)
    }
    doc.moveDown(0.5)

    // Effective date
    sectionNum++
    doc.fontSize(11).font('Helvetica-Bold').text(`SECTION ${sectionNum}: EFFECTIVE DATE`)
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    doc.text(`This Power of Attorney shall become effective ${
      data.effective_when === 'immediately'
        ? 'immediately upon execution'
        : 'only upon a written determination by my attending physician that I am unable to manage my financial affairs (springing power of attorney)'
    }.`)
    doc.moveDown(0.5)

    // Durability
    doc.text(`This Power of Attorney ${
      data.durability === 'durable'
        ? 'shall not be affected by my subsequent disability or incapacity, and shall remain in full force and effect'
        : 'shall be revoked upon my disability or incapacity'
    }.`)
    doc.moveDown(1)

    // Execution
    if (doc.y > 500) doc.addPage()
    sectionNum++
    doc.fontSize(11).font('Helvetica-Bold').text(`SECTION ${sectionNum}: EXECUTION`)
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')

    if (state?.requiresNotarization) {
      doc.text(`Pursuant to the laws of the State of ${stateName}, this document must be notarized to be valid.`)
      doc.moveDown(0.3)
    }
    doc.text(`This document requires ${state?.requiresWitnesses || 2} witness(es) under ${stateName} law.`)
    doc.moveDown(1.5)

    // Signatures
    doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURES')
    doc.moveDown(1)
    doc.fontSize(10).font('Helvetica')
    doc.text('_____________________________________________')
    doc.text(`Principal: ${data.principal_name}`)
    doc.text('Date: ___________________')
    doc.moveDown(1)

    const witnessCount = state?.requiresWitnesses || 2
    for (let i = 1; i <= witnessCount; i++) {
      doc.text('_____________________________________________')
      doc.text(`Witness ${i} Name: ___________________________`)
      doc.text(`Witness ${i} Address: _________________________`)
      doc.text('Date: ___________________')
      doc.moveDown(0.8)
    }

    if (state?.requiresNotarization) {
      if (doc.y > 500) doc.addPage()
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica-Bold').text('NOTARY ACKNOWLEDGMENT')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(`State of ${stateName}`)
      doc.text('County of ___________________')
      doc.moveDown(0.3)
      doc.text(`On this _____ day of _______________, 20____, before me, a Notary Public, personally appeared ${data.principal_name}, proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument, and acknowledged to me that they executed the same in their authorized capacity and that by their signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.`)
      doc.moveDown(0.8)
      doc.text('_____________________________________________')
      doc.text('Notary Public')
      doc.text('My Commission Expires: ___________________')
    }

    doc.end()
  })
}

// ─── Beneficiary PDF ─────────────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Checking Account',
  savings: 'Savings Account',
  money_market: 'Money Market Account',
  cd: 'Certificate of Deposit (CD)',
  investment: 'Investment Account',
  ira: 'IRA',
  '401k': '401(k)',
  '403b': '403(b)',
  roth_ira: 'Roth IRA',
  life_insurance: 'Life Insurance',
  annuity: 'Annuity',
  pension: 'Pension',
  hsa: 'Health Savings Account (HSA)',
  brokerage: 'Brokerage Account',
  trust: 'Trust',
  other: 'Other',
}

const FREQ_LABELS: Record<string, string> = {
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  yearly: 'Yearly',
}

export function generateBeneficiaryPDF(
  accounts: BeneficiaryAccount[],
  userName: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text('BENEFICIARY DESIGNATION REVIEW', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
      .text(`Prepared for: ${userName}`, { align: 'center' })
    doc.fontSize(10)
      .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
    doc.moveDown(1.5)

    // Summary
    const dueCount = accounts.filter(
      (a) => a.nextReviewDueAt && new Date(a.nextReviewDueAt) <= new Date()
    ).length
    const totalBeneficiaries = accounts.reduce((sum, a) => sum + a.beneficiaries.length, 0)

    doc.fontSize(11).font('Helvetica-Bold').text('SUMMARY')
    doc.moveDown(0.4)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Total Accounts: ${accounts.length}`)
    doc.text(`Total Beneficiary Designations: ${totalBeneficiaries}`)
    doc.text(`Accounts Due for Review: ${dueCount}`)
    doc.moveDown(1.5)

    if (accounts.length === 0) {
      doc.text('No beneficiary accounts have been recorded yet.')
    } else {
      accounts.forEach((acct, idx) => {
        // Check if we need a new page (leave room for at least ~120 points)
        if (doc.y > 620) doc.addPage()

        const typeLabel = ACCOUNT_TYPE_LABELS[acct.accountType] || acct.accountType
        doc.fontSize(11).font('Helvetica-Bold')
          .text(`${idx + 1}. ${acct.institutionName} — ${typeLabel}`)
        doc.moveDown(0.3)
        doc.fontSize(9).font('Helvetica')

        if (acct.accountNickname) doc.text(`Nickname: ${acct.accountNickname}`)
        if (acct.accountNumber) doc.text(`Account #: ****${acct.accountNumber.slice(-4)}`)
        doc.text(`Designation Type: ${acct.designationType === 'per_stirpes' ? 'Per Stirpes' : 'Per Capita'}`)
        doc.text(`Review Frequency: ${FREQ_LABELS[acct.reviewFrequency] || acct.reviewFrequency}`)
        doc.text(`Last Reviewed: ${acct.lastReviewedAt ? new Date(acct.lastReviewedAt).toLocaleDateString() : 'Never'}`)

        const isDue = acct.nextReviewDueAt && new Date(acct.nextReviewDueAt) <= new Date()
        doc.text(`Next Review Due: ${acct.nextReviewDueAt ? new Date(acct.nextReviewDueAt).toLocaleDateString() : 'N/A'}${isDue ? '  *** OVERDUE ***' : ''}`)

        // Beneficiaries
        const primaries = acct.beneficiaries.filter((b) => b.type === 'primary')
        const contingents = acct.beneficiaries.filter((b) => b.type === 'contingent')

        if (primaries.length > 0) {
          doc.moveDown(0.3)
          doc.font('Helvetica-Bold').text('  Primary Beneficiaries:')
          doc.font('Helvetica')
          primaries.forEach((b) => {
            doc.text(`    • ${b.name} (${b.relationship}) — ${b.percentage}%`)
          })
        }

        if (contingents.length > 0) {
          doc.moveDown(0.2)
          doc.font('Helvetica-Bold').text('  Contingent Beneficiaries:')
          doc.font('Helvetica')
          contingents.forEach((b) => {
            doc.text(`    • ${b.name} (${b.relationship}) — ${b.percentage}%`)
          })
        }

        if (acct.notes) {
          doc.moveDown(0.2)
          doc.text(`  Notes: ${acct.notes}`)
        }

        doc.moveDown(1)
      })
    }

    // Footer disclaimer
    if (doc.y > 650) doc.addPage()
    doc.moveDown(1)
    doc.fontSize(8).font('Helvetica-Oblique')
      .text(
        'This document was generated by EasyEstatePlan for personal record-keeping. ' +
        'Contact each financial institution directly to verify current beneficiary designations ' +
        'and to make any changes. EasyEstatePlan does not provide legal or financial advice.',
        { align: 'center' }
      )

    doc.end()
  })
}
