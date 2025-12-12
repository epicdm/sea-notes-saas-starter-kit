import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { profileUpdateSchema } from '@/lib/schemas/settings-schema'

export async function GET() {
  try {
    const session = await auth()

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
      )
    }

    // Fetch user profile from database using Prisma
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        isActive: true,
        onboardingCompleted: true,
        memberships: {
          include: {
            organizations: {
              include: {
                subscriptions: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    // Build profile response
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      isActive: user.isActive,
      onboardingCompleted: user.onboardingCompleted,
      organization: user.memberships[0]?.organizations || null,
      subscription: user.memberships[0]?.organizations?.subscriptions || null
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to get profile',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

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
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = profileUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid profile data',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors
          }
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update user profile in database
    // Note: Currently only 'name' field exists in database schema
    // TODO: Add company, timezone, notification_email, notification_sms fields to schema
    const updatedUser = await prisma.users.update({
      where: { email: session.user.email },
      data: {
        name: data.full_name,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        updatedAt: true
      }
    })

    // Log warning about fields not persisted
    if (data.company || data.timezone || data.notification_email !== undefined || data.notification_sms !== undefined) {
      console.warn('Profile update: company, timezone, and notification fields not yet persisted to database')
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.name,
        updatedAt: updatedUser.updatedAt
      }
    })
  } catch (error) {
    console.error('Failed to update user profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update profile',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
