import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// GET /api/user/analytics - Get analytics data
export async function GET(req: NextRequest) {
  try {
    // LOCALHOST BYPASS: Use test user email for local development
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
    } else {
      const session = await auth();

      if (!session?.user?.email) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Authentication required',
              code: 'UNAUTHORIZED'
            }
          },
          { status: 401 }
        );
      }

      userEmail = session.user.email;
    }

    // Proxy to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/user/analytics`, {
      headers: {
        'X-User-Email': userEmail,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend request failed' }))
      return NextResponse.json(error, { status: response.status })
    }

    const flaskResponse = await response.json()

    return NextResponse.json({
      success: true,
      data: flaskResponse
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
