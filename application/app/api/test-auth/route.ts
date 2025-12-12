import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

  return NextResponse.json({
    googleClientId: {
      value: googleClientId.substring(0, 20) + '...',
      length: googleClientId.length,
      hasNewline: googleClientId.includes('\n'),
      hasCarriageReturn: googleClientId.includes('\r'),
      trimmedLength: googleClientId.trim().length,
      charCodes: googleClientId.split('').slice(-5).map(c => c.charCodeAt(0)),
    },
    googleClientSecret: {
      value: googleClientSecret.substring(0, 10) + '...',
      length: googleClientSecret.length,
      hasNewline: googleClientSecret.includes('\n'),
      hasCarriageReturn: googleClientSecret.includes('\r'),
      trimmedLength: googleClientSecret.trim().length,
      charCodes: googleClientSecret.split('').slice(-5).map(c => c.charCodeAt(0)),
    }
  })
}
