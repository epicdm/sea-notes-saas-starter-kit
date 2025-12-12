import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { addDays } from "date-fns"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique ID for user
    const {randomUUID} = await import('crypto')
    const userId = randomUUID()

    // Create user first
    const user = await prisma.users.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        name,
        updatedAt: new Date(),
      }
    })

    // Create organization with membership and subscription
    await prisma.organizations.create({
      data: {
        id: randomUUID(),
        name: name ? `${name}'s Organization` : `${email}'s Organization`,
        ownerId: userId,
        updatedAt: new Date(),
        memberships: {
          create: {
            id: randomUUID(),
            userId: userId,
            role: "owner"
          }
        },
        subscriptions: {
          create: {
            id: randomUUID(),
            status: "trialing",
            trialEndsAt: addDays(new Date(), parseInt(process.env.TRIAL_DAYS || "14")),
            provider: "stripe",
            updatedAt: new Date(),
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
