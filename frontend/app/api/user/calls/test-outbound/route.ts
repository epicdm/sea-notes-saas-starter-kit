import { NextRequest, NextResponse } from "next/server";

/**
 * Test Outbound Call API Route
 *
 * Proxies test call requests from the frontend to the Flask backend.
 * This route is necessary because the frontend uses relative URLs which go through Next.js.
 */
export async function POST(request: NextRequest) {
  try {
    // Get user email from header (set by api-client.ts)
    const userEmail = request.headers.get("X-User-Email");

    // Parse request body
    const body = await request.json();
    const { from_number, to_number, agent_id } = body;

    // Validate required fields
    if (!from_number || !to_number) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "from_number and to_number are required",
            code: "MISSING_PARAMETERS",
          },
        },
        { status: 400 }
      );
    }

    // Forward request to Flask backend
    const flaskUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5001";
    const response = await fetch(`${flaskUrl}/api/user/calls/test-outbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userEmail && { "X-User-Email": userEmail }),
      },
      body: JSON.stringify({
        from_number,
        to_number,
        agent_id,
      }),
    });

    // Parse Flask response
    const data = await response.json();

    // Return Flask response with appropriate status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying test-outbound call request:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to initiate test call",
          code: "PROXY_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
