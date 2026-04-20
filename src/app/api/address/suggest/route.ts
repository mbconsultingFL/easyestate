export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

/**
 * Address autocomplete proxy for the OpenStreetMap Nominatim service.
 *
 * Nominatim's usage policy requires a real, identifying User-Agent on every
 * request — a rule the browser cannot satisfy because it always sends its own
 * UA. We route through the server so we can set that header, cache short-lived
 * responses, and keep the upstream call off the client origin.
 *
 * Rate limit: Nominatim asks for <= 1 req/sec per application. The component
 * that consumes this endpoint debounces keystrokes to stay well under that.
 */

interface NominatimAddress {
  house_number?: string
  road?: string
  city?: string
  town?: string
  village?: string
  hamlet?: string
  county?: string
  state?: string
  postcode?: string
  country_code?: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  address: NominatimAddress
}

interface AddressSuggestion {
  id: string
  /** Short human-readable label for the dropdown row */
  label: string
  /** Second line with city/state/zip context */
  sublabel: string
  /** Full normalized address string that should land in the input */
  value: string
}

function formatSuggestion(r: NominatimResult): AddressSuggestion | null {
  const a = r.address || {}
  // Require a road; otherwise it's a region/landmark, not a mailable address.
  if (!a.road) return null

  const streetParts = [a.house_number, a.road].filter(Boolean)
  const street = streetParts.join(' ').trim()
  const city = a.city || a.town || a.village || a.hamlet || a.county || ''
  const state = a.state || ''
  const zip = a.postcode || ''

  if (!street || !city || !state) return null

  const valueParts = [street, city, state, zip].filter(Boolean)
  return {
    id: String(r.place_id),
    label: street,
    sublabel: [city, state, zip].filter(Boolean).join(', '),
    value: valueParts.join(', '),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes', 'us')
  url.searchParams.set('q', q)

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim's policy requires a real UA with contact info.
        'User-Agent': 'EasyEstatePlan/1.0 (+https://easyestateplan.com)',
        Accept: 'application/json',
      },
      // Small server-side cache to soften repeated prefix typing.
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] }, { status: 200 })
    }

    const data = (await res.json()) as NominatimResult[]
    const suggestions = data
      .map(formatSuggestion)
      .filter((s): s is AddressSuggestion => s !== null)

    return NextResponse.json(
      { suggestions },
      {
        headers: {
          // Allow the browser to reuse identical prefixes briefly.
          'Cache-Control': 'public, max-age=30',
        },
      },
    )
  } catch (err) {
    console.error('Address suggest proxy error:', err)
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
