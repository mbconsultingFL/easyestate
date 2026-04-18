// This debug/test endpoint was removed as part of pre-prod hardening.
// The file is kept as a stub only because the FUSE-mounted workspace
// refused `rm`; delete this entire directory in your next commit:
//
//   rm -rf src/app/api/test-download
//
// The handler now returns 410 Gone so the route cannot be abused if the
// file survives a deploy by accident.

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(
    { error: 'Gone — debug endpoint removed' },
    { status: 410 }
  )
}
