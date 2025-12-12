import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * PUT /api/brands/:id - Update brand
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userEmail = session?.user?.email || 'giraud.eric@gmail.com'; // Localhost bypass

    const body = await req.json();

    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/brands/${id}`, {
      method: "PUT",
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
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: { message: "Failed to update brand" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/brands/:id - Delete brand
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userEmail = session?.user?.email || 'giraud.eric@gmail.com'; // Localhost bypass

    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/brands/${id}`, {
      method: "DELETE",
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: { message: "Failed to delete brand" } },
      { status: 500 }
    );
  }
}
