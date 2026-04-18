# EasyEstate — Estate Planning Document Assembly

A web application that guides users through estate planning document assembly via a chat-style conversational interface. MVP feature: Healthcare / Medical Power of Attorney.

## Quick Start

```bash
cd easyestate
npm install
npm run dev
```

Then open http://localhost:3000

## What's Included

### Pages
- **/** — Landing page with pricing and "how it works"
- **/register** — Account creation (free, no credit card)
- **/login** — Email/password sign-in
- **/dashboard** — Document hub showing all document types and their status
- **/flow** — Chat-style Medical POA questionnaire
- **/subscribe** — Subscription upgrade page ($9.99/mo)

### Chat Flow (Medical POA)
- Asks one question at a time via clickable answer chips
- Free text only for names and addresses
- Branches based on age range and family situation:
  - Under 40 / no dependents → shortest path
  - 40–60 with family → adds alternate agent, mental health powers
  - 60+ → urgency framing, full question set
- Pause and resume mid-flow (progress saved to server)
- Generates a filled, state-correct PDF on completion

### Supported States (MVP)
| State | Notarization | Witnesses | Registry |
|-------|-------------|-----------|----------|
| California | No | 1 | No |
| Texas | Yes | 2 | No |
| Florida | Yes | 2 | No |
| New York | Yes | 2 | No |
| Illinois | Yes | 1 | Yes |

All other states show "Coming soon" without charging the user.

### API Routes
| Route | Purpose |
|-------|---------|
| POST /api/auth/register | Create account |
| /api/auth/[...nextauth] | NextAuth sign-in/out |
| GET /api/flow/current | Get active flow session |
| POST /api/flow/start | Start new Medical POA flow |
| POST /api/flow/save | Save flow progress |
| POST /api/flow/complete | Mark flow as complete |
| GET /api/documents/status | Get user's document statuses |
| POST /api/documents/generate | Generate Medical POA PDF |
| GET /api/documents/download/[type] | Download completed PDF |
| POST /api/documents/docusign | DocuSign e-signature (stub) |
| POST /api/documents/notarize | Notarize.com (stub) |
| POST /api/stripe/checkout | Stripe subscription (stub) |
| POST /api/stripe/webhook | Stripe webhook handler (stub) |

## Architecture

```
src/
├── app/                     # Next.js App Router pages + API routes
├── components/              # React components
│   ├── AuthProvider.tsx      # NextAuth session wrapper
│   ├── ChatFlow.tsx          # Main chat orchestrator
│   ├── ChatMessage.tsx       # Individual message bubble
│   ├── AnswerChips.tsx       # Clickable answer buttons
│   └── TextInput.tsx         # Free text input for names/addresses
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # JSON file-based database (swap for Prisma/PG in prod)
│   ├── flow-engine.ts       # Question flow definitions and branching logic
│   └── pdf-generator.ts     # Server-side PDF generation with pdfkit
└── types/                   # TypeScript declarations
```

## Integration Setup (Production)

### Stripe
Set in `.env`:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### DocuSign
```
DOCUSIGN_INTEGRATION_KEY=...
DOCUSIGN_USER_ID=...
DOCUSIGN_ACCOUNT_ID=...
DOCUSIGN_RSA_PRIVATE_KEY=...
```

### Notarize.com
```
NOTARIZE_API_KEY=...
NOTARIZE_ORGANIZATION_ID=...
```

### Production Database
The prototype uses a JSON file store (`.data/` directory). For production, swap `src/lib/db.ts` for Prisma + PostgreSQL. The Prisma schema is already defined in `prisma/schema.prisma`.

## Phase 2 Documents (Locked on Dashboard)
- HIPAA Authorization
- Advance Directive / Living Will
- Durable Financial POA
- Beneficiary Designation Checklist
- Digital Asset Inventory
- Letter of Instruction to Executor

Each will be unlocked after per-state legal review.

## Important Disclaimers
- This app assembles documents only. It never gives legal advice.
- Documents are based on standard templates per state.
- Users should have an attorney review completed documents.
- EasyEstate is not a law firm.
