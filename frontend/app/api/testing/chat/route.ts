import { NextRequest, NextResponse } from "next/server";

/**
 * Text Simulation API Route
 *
 * Proxies text simulation requests to the Flask backend.
 */
export async function POST(request: NextRequest) {
  try {
    // Get user email from header (set by api-client.ts)
    const userEmail = request.headers.get("X-User-Email");

    // Parse request body
    const body = await request.json();
    const { agent_id, message, conversation_history } = body;

    // Validate required fields
    if (!agent_id || !message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "agent_id and message are required",
            code: "MISSING_PARAMETERS",
          },
        },
        { status: 400 }
      );
    }

    // Forward request to Flask backend
    const flaskUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5001";
    const response = await fetch(`${flaskUrl}/api/testing/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userEmail && { "X-User-Email": userEmail }),
      },
      body: JSON.stringify({
        agent_id,
        message,
        conversation_history: conversation_history || [],
      }),
    });

    // Parse Flask response
    const data = await response.json();

    // Wrap Flask response in standard API format for api-client compatibility
    // Flask returns: { success: true, response: "...", ... }
    // api-client expects: { success: true, data: {...} }
    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data
      }, { status: response.status });
    }

    // Return error response as-is (already in correct format)
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying text simulation request:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to send message",
          code: "PROXY_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
