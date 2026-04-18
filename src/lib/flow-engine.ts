export type QuestionType = 'chip-select' | 'multi-chip' | 'text-input' | 'multi-entry'

export interface EntryColumn {
  key: string
  label: string
  placeholder: string
  width?: string // e.g. '1' for flex-1, '120px' for fixed
}

export interface FlowQuestion {
  id: string
  text: string
  type: QuestionType
  options?: { label: string; value: string }[]
  placeholder?: string
  // Validation for text-input
  validation?: {
    pattern?: RegExp
    message?: string
    required?: boolean
  }
  // Multi-entry config
  columns?: EntryColumn[]
  minRows?: number
  maxRows?: number
  addLabel?: string // e.g. "+ Add another email"
  next: (answer: string, allAnswers: Record<string, string>) => string | null // null = flow complete
}

export interface FlowDefinition {
  id: string
  name: string
  questions: Record<string, FlowQuestion>
  startQuestion: string
}

// States where Medical POA is unambiguous
export const SUPPORTED_STATES: Record<string, { name: string; requiresNotarization: boolean; requiresWitnesses: number; registryAvailable: boolean }> = {
  CA: { name: 'California', requiresNotarization: false, requiresWitnesses: 1, registryAvailable: false },
  TX: { name: 'Texas', requiresNotarization: true, requiresWitnesses: 2, registryAvailable: false },
  FL: { name: 'Florida', requiresNotarization: true, requiresWitnesses: 2, registryAvailable: false },
  NY: { name: 'New York', requiresNotarization: true, requiresWitnesses: 2, registryAvailable: false },
  IL: { name: 'Illinois', requiresNotarization: true, requiresWitnesses: 1, registryAvailable: true },
}

export const medicalPOAFlow: FlowDefinition = {
  id: 'medical_poa',
  name: 'Healthcare Power of Attorney',
  questions: {
    // QUESTION 1: Age range (branching signal)
    age_range: {
      id: 'age_range',
      text: "Let's get started. Which age range are you in?",
      type: 'chip-select',
      options: [
        { label: 'Under 40', value: 'under_40' },
        { label: '40–60', value: '40_60' },
        { label: 'Over 60', value: 'over_60' },
      ],
      next: () => 'family_situation',
    },

    // QUESTION 2: Family situation (branching signal)
    family_situation: {
      id: 'family_situation',
      text: 'What best describes your family situation?',
      type: 'chip-select',
      options: [
        { label: 'Single, no dependents', value: 'no_dependents' },
        { label: 'Married / partnered', value: 'married' },
        { label: 'Have children', value: 'has_children' },
        { label: 'Single parent', value: 'single_parent' },
      ],
      next: (answer, allAnswers) => {
        // Over 60 gets urgency message
        if (allAnswers.age_range === 'over_60') return 'urgency_ack'
        return 'state_select'
      },
    },

    // For 60+ users: urgency acknowledgment
    urgency_ack: {
      id: 'urgency_ack',
      text: "Having a Healthcare POA in place is one of the most important things you can do for yourself and your family. Let's get this done today — it only takes a few minutes.",
      type: 'chip-select',
      options: [
        { label: "Let's do it", value: 'continue' },
      ],
      next: () => 'state_select',
    },

    // QUESTION 3: State selection
    state_select: {
      id: 'state_select',
      text: 'Which state do you live in? This determines the legal requirements for your document.',
      type: 'chip-select',
      options: [
        { label: 'California', value: 'CA' },
        { label: 'Texas', value: 'TX' },
        { label: 'Florida', value: 'FL' },
        { label: 'New York', value: 'NY' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Other state', value: 'other' },
      ],
      next: (answer) => {
        if (answer === 'other') return 'state_coming_soon'
        return 'principal_address'
      },
    },

    // Dead end for unsupported states
    state_coming_soon: {
      id: 'state_coming_soon',
      text: "We're working on adding support for your state. We'll notify you as soon as it's available. No charge until then.",
      type: 'chip-select',
      options: [
        { label: 'Notify me', value: 'notify' },
      ],
      next: () => null, // End flow
    },

    // QUESTION 4: Principal's address (name pulled from account)
    principal_address: {
      id: 'principal_address',
      text: 'What is your current home address?',
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'agent_name',
    },

    // QUESTION 6: Agent (the person receiving POA)
    agent_name: {
      id: 'agent_name',
      text: 'Who do you want to make medical decisions on your behalf if you cannot? Enter their full legal name.',
      type: 'text-input',
      placeholder: 'Agent full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'agent_relationship',
    },

    // QUESTION 7: Relationship to agent
    agent_relationship: {
      id: 'agent_relationship',
      text: 'What is your relationship to this person?',
      type: 'chip-select',
      options: [
        { label: 'Spouse / Partner', value: 'spouse' },
        { label: 'Parent', value: 'parent' },
        { label: 'Adult child', value: 'child' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Close friend', value: 'friend' },
        { label: 'Other', value: 'other' },
      ],
      next: () => 'agent_address',
    },

    // QUESTION 8: Agent address
    agent_address: {
      id: 'agent_address',
      text: "What is your agent's home address?",
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'agent_phone',
    },

    // QUESTION 9: Agent phone
    agent_phone: {
      id: 'agent_phone',
      text: "What is your agent's phone number?",
      type: 'text-input',
      placeholder: 'Phone number',
      validation: { required: true, pattern: /^\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/, message: 'Please enter a valid 10-digit phone number' },
      next: (_, allAnswers) => {
        // If married/has_children/single_parent, ask about alternate agent
        const fam = allAnswers.family_situation
        if (fam === 'married' || fam === 'has_children' || fam === 'single_parent') {
          return 'alternate_agent_yn'
        }
        // Under 40 no dependents: shortest path
        if (allAnswers.age_range === 'under_40' && fam === 'no_dependents') {
          return 'powers_scope'
        }
        return 'alternate_agent_yn'
      },
    },

    // QUESTION 10: Alternate agent?
    alternate_agent_yn: {
      id: 'alternate_agent_yn',
      text: 'Would you like to name an alternate agent in case your first choice is unavailable?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'alternate_name' : 'powers_scope',
    },

    // QUESTION 11: Alternate agent name
    alternate_name: {
      id: 'alternate_name',
      text: "What is your alternate agent's full legal name?",
      type: 'text-input',
      placeholder: 'Alternate agent full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'alternate_address',
    },

    // QUESTION 12: Alternate agent address
    alternate_address: {
      id: 'alternate_address',
      text: "What is your alternate agent's home address?",
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'powers_scope',
    },

    // QUESTION 13: Scope of powers
    powers_scope: {
      id: 'powers_scope',
      text: 'What scope of healthcare decisions should your agent be authorized to make?',
      type: 'chip-select',
      options: [
        { label: 'All healthcare decisions', value: 'all' },
        { label: 'All except end-of-life', value: 'all_except_eol' },
        { label: 'Only if I am incapacitated', value: 'incapacitated_only' },
      ],
      next: (_, allAnswers) => {
        if (allAnswers.age_range === 'over_60' || allAnswers.family_situation !== 'no_dependents') {
          return 'mental_health_yn'
        }
        return 'effective_when'
      },
    },

    // QUESTION 14: Mental health decisions (shown to 40+ or family)
    mental_health_yn: {
      id: 'mental_health_yn',
      text: 'Should your agent also be authorized to make mental health treatment decisions?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: () => 'effective_when',
    },

    // QUESTION 15: When does it take effect?
    effective_when: {
      id: 'effective_when',
      text: 'When should this Healthcare POA take effect?',
      type: 'chip-select',
      options: [
        { label: 'Immediately', value: 'immediately' },
        { label: 'Only when I cannot decide for myself', value: 'incapacity' },
      ],
      next: () => 'durability',
    },

    // QUESTION 16: Durability
    durability: {
      id: 'durability',
      text: 'Should this document remain in effect even if you become mentally incapacitated?',
      type: 'chip-select',
      options: [
        { label: 'Yes — keep it durable', value: 'durable' },
        { label: 'No — revoke upon incapacity', value: 'non_durable' },
      ],
      next: () => 'review_confirm',
    },

    // FINAL: Review
    review_confirm: {
      id: 'review_confirm',
      text: "Great — I have everything I need. Let me generate your Healthcare Power of Attorney. You'll be able to review it before signing.",
      type: 'chip-select',
      options: [
        { label: 'Generate my document', value: 'generate' },
      ],
      next: () => null, // Flow complete
    },
  },
  startQuestion: 'age_range',
}

// ─── HIPAA Authorization Flow ────────────────────────────────────────

export const hipaaAuthFlow: FlowDefinition = {
  id: 'hipaa_auth',
  name: 'HIPAA Authorization',
  questions: {
    // QUESTION 1: State selection
    state_select: {
      id: 'state_select',
      text: "Let's create your HIPAA Authorization. This lets people you trust access your medical records. First, which state do you live in?",
      type: 'chip-select',
      options: [
        { label: 'California', value: 'CA' },
        { label: 'Texas', value: 'TX' },
        { label: 'Florida', value: 'FL' },
        { label: 'New York', value: 'NY' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Other state', value: 'other' },
      ],
      next: (answer) => answer === 'other' ? 'state_coming_soon' : 'patient_dob',
    },

    state_coming_soon: {
      id: 'state_coming_soon',
      text: "We're working on adding support for your state. We'll notify you as soon as it's available.",
      type: 'chip-select',
      options: [{ label: 'Notify me', value: 'notify' }],
      next: () => null,
    },

    // QUESTION 2: Date of birth (name pulled from account)
    patient_dob: {
      id: 'patient_dob',
      text: 'What is your date of birth?',
      type: 'text-input',
      placeholder: 'MM/DD/YYYY',
      validation: { required: true, pattern: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/, message: 'Please enter a valid date in MM/DD/YYYY format' },
      next: () => 'patient_address',
    },

    // QUESTION 4: Address
    patient_address: {
      id: 'patient_address',
      text: 'What is your current home address?',
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'recipient_name',
    },

    // QUESTION 5: Who gets access
    recipient_name: {
      id: 'recipient_name',
      text: 'Who should be authorized to access your medical records? Enter their full legal name.',
      type: 'text-input',
      placeholder: 'Authorized person full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'recipient_relationship',
    },

    // QUESTION 6: Relationship
    recipient_relationship: {
      id: 'recipient_relationship',
      text: 'What is your relationship to this person?',
      type: 'chip-select',
      options: [
        { label: 'Spouse / Partner', value: 'spouse' },
        { label: 'Parent', value: 'parent' },
        { label: 'Adult child', value: 'child' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Healthcare agent', value: 'agent' },
        { label: 'Other', value: 'other' },
      ],
      next: () => 'additional_recipient_yn',
    },

    // QUESTION 7: Additional recipient?
    additional_recipient_yn: {
      id: 'additional_recipient_yn',
      text: 'Would you like to authorize an additional person?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'recipient2_name' : 'info_scope',
    },

    // QUESTION 8: Second recipient name
    recipient2_name: {
      id: 'recipient2_name',
      text: "What is the second authorized person's full legal name?",
      type: 'text-input',
      placeholder: 'Second person full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'recipient2_relationship',
    },

    // QUESTION 9: Second recipient relationship
    recipient2_relationship: {
      id: 'recipient2_relationship',
      text: 'What is your relationship to this person?',
      type: 'chip-select',
      options: [
        { label: 'Spouse / Partner', value: 'spouse' },
        { label: 'Parent', value: 'parent' },
        { label: 'Adult child', value: 'child' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Healthcare agent', value: 'agent' },
        { label: 'Other', value: 'other' },
      ],
      next: () => 'info_scope',
    },

    // QUESTION 10: Scope of information
    info_scope: {
      id: 'info_scope',
      text: 'What medical information should they be able to access?',
      type: 'chip-select',
      options: [
        { label: 'All medical records', value: 'all' },
        { label: 'All except mental health & substance abuse', value: 'all_except_sensitive' },
        { label: 'Only specific conditions', value: 'specific' },
      ],
      next: (answer) => answer === 'specific' ? 'specific_conditions' : 'purpose',
    },

    // QUESTION 11: Specific conditions (conditional)
    specific_conditions: {
      id: 'specific_conditions',
      text: 'Please describe the specific conditions or records you want to authorize access to.',
      type: 'text-input',
      placeholder: 'e.g., cardiac records, diabetes treatment history',
      next: () => 'purpose',
    },

    // QUESTION 12: Purpose
    purpose: {
      id: 'purpose',
      text: 'What is the purpose of this authorization?',
      type: 'chip-select',
      options: [
        { label: 'Ongoing care coordination', value: 'care_coordination' },
        { label: 'Emergency preparedness', value: 'emergency' },
        { label: 'Insurance or legal matter', value: 'insurance_legal' },
        { label: 'Personal / family records', value: 'personal' },
      ],
      next: () => 'expiration',
    },

    // QUESTION 13: Expiration
    expiration: {
      id: 'expiration',
      text: 'When should this authorization expire?',
      type: 'chip-select',
      options: [
        { label: '1 year', value: '1_year' },
        { label: '2 years', value: '2_years' },
        { label: 'Upon my revocation only', value: 'no_expiration' },
      ],
      next: () => 'review_confirm',
    },

    // FINAL: Review
    review_confirm: {
      id: 'review_confirm',
      text: "I have everything I need. Let me generate your HIPAA Authorization. You'll be able to review it before sharing.",
      type: 'chip-select',
      options: [{ label: 'Generate my document', value: 'generate' }],
      next: () => null,
    },
  },
  startQuestion: 'state_select',
}

// ─── Digital Asset Inventory Flow ────────────────────────────────────

export const digitalAssetsFlow: FlowDefinition = {
  id: 'digital_assets',
  name: 'Digital Asset Inventory',
  questions: {
    intro_ack: {
      id: 'intro_ack',
      text: "Let's put together your Digital Asset Inventory — a simple list of your online accounts and digital property so someone you trust can manage them if something happens to you. Your information is saved securely to your account. We never ask for or store passwords.",
      type: 'chip-select',
      options: [{ label: "Sounds good", value: 'continue' }],
      next: () => 'trusted_person_name',
    },

    trusted_person_name: {
      id: 'trusted_person_name',
      text: "If something happened to you, who should have access to your digital accounts? This could be your spouse, a family member, or someone you trust. What's their full name?",
      type: 'text-input',
      placeholder: 'e.g. Sarah Harrison',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'trusted_person_relationship',
    },

    trusted_person_relationship: {
      id: 'trusted_person_relationship',
      text: 'And how do you know them?',
      type: 'chip-select',
      options: [
        { label: 'Spouse / Partner', value: 'spouse' },
        { label: 'Adult child', value: 'child' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Attorney / Executor', value: 'attorney' },
        { label: 'Other', value: 'other' },
      ],
      next: () => 'trusted_person_contact',
    },

    trusted_person_contact: {
      id: 'trusted_person_contact',
      text: "What's the best way to reach them? A phone number or email is fine.",
      type: 'text-input',
      placeholder: 'e.g. (555) 867-5309 or sarah@email.com',
      validation: { required: true, pattern: /^(.+@.+\..+|\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})$/, message: 'Enter a valid email address or 10-digit phone number' },
      next: () => 'email_accounts',
    },

    // Category 1: Email
    email_accounts: {
      id: 'email_accounts',
      text: "Great. Now let's go through your accounts. Start with email.",
      type: 'multi-entry',
      columns: [
        { key: 'provider', label: 'Provider', placeholder: 'Gmail', width: '140px' },
        { key: 'email', label: 'Email address', placeholder: 'john@gmail.com' },
      ],
      minRows: 1,
      maxRows: 6,
      addLabel: '+ Add another email',
      next: () => 'social_media',
    },

    // Category 2: Social media
    social_media: {
      id: 'social_media',
      text: 'Any social media accounts?',
      type: 'multi-entry',
      columns: [
        { key: 'platform', label: 'Platform', placeholder: 'Facebook', width: '140px' },
        { key: 'username', label: 'Username or profile', placeholder: '@johnsmith' },
      ],
      minRows: 0,
      maxRows: 8,
      addLabel: '+ Add another account',
      next: () => 'financial_accounts',
    },

    // Category 3: Financial / banking online
    financial_accounts: {
      id: 'financial_accounts',
      text: 'What about online banking or investment accounts?',
      type: 'multi-entry',
      columns: [
        { key: 'institution', label: 'Institution', placeholder: 'Chase', width: '140px' },
        { key: 'account', label: 'Account type / last 4', placeholder: 'Checking (...4821)' },
      ],
      minRows: 0,
      maxRows: 10,
      addLabel: '+ Add another account',
      next: () => 'subscriptions',
    },

    // Category 4: Subscriptions
    subscriptions: {
      id: 'subscriptions',
      text: 'Any paid subscriptions your family should know about — streaming, software, memberships?',
      type: 'multi-entry',
      columns: [
        { key: 'service', label: 'Service', placeholder: 'Netflix', width: '140px' },
        { key: 'account', label: 'Account or billing info', placeholder: 'john@gmail.com' },
      ],
      minRows: 0,
      maxRows: 12,
      addLabel: '+ Add another',
      next: () => 'cloud_storage',
    },

    // Category 5: Cloud storage & files
    cloud_storage: {
      id: 'cloud_storage',
      text: 'Do you store important files or photos in the cloud?',
      type: 'multi-entry',
      columns: [
        { key: 'service', label: 'Service', placeholder: 'Google Drive', width: '140px' },
        { key: 'account', label: 'Account or email used', placeholder: 'john@gmail.com' },
      ],
      minRows: 0,
      maxRows: 6,
      addLabel: '+ Add another',
      next: () => 'crypto_yn',
    },

    // Category 6: Cryptocurrency
    crypto_yn: {
      id: 'crypto_yn',
      text: 'Do you have any cryptocurrency?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'crypto_details' : 'domains_yn',
    },

    crypto_details: {
      id: 'crypto_details',
      text: "Which platforms or wallets? Don't include any private keys or seed phrases here.",
      type: 'multi-entry',
      columns: [
        { key: 'platform', label: 'Platform / wallet', placeholder: 'Coinbase', width: '140px' },
        { key: 'details', label: 'Asset or notes', placeholder: 'Bitcoin, Ethereum' },
      ],
      minRows: 1,
      maxRows: 6,
      addLabel: '+ Add another',
      next: () => 'domains_yn',
    },

    // Category 7: Domains & websites
    domains_yn: {
      id: 'domains_yn',
      text: 'Do you own any websites or domain names?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'domain_details' : 'password_manager',
    },

    domain_details: {
      id: 'domain_details',
      text: 'List your domains and the registrar.',
      type: 'multi-entry',
      columns: [
        { key: 'domain', label: 'Domain', placeholder: 'mysite.com', width: '140px' },
        { key: 'registrar', label: 'Registrar', placeholder: 'GoDaddy' },
      ],
      minRows: 1,
      maxRows: 6,
      addLabel: '+ Add another domain',
      next: () => 'password_manager',
    },

    // Password management
    password_manager: {
      id: 'password_manager',
      text: 'Do you use a password manager like 1Password, LastPass, or Bitwarden?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'password_manager_name' : 'access_instructions',
    },

    password_manager_name: {
      id: 'password_manager_name',
      text: 'Which one?',
      type: 'text-input',
      placeholder: '1Password, LastPass, Bitwarden, etc.',
      next: () => 'access_instructions',
    },

    // General access instructions
    access_instructions: {
      id: 'access_instructions',
      text: "Almost done. Is there anything your trusted person should know about how to access your accounts? For example, where you keep passwords, where a backup key is stored, or how to get past two-factor authentication.",
      type: 'text-input',
      placeholder: 'e.g. Master password is in the safe, 2FA codes are on my phone',
      next: () => 'review_confirm',
    },

    review_confirm: {
      id: 'review_confirm',
      text: "That's everything. I'll generate your Digital Asset Inventory as a PDF. Keep it somewhere secure and share it only with the person you named.",
      type: 'chip-select',
      options: [{ label: 'Generate my document', value: 'generate' }],
      next: () => null,
    },
  },
  startQuestion: 'intro_ack',
}

// ─── Beneficiary Designation Checklist Flow ─────────────────────────

export const beneficiaryChecklistFlow: FlowDefinition = {
  id: 'beneficiary_checklist',
  name: 'Beneficiary Designation Checklist',
  questions: {
    intro_ack: {
      id: 'intro_ack',
      text: "Let's review your beneficiary designations. This checklist helps you verify that all your financial accounts have up-to-date beneficiaries. I'll ask about each account type — skip any that don't apply.",
      type: 'chip-select',
      options: [{ label: "Let's start", value: 'continue' }],
      next: () => 'marital_status',
    },

    marital_status: {
      id: 'marital_status',
      text: 'What is your marital status? This helps determine common beneficiary defaults.',
      type: 'chip-select',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Married / Partnered', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' },
      ],
      next: () => 'has_children',
    },

    has_children: {
      id: 'has_children',
      text: 'Do you have children?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: () => 'retirement_accounts',
    },

    // Retirement accounts
    retirement_accounts: {
      id: 'retirement_accounts',
      text: 'Do you have any retirement accounts (401k, IRA, Roth IRA, 403b, pension)?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'retirement_details' : 'life_insurance',
    },

    retirement_details: {
      id: 'retirement_details',
      text: 'List your retirement accounts with the institution and current primary beneficiary (e.g., "Fidelity 401k — spouse Jane Smith"). Separate multiples with a comma.',
      type: 'text-input',
      placeholder: 'Fidelity 401k — spouse Jane Smith, Vanguard IRA — children equally',
      next: () => 'life_insurance',
    },

    // Life insurance
    life_insurance: {
      id: 'life_insurance',
      text: 'Do you have any life insurance policies?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'life_insurance_details' : 'bank_accounts',
    },

    life_insurance_details: {
      id: 'life_insurance_details',
      text: 'List your life insurance policies with the company and current primary beneficiary.',
      type: 'text-input',
      placeholder: 'MetLife term policy — spouse Jane Smith',
      next: () => 'bank_accounts',
    },

    // Bank accounts
    bank_accounts: {
      id: 'bank_accounts',
      text: 'Do you have any bank accounts with a payable-on-death (POD) or transfer-on-death (TOD) beneficiary?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: "Not sure", value: 'unsure' },
      ],
      next: (answer) => answer === 'yes' ? 'bank_details' : 'investment_accounts',
    },

    bank_details: {
      id: 'bank_details',
      text: 'List your bank accounts with POD/TOD designations.',
      type: 'text-input',
      placeholder: 'Chase checking — POD to spouse, Ally savings — TOD to children',
      next: () => 'investment_accounts',
    },

    // Investment / brokerage
    investment_accounts: {
      id: 'investment_accounts',
      text: 'Do you have any investment or brokerage accounts with TOD beneficiaries?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'investment_details' : 'hsa_accounts',
    },

    investment_details: {
      id: 'investment_details',
      text: 'List your investment accounts with TOD designations.',
      type: 'text-input',
      placeholder: 'Schwab brokerage — TOD to spouse',
      next: () => 'hsa_accounts',
    },

    // HSA
    hsa_accounts: {
      id: 'hsa_accounts',
      text: 'Do you have a Health Savings Account (HSA)?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'hsa_details' : 'last_review',
    },

    hsa_details: {
      id: 'hsa_details',
      text: 'List your HSA with the provider and current beneficiary.',
      type: 'text-input',
      placeholder: 'Optum HSA — beneficiary spouse',
      next: () => 'last_review',
    },

    // Review timing
    last_review: {
      id: 'last_review',
      text: 'When did you last review all your beneficiary designations?',
      type: 'chip-select',
      options: [
        { label: 'Within the past year', value: 'within_year' },
        { label: '1–3 years ago', value: '1_3_years' },
        { label: 'More than 3 years ago', value: 'over_3_years' },
        { label: 'Never / not sure', value: 'never' },
      ],
      next: () => 'review_frequency',
    },

    review_frequency: {
      id: 'review_frequency',
      text: 'How often would you like to be reminded to review your beneficiaries?',
      type: 'chip-select',
      options: [
        { label: 'Every 6 months', value: 'semi_annual' },
        { label: 'Once a year', value: 'yearly' },
        { label: 'Every 2 years', value: 'biennial' },
      ],
      next: () => 'notes',
    },

    notes: {
      id: 'notes',
      text: 'Any additional notes or concerns about your beneficiary designations? (Enter "None" to skip.)',
      type: 'text-input',
      placeholder: 'e.g., Need to update after recent divorce, want to add charity',
      next: () => 'review_confirm',
    },

    review_confirm: {
      id: 'review_confirm',
      text: "I'll generate your Beneficiary Designation Checklist. This is a great document to review annually or after any major life event.",
      type: 'chip-select',
      options: [{ label: 'Generate my document', value: 'generate' }],
      next: () => null,
    },
  },
  startQuestion: 'intro_ack',
}

// ─── Letter of Instruction to Executor Flow ─────────────────────────

export const letterOfInstructionFlow: FlowDefinition = {
  id: 'letter_of_instruction',
  name: 'Letter of Instruction to Executor',
  questions: {
    intro_ack: {
      id: 'intro_ack',
      text: "Let's create your Letter of Instruction. This personal (non-legal) letter guides your executor or loved ones through your wishes, important contacts, and where to find key documents. Take your time — there's no wrong answer.",
      type: 'chip-select',
      options: [{ label: "Let's begin", value: 'continue' }],
      next: () => 'executor_name',
    },

    executor_name: {
      id: 'executor_name',
      text: 'Who is your executor or the primary person who will carry out your wishes?',
      type: 'text-input',
      placeholder: 'Executor full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'executor_relationship',
    },

    executor_relationship: {
      id: 'executor_relationship',
      text: 'What is your relationship to this person?',
      type: 'chip-select',
      options: [
        { label: 'Spouse / Partner', value: 'spouse' },
        { label: 'Adult child', value: 'child' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Attorney', value: 'attorney' },
        { label: 'Close friend', value: 'friend' },
        { label: 'Other', value: 'other' },
      ],
      next: () => 'important_documents_location',
    },

    // Where to find things
    important_documents_location: {
      id: 'important_documents_location',
      text: 'Where do you keep your important documents (will, insurance policies, deeds, etc.)?',
      type: 'text-input',
      placeholder: 'e.g., Fireproof safe in home office, safe deposit box at Chase Bank',
      next: () => 'attorney_info',
    },

    attorney_info: {
      id: 'attorney_info',
      text: 'Do you have an attorney? If so, enter their name and contact info. Enter "None" if not applicable.',
      type: 'text-input',
      placeholder: 'Jane Doe, Esq. — (555) 123-4567',
      next: () => 'financial_advisor_info',
    },

    financial_advisor_info: {
      id: 'financial_advisor_info',
      text: 'Do you have a financial advisor or accountant? Enter their name and contact info, or "None".',
      type: 'text-input',
      placeholder: 'John Smith, CPA — (555) 987-6543',
      next: () => 'insurance_info',
    },

    insurance_info: {
      id: 'insurance_info',
      text: 'List any insurance policies (life, property, auto) and where the policies can be found.',
      type: 'text-input',
      placeholder: 'MetLife term life — policy in safe, State Farm auto & home — agent is Bob Jones',
      next: () => 'funeral_wishes',
    },

    // Funeral & memorial
    funeral_wishes: {
      id: 'funeral_wishes',
      text: 'What are your wishes for funeral or memorial arrangements?',
      type: 'chip-select',
      options: [
        { label: 'Traditional burial', value: 'burial' },
        { label: 'Cremation', value: 'cremation' },
        { label: 'Celebration of life', value: 'celebration' },
        { label: 'No preference', value: 'no_preference' },
      ],
      next: () => 'funeral_details',
    },

    funeral_details: {
      id: 'funeral_details',
      text: 'Any additional details about your memorial wishes? (e.g., specific location, music, readings, donations in lieu of flowers.) Enter "None" to skip.',
      type: 'text-input',
      placeholder: 'Donations to American Cancer Society in lieu of flowers',
      next: () => 'organ_donation',
    },

    organ_donation: {
      id: 'organ_donation',
      text: 'Are you registered as an organ donor?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Not sure', value: 'unsure' },
      ],
      next: () => 'people_to_notify',
    },

    // People to notify
    people_to_notify: {
      id: 'people_to_notify',
      text: 'List people who should be notified (beyond immediate family). Include name and best contact method.',
      type: 'text-input',
      placeholder: 'College friend Bob — bob@email.com, Neighbor Mary — (555) 111-2222',
      next: () => 'pets_yn',
    },

    // Pets
    pets_yn: {
      id: 'pets_yn',
      text: 'Do you have pets that will need care?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'pets_details' : 'personal_message',
    },

    pets_details: {
      id: 'pets_details',
      text: 'Describe your pets and who should care for them (e.g., "Golden retriever Max — sister Sarah has agreed to take him").',
      type: 'text-input',
      placeholder: 'Dog Max — sister Sarah, Cat Luna — friend Mike',
      next: () => 'personal_message',
    },

    // Personal message
    personal_message: {
      id: 'personal_message',
      text: 'Would you like to include a personal message to your loved ones? This can be anything — words of love, life advice, or practical reminders. Enter "Skip" to omit.',
      type: 'text-input',
      placeholder: 'Your personal message...',
      next: () => 'review_confirm',
    },

    review_confirm: {
      id: 'review_confirm',
      text: "I'll generate your Letter of Instruction. This is a deeply personal document — feel free to revisit and update it anytime.",
      type: 'chip-select',
      options: [{ label: 'Generate my document', value: 'generate' }],
      next: () => null,
    },
  },
  startQuestion: 'intro_ack',
}

// ─── Advance Directive / Living Will Flow ───────────────────────────

export const advanceDirectiveFlow: FlowDefinition = {
  id: 'advance_directive',
  name: 'Advance Directive / Living Will',
  questions: {
    state_select: {
      id: 'state_select',
      text: "Let's create your Advance Directive (Living Will). This document specifies your wishes for end-of-life medical care. First, which state do you live in?",
      type: 'chip-select',
      options: [
        { label: 'California', value: 'CA' },
        { label: 'Texas', value: 'TX' },
        { label: 'Florida', value: 'FL' },
        { label: 'New York', value: 'NY' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Other state', value: 'other' },
      ],
      next: (answer) => answer === 'other' ? 'state_coming_soon' : 'principal_address',
    },

    state_coming_soon: {
      id: 'state_coming_soon',
      text: "We're working on adding support for your state. We'll notify you as soon as it's available.",
      type: 'chip-select',
      options: [{ label: 'Notify me', value: 'notify' }],
      next: () => null,
    },

    // Name pulled from account
    principal_address: {
      id: 'principal_address',
      text: 'What is your current home address?',
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'terminal_condition',
    },

    // Life-sustaining treatment: terminal condition
    terminal_condition: {
      id: 'terminal_condition',
      text: 'If you have a terminal condition with no reasonable hope of recovery, what are your wishes regarding life-sustaining treatment?',
      type: 'chip-select',
      options: [
        { label: 'Withhold all life-sustaining treatment', value: 'withhold_all' },
        { label: 'Provide comfort care only (pain management)', value: 'comfort_only' },
        { label: 'Continue all available treatment', value: 'continue_all' },
      ],
      next: () => 'permanent_unconsciousness',
    },

    // Permanent unconsciousness
    permanent_unconsciousness: {
      id: 'permanent_unconsciousness',
      text: 'If you are permanently unconscious with no reasonable hope of regaining consciousness, what are your wishes?',
      type: 'chip-select',
      options: [
        { label: 'Withhold all life-sustaining treatment', value: 'withhold_all' },
        { label: 'Provide comfort care only', value: 'comfort_only' },
        { label: 'Continue all available treatment', value: 'continue_all' },
      ],
      next: () => 'artificial_nutrition',
    },

    // Artificial nutrition & hydration
    artificial_nutrition: {
      id: 'artificial_nutrition',
      text: 'What are your wishes regarding artificial nutrition and hydration (tube feeding, IV fluids) in the above scenarios?',
      type: 'chip-select',
      options: [
        { label: 'Withhold artificial nutrition and hydration', value: 'withhold' },
        { label: 'Provide for comfort only, then withdraw', value: 'comfort_then_withdraw' },
        { label: 'Continue as long as possible', value: 'continue' },
      ],
      next: () => 'pain_management',
    },

    // Pain management
    pain_management: {
      id: 'pain_management',
      text: 'Regarding pain management, what is your preference?',
      type: 'chip-select',
      options: [
        { label: 'Maximum pain relief, even if it hastens death', value: 'max_relief' },
        { label: 'Pain relief balanced with alertness', value: 'balanced' },
        { label: 'Minimal medication to stay as alert as possible', value: 'minimal' },
      ],
      next: () => 'organ_donation',
    },

    // Organ donation
    organ_donation: {
      id: 'organ_donation',
      text: 'What are your wishes regarding organ and tissue donation?',
      type: 'chip-select',
      options: [
        { label: 'Donate any needed organs and tissues', value: 'donate_all' },
        { label: 'Donate for transplant only', value: 'transplant_only' },
        { label: 'Do not donate', value: 'no_donation' },
      ],
      next: () => 'additional_instructions',
    },

    // Additional instructions
    additional_instructions: {
      id: 'additional_instructions',
      text: 'Any additional instructions regarding your end-of-life care? (e.g., religious considerations, specific treatments to avoid.) Enter "None" to skip.',
      type: 'text-input',
      placeholder: 'Any specific wishes or religious considerations',
      next: () => 'review_confirm',
    },

    review_confirm: {
      id: 'review_confirm',
      text: "I have your wishes recorded. Let me generate your Advance Directive. This is an important document — please discuss your wishes with your family and healthcare agent.",
      type: 'chip-select',
      options: [{ label: 'Generate my document', value: 'generate' }],
      next: () => null,
    },
  },
  startQuestion: 'state_select',
}

// ─── Durable Financial POA Flow ─────────────────────────────────────

export const financialPOAFlow: FlowDefinition = {
  id: 'financial_poa',
  name: 'Durable Financial Power of Attorney',
  questions: {
    age_range: {
      id: 'age_range',
      text: "Let's create your Durable Financial Power of Attorney. This lets someone you trust manage your finances if you can't. Which age range are you in?",
      type: 'chip-select',
      options: [
        { label: 'Under 40', value: 'under_40' },
        { label: '40–60', value: '40_60' },
        { label: 'Over 60', value: 'over_60' },
      ],
      next: () => 'state_select',
    },

    state_select: {
      id: 'state_select',
      text: 'Which state do you live in?',
      type: 'chip-select',
      options: [
        { label: 'California', value: 'CA' },
        { label: 'Texas', value: 'TX' },
        { label: 'Florida', value: 'FL' },
        { label: 'New York', value: 'NY' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Other state', value: 'other' },
      ],
      next: (answer) => answer === 'other' ? 'state_coming_soon' : 'principal_address',
    },

    state_coming_soon: {
      id: 'state_coming_soon',
      text: "We're working on adding support for your state. We'll notify you as soon as it's available.",
      type: 'chip-select',
      options: [{ label: 'Notify me', value: 'notify' }],
      next: () => null,
    },

    // Name pulled from account
    principal_address: {
      id: 'principal_address',
      text: 'What is your current home address?',
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'agent_name',
    },

    agent_name: {
      id: 'agent_name',
      text: 'Who do you want to manage your finances on your behalf? Enter their full legal name.',
      type: 'text-input',
      placeholder: 'Agent full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'agent_relationship',
    },

    agent_relationship: {
      id: 'agent_relationship',
      text: 'What is your relationship to this person?',
      type: 'chip-select',
      options: [
        { label: 'Spouse / Partner', value: 'spouse' },
        { label: 'Parent', value: 'parent' },
        { label: 'Adult child', value: 'child' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Attorney', value: 'attorney' },
        { label: 'Other', value: 'other' },
      ],
      next: () => 'agent_address',
    },

    agent_address: {
      id: 'agent_address',
      text: "What is your agent's home address?",
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'agent_phone',
    },

    agent_phone: {
      id: 'agent_phone',
      text: "What is your agent's phone number?",
      type: 'text-input',
      placeholder: 'Phone number',
      validation: { required: true, pattern: /^\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/, message: 'Please enter a valid 10-digit phone number' },
      next: () => 'alternate_agent_yn',
    },

    alternate_agent_yn: {
      id: 'alternate_agent_yn',
      text: 'Would you like to name an alternate agent in case your first choice is unavailable?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: (answer) => answer === 'yes' ? 'alternate_name' : 'powers_scope',
    },

    alternate_name: {
      id: 'alternate_name',
      text: "What is your alternate agent's full legal name?",
      type: 'text-input',
      placeholder: 'Alternate agent full legal name',
      validation: { required: true, pattern: /^[a-zA-Z\s\-'.]{2,}$/, message: 'Please enter a valid name (letters, spaces, hyphens)' },
      next: () => 'alternate_address',
    },

    alternate_address: {
      id: 'alternate_address',
      text: "What is your alternate agent's home address?",
      type: 'text-input',
      placeholder: 'Street, City, State, ZIP',
      validation: { required: true, pattern: /^.{5,}$/, message: 'Please enter a complete address' },
      next: () => 'powers_scope',
    },

    // Financial powers scope
    powers_scope: {
      id: 'powers_scope',
      text: 'What financial powers should your agent have?',
      type: 'chip-select',
      options: [
        { label: 'All financial matters', value: 'all' },
        { label: 'Banking and bills only', value: 'banking_only' },
        { label: 'Banking, investments, and real estate', value: 'banking_investments_realestate' },
      ],
      next: () => 'hot_powers',
    },

    // "Hot powers" — gifts, beneficiary changes, etc.
    hot_powers: {
      id: 'hot_powers',
      text: 'Should your agent be able to make gifts or change beneficiary designations on your behalf? Many states require this to be explicitly granted ("hot powers").',
      type: 'chip-select',
      options: [
        { label: 'Yes — grant gifting and beneficiary powers', value: 'yes' },
        { label: 'No — do not grant these powers', value: 'no' },
      ],
      next: () => 'tax_powers',
    },

    tax_powers: {
      id: 'tax_powers',
      text: 'Should your agent be authorized to file tax returns and handle tax matters on your behalf?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: () => 'real_estate_powers',
    },

    real_estate_powers: {
      id: 'real_estate_powers',
      text: 'Should your agent be authorized to buy, sell, or manage real property on your behalf?',
      type: 'chip-select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      next: () => 'effective_when',
    },

    effective_when: {
      id: 'effective_when',
      text: 'When should this Financial POA take effect?',
      type: 'chip-select',
      options: [
        { label: 'Immediately (springing not required)', value: 'immediately' },
        { label: 'Only upon my incapacity (springing POA)', value: 'incapacity' },
      ],
      next: () => 'durability',
    },

    durability: {
      id: 'durability',
      text: 'Should this document remain in effect if you become mentally incapacitated? (This is what makes it "durable.")',
      type: 'chip-select',
      options: [
        { label: 'Yes — keep it durable', value: 'durable' },
        { label: 'No — revoke upon incapacity', value: 'non_durable' },
      ],
      next: () => 'review_confirm',
    },

    review_confirm: {
      id: 'review_confirm',
      text: "I have everything I need. Let me generate your Durable Financial Power of Attorney. Remember — this is a powerful document, so make sure you trust your agent completely.",
      type: 'chip-select',
      options: [{ label: 'Generate my document', value: 'generate' }],
      next: () => null,
    },
  },
  startQuestion: 'age_range',
}

// ─── Flow Registry ───────────────────────────────────────────────────

export const FLOW_REGISTRY: Record<string, FlowDefinition> = {
  medical_poa: medicalPOAFlow,
  hipaa_auth: hipaaAuthFlow,
  digital_assets: digitalAssetsFlow,
  beneficiary_checklist: beneficiaryChecklistFlow,
  letter_of_instruction: letterOfInstructionFlow,
  advance_directive: advanceDirectiveFlow,
  financial_poa: financialPOAFlow,
}

export const FLOW_DISPLAY_NAMES: Record<string, string> = {
  medical_poa: 'Healthcare Power of Attorney',
  hipaa_auth: 'HIPAA Authorization',
  digital_assets: 'Digital Asset Inventory',
  beneficiary_checklist: 'Beneficiary Designation Checklist',
  letter_of_instruction: 'Letter of Instruction to Executor',
  advance_directive: 'Advance Directive / Living Will',
  financial_poa: 'Durable Financial Power of Attorney',
}

export function getFlowDefinition(documentType: string): FlowDefinition | null {
  return FLOW_REGISTRY[documentType] || null
}

export function getNextQuestion(flow: FlowDefinition, currentId: string, answer: string, allAnswers: Record<string, string>): FlowQuestion | null {
  const current = flow.questions[currentId]
  if (!current) return null
  const nextId = current.next(answer, allAnswers)
  if (!nextId) return null
  return flow.questions[nextId] || null
}

export function getQuestion(flow: FlowDefinition, questionId: string): FlowQuestion | null {
  return flow.questions[questionId] || null
}
