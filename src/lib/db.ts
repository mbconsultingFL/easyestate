// JSON "tables" backed by the unified kv-store adapter.
//
// In production (Netlify) these are Netlify Blobs entries. In local dev they
// live on disk under `.data/`. Every function is async because Netlify Blobs
// is async — callers MUST `await` every call.
//
// The shape of the public API (users/documents/flowSessions/beneficiaryAccounts)
// is unchanged from the old synchronous file-DB module; only the return types
// moved from T to Promise<T>.

import { v4 as uuidv4 } from 'uuid'
import { getJSON, setJSON } from './kv-store'

async function readTable<T>(name: string): Promise<T[]> {
  const data = await getJSON<T[]>(name)
  return data ?? []
}

async function writeTable<T>(name: string, data: T[]): Promise<void> {
  await setJSON(name, data)
}

// ─── Types ────────────────────────────────────────────────────────────

export interface BeneficiaryPerson {
  name: string
  relationship: string // spouse | child | parent | sibling | friend | trust | charity | other
  percentage: number   // 0-100
  type: 'primary' | 'contingent'
}

export interface BeneficiaryAccount {
  id: string
  userId: string
  accountType: string // checking | savings | money_market | cd | investment | ira | 401k | 403b | roth_ira | life_insurance | annuity | pension | hsa | brokerage | trust | other
  institutionName: string
  accountNumber: string | null // stored masked
  accountNickname: string | null
  beneficiaries: BeneficiaryPerson[]
  designationType: string // per_stirpes | per_capita
  lastReviewedAt: string | null
  reviewFrequency: string // quarterly | semi_annual | yearly
  nextReviewDueAt: string | null
  // Future-proofing for Phase 2 (form storage & submission)
  institutionContactEmail: string | null
  institutionContactPhone: string | null
  institutionWebsiteUrl: string | null
  formTemplateId: string | null
  submissionStatus: string | null // not_started | pending | submitted | confirmed
  submissionTrackingId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string | null
  passwordHash: string
  subscriptionStatus: string // free | active | canceled
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  userId: string
  type: string
  status: string // not_started | in_progress | ready_to_sign | complete | needs_update
  state: string | null
  data: string | null // JSON string of form answers
  pdfPath: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FlowSession {
  id: string
  userId: string
  documentType: string
  currentStep: number
  answers: string // JSON string
  ageRange: string | null
  familySituation: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

// ─── User operations ──────────────────────────────────────────────────

export const users = {
  async findByEmail(email: string): Promise<User | undefined> {
    const all = await readTable<User>('users')
    return all.find((u) => u.email === email)
  },

  async findById(id: string): Promise<User | undefined> {
    const all = await readTable<User>('users')
    return all.find((u) => u.id === id)
  },

  async create(data: { email: string; passwordHash: string; name?: string | null }): Promise<User> {
    const all = await readTable<User>('users')
    const now = new Date().toISOString()
    const user: User = {
      id: uuidv4(),
      email: data.email,
      name: data.name || null,
      passwordHash: data.passwordHash,
      subscriptionStatus: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: now,
      updatedAt: now,
    }
    all.push(user)
    await writeTable('users', all)
    return user
  },

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const all = await readTable<User>('users')
    const idx = all.findIndex((u) => u.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
    await writeTable('users', all)
    return all[idx]
  },
}

// ─── Document operations ──────────────────────────────────────────────

export const documents = {
  async findByUserAndType(userId: string, type: string): Promise<Document | undefined> {
    const all = await readTable<Document>('documents')
    return all.find((d) => d.userId === userId && d.type === type)
  },

  async findByUser(userId: string): Promise<Document[]> {
    const all = await readTable<Document>('documents')
    return all.filter((d) => d.userId === userId)
  },

  async findById(id: string): Promise<Document | undefined> {
    const all = await readTable<Document>('documents')
    return all.find((d) => d.id === id)
  },

  async create(data: Partial<Document> & { userId: string; type: string }): Promise<Document> {
    const all = await readTable<Document>('documents')
    const now = new Date().toISOString()
    const doc: Document = {
      id: uuidv4(),
      userId: data.userId,
      type: data.type,
      status: data.status || 'not_started',
      state: data.state || null,
      data: data.data || null,
      pdfPath: data.pdfPath || null,
      completedAt: data.completedAt || null,
      createdAt: now,
      updatedAt: now,
    }
    all.push(doc)
    await writeTable('documents', all)
    return doc
  },

  async update(id: string, data: Partial<Document>): Promise<Document | undefined> {
    const all = await readTable<Document>('documents')
    const idx = all.findIndex((d) => d.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
    await writeTable('documents', all)
    return all[idx]
  },
}

// ─── FlowSession operations ──────────────────────────────────────────

export const flowSessions = {
  async findActiveByUser(userId: string, documentType: string): Promise<FlowSession | undefined> {
    const all = await readTable<FlowSession>('flowSessions')
    return all
      .filter((s) => s.userId === userId && s.documentType === documentType && !s.completed)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  },

  async findById(id: string): Promise<FlowSession | undefined> {
    const all = await readTable<FlowSession>('flowSessions')
    return all.find((s) => s.id === id)
  },

  async findByUserAndId(userId: string, id: string): Promise<FlowSession | undefined> {
    const all = await readTable<FlowSession>('flowSessions')
    return all.find((s) => s.id === id && s.userId === userId)
  },

  async create(data: { userId: string; documentType: string }): Promise<FlowSession> {
    const all = await readTable<FlowSession>('flowSessions')
    const now = new Date().toISOString()
    const session: FlowSession = {
      id: uuidv4(),
      userId: data.userId,
      documentType: data.documentType,
      currentStep: 0,
      answers: '{}',
      ageRange: null,
      familySituation: null,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }
    all.push(session)
    await writeTable('flowSessions', all)
    return session
  },

  async update(id: string, data: Partial<FlowSession>): Promise<FlowSession | undefined> {
    const all = await readTable<FlowSession>('flowSessions')
    const idx = all.findIndex((s) => s.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
    await writeTable('flowSessions', all)
    return all[idx]
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────

function calculateNextReviewDue(fromDate: string, frequency: string): string {
  const date = new Date(fromDate)
  switch (frequency) {
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'semi_annual':
      date.setMonth(date.getMonth() + 6)
      break
    case 'yearly':
    default:
      date.setFullYear(date.getFullYear() + 1)
  }
  return date.toISOString()
}

// Fields a client is allowed to set via the API. Anything not in this list
// (id, userId, createdAt, updatedAt, nextReviewDueAt, lastReviewedAt) is
// computed server-side and must not be overridden by request bodies.
const BENEFICIARY_EDITABLE_FIELDS: (keyof BeneficiaryAccount)[] = [
  'accountType',
  'institutionName',
  'accountNumber',
  'accountNickname',
  'beneficiaries',
  'designationType',
  'reviewFrequency',
  'institutionContactEmail',
  'institutionContactPhone',
  'institutionWebsiteUrl',
  'formTemplateId',
  'submissionStatus',
  'submissionTrackingId',
  'notes',
]

export function pickBeneficiaryFields(
  input: Record<string, unknown>
): Partial<BeneficiaryAccount> {
  const out: Partial<BeneficiaryAccount> = {}
  for (const key of BENEFICIARY_EDITABLE_FIELDS) {
    if (key in input) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(out as any)[key] = input[key]
    }
  }
  return out
}

// ─── BeneficiaryAccount operations ───────────────────────────────────

export const beneficiaryAccounts = {
  async findByUser(userId: string): Promise<BeneficiaryAccount[]> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    return all.filter((b) => b.userId === userId)
  },

  async findById(id: string): Promise<BeneficiaryAccount | undefined> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    return all.find((b) => b.id === id)
  },

  async findByUserAndId(userId: string, id: string): Promise<BeneficiaryAccount | undefined> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    return all.find((b) => b.userId === userId && b.id === id)
  },

  async create(
    data: Partial<BeneficiaryAccount> & {
      userId: string
      accountType: string
      institutionName: string
    }
  ): Promise<BeneficiaryAccount> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    const now = new Date().toISOString()
    const nextReviewDueAt = calculateNextReviewDue(now, data.reviewFrequency || 'yearly')
    const account: BeneficiaryAccount = {
      id: uuidv4(),
      userId: data.userId,
      accountType: data.accountType,
      institutionName: data.institutionName,
      accountNumber: data.accountNumber || null,
      accountNickname: data.accountNickname || null,
      beneficiaries: data.beneficiaries || [],
      designationType: data.designationType || 'per_stirpes',
      lastReviewedAt: null,
      reviewFrequency: data.reviewFrequency || 'yearly',
      nextReviewDueAt,
      institutionContactEmail: data.institutionContactEmail || null,
      institutionContactPhone: data.institutionContactPhone || null,
      institutionWebsiteUrl: data.institutionWebsiteUrl || null,
      formTemplateId: data.formTemplateId || null,
      submissionStatus: data.submissionStatus || null,
      submissionTrackingId: data.submissionTrackingId || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    }
    all.push(account)
    await writeTable('beneficiaryAccounts', all)
    return account
  },

  async update(id: string, data: Partial<BeneficiaryAccount>): Promise<BeneficiaryAccount | undefined> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    const idx = all.findIndex((b) => b.id === id)
    if (idx === -1) return undefined

    // Recalculate next review if frequency changed
    let nextReviewDueAt = all[idx].nextReviewDueAt
    if (data.reviewFrequency && data.reviewFrequency !== all[idx].reviewFrequency) {
      const base = all[idx].lastReviewedAt || all[idx].createdAt
      nextReviewDueAt = calculateNextReviewDue(base, data.reviewFrequency)
    }

    all[idx] = { ...all[idx], ...data, nextReviewDueAt, updatedAt: new Date().toISOString() }
    await writeTable('beneficiaryAccounts', all)
    return all[idx]
  },

  async markReviewed(id: string): Promise<BeneficiaryAccount | undefined> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    const idx = all.findIndex((b) => b.id === id)
    if (idx === -1) return undefined
    const now = new Date().toISOString()
    all[idx].lastReviewedAt = now
    all[idx].nextReviewDueAt = calculateNextReviewDue(now, all[idx].reviewFrequency)
    all[idx].updatedAt = now
    await writeTable('beneficiaryAccounts', all)
    return all[idx]
  },

  async delete(id: string): Promise<boolean> {
    const all = await readTable<BeneficiaryAccount>('beneficiaryAccounts')
    const idx = all.findIndex((b) => b.id === id)
    if (idx === -1) return false
    all.splice(idx, 1)
    await writeTable('beneficiaryAccounts', all)
    return true
  },

  async findDueForReview(userId: string): Promise<BeneficiaryAccount[]> {
    const all = await this.findByUser(userId)
    const now = new Date()
    return all.filter(
      (b) => b.nextReviewDueAt && new Date(b.nextReviewDueAt) <= now
    )
  },
}
