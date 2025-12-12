import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * POST /api/brands/:id/clone - Clone brand
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userEmail = session?.user?.email || 'giraud.eric@gmail.com'; // Localhost bypass

    const body = await req.json();

    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/brands/${id}/clone`, {
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
    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error("Error cloning brand:", error);
    return NextResponse.json(
      { error: { message: "Failed to clone brand" } },
      { status: 500 }
    );
  }
}
