import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

// GET /api/user/personas/[id] - Get specific persona
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // LOCALHOST BYPASS
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Persona API route');
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
    const response = await fetch(`${BACKEND_URL}/api/user/personas/${id}`, {
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

    const persona = await response.json()

    return NextResponse.json({
      success: true,
      data: persona
    })
  } catch (error) {
    console.error('Persona API Error:', error)
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

// PUT /api/user/personas/[id] - Update persona
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Persona API route');
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
    const response = await fetch(`${BACKEND_URL}/api/user/personas/${id}`, {
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

    const persona = await response.json()

    return NextResponse.json({
      success: true,
      data: persona
    })
  } catch (error) {
    console.error('Persona API Error:', error)
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

// DELETE /api/user/personas/[id] - Delete persona
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Persona API route');
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
    const response = await fetch(`${BACKEND_URL}/api/user/personas/${id}`, {
      method: 'DELETE',
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

    return NextResponse.json({
      success: true,
      message: 'Persona deleted successfully'
    })
  } catch (error) {
    console.error('Persona API Error:', error)
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
