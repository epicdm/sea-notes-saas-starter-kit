import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * GET /api/brands - List all brands for agency user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || 'giraud.eric@gmail.com'; // Localhost bypass

    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/brands`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": userEmail,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.data || data); // Return just the data array
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch brands" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands - Create new brand
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || 'giraud.eric@gmail.com'; // Localhost bypass

    const body = await req.json();

    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": userEmail,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.data || data); // Return just the brand object
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: { message: "Failed to create brand" } },
      { status: 500 }
    );
  }
}
