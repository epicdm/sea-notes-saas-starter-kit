import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Try to import and use the auth module
    const { signIn } = await import('@/auth')

    return NextResponse.json({
      success: true,
      message: 'Auth module loaded successfully',
      signInExists: typeof signIn === 'function'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error)
    }, { status: 500 })
  }
}
