import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// STUB: Stripe Checkout integration
// In production, replace with actual Stripe API calls
// npm install stripe, then use stripe.checkout.sessions.create()

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const billingInterval = body.billingInterval === 'annual' ? 'annual' : 'monthly'

  // STUB: In production, this would:
  // 1. Select the correct Stripe Price ID based on billingInterval
  //    - monthly: process.env.STRIPE_PRICE_ID_MONTHLY  ($9.99/mo)
  //    - annual:  process.env.STRIPE_PRICE_ID_ANNUAL   ($99.99/yr)
  // 2. Create a Stripe Checkout Session for the subscription
  // 3. Return the checkout URL
  // 4. Handle webhook for subscription confirmation

  return NextResponse.json({
    stub: true,
    billingInterval,
    message: 'Stripe integration ready for API key configuration',
    checkoutUrl: null,
    instructions: `Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID_MONTHLY, and STRIPE_PRICE_ID_ANNUAL in .env to activate. Selected interval: ${billingInterval}. Set up webhook endpoint at /api/stripe/webhook for subscription events.`,
  })
}
