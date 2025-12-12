import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// POST /api/user/brand-profile/extract - Extract brand voice from social media
export async function POST(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    let userEmail: string | null = null;

    if (isLocalhost) {
      userEmail = 'giraud.eric@gmail.com';
      console.log('🔓 LOCALHOST: Using test user for Brand Voice Extraction');
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

    console.log('📤 Proxying brand voice extraction to backend:', body);

    // Proxy to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/user/brand-profile/extract`, {
      method: 'POST',
      headers: {
        'X-User-Email': userEmail,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    console.log('📥 Backend extraction response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend request failed' }))
      console.error('❌ Brand voice extraction failed:', error);
      return NextResponse.json(error, { status: response.status })
    }

    const result = await response.json()

    console.log('✅ Brand voice extracted successfully');

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Brand Voice Extraction Error:', error)
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
