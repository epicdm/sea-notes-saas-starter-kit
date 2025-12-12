import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// GET /api/user/brand-profile - Get brand profile for authenticated user
export async function GET(req: NextRequest) {
  try {
    // LOCALHOST BYPASS: Use test user email for local development
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Brand Profile API route');
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

    // Proxy to Flask backend with user email
    const response = await fetch(`${BACKEND_URL}/api/user/brand-profile`, {
      headers: {
        'X-User-Email': userEmail,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      // 404 means no brand profile yet (not an error)
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: null
        })
      }

      const error = await response.json().catch(() => ({ error: 'Backend request failed' }))
      return NextResponse.json(error, { status: response.status })
    }

    const brandProfile = await response.json()

    return NextResponse.json({
      success: true,
      data: brandProfile
    })
  } catch (error) {
    console.error('Brand Profile API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/user/brand-profile - Create or update brand profile
export async function POST(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Brand Profile API route');
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

    const body = await req.json()

    // Proxy to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/user/brand-profile`, {
      method: 'POST',
      headers: {
        'X-User-Email': userEmail,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend request failed' }))
      return NextResponse.json(error, { status: response.status })
    }

    const brandProfile = await response.json()

    return NextResponse.json({
      success: true,
      data: brandProfile
    })
  } catch (error) {
    console.error('Brand Profile API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

// PUT /api/user/brand-profile - Update brand profile
export async function PUT(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Brand Profile API route');
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

    const body = await req.json()

    // Proxy to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/user/brand-profile`, {
      method: 'PUT',
      headers: {
        'X-User-Email': userEmail,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend request failed' }))
      return NextResponse.json(error, { status: response.status })
    }

    const brandProfile = await response.json()

    return NextResponse.json({
      success: true,
      data: brandProfile
    })
  } catch (error) {
    console.error('Brand Profile API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
