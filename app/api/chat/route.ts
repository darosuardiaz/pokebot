import { type NextRequest, NextResponse } from "next/server"
import { AnthropicService } from "@/lib/services/anthropic"

/**
 * POST /api/chat
 *
 * Server-Sent Events (SSE) endpoint that proxies streaming responses from
 * Anthropic's Messages API. The endpoint:
 * - Validates presence of ANTHROPIC_API_KEY and returns a helpful message if missing
 * - Initializes a singleton Anthropic service
 * - Validates the request's `messages` payload
 * - Streams back SSE `data:` events with JSON-encoded chunks describing either
 *   text deltas, tool results, or control events
 * - Terminates the stream by sending `data: [DONE]` when complete
 * - Converts operational errors into structured JSON error responses
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not configured",
          message:
            "Please add your Anthropic API key to the environment variables in your project settings to enable AI chat functionality.",
          needsApiKey: true,
        },
        { status: 400 },
      )
    }

    const service = AnthropicService.getInstance()

    try {
      await service.initialize()
    } catch (initError) {
      return NextResponse.json(
        {
          error: "Failed to initialize AI service",
          message: "The AI service is currently unavailable. Please try again later.",
          details: initError instanceof Error ? initError.message : "Unknown error",
        },
        { status: 503 },
      )
    }

    const { messages } = await req.json()

    let validatedMessages
    try {
      validatedMessages = service.validateMessages(messages)
    } catch (validationError) {
      return NextResponse.json(
        {
          error: "Invalid messages",
          message: validationError instanceof Error ? validationError.message : "Invalid message format",
        },
        { status: 400 },
      )
    }

    // Create a readable stream that yields SSE-compatible `data:` lines.
    // On success, each yielded `event` is JSON-encoded, prefixed with `data: `,
    // and separated by a blank line, per the SSE spec. The stream ends with
    // `data: [DONE]`.
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          try {
            const streamGenerator = service.streamChat(validatedMessages)

            for await (const event of streamGenerator) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
            }
          } catch (streamError) {
            const errorMsg = streamError instanceof Error ? streamError.message : "Unknown error"
            // Report stream connection issues to the client as an SSE error event
            // so the UI can render an inline message and end the stream gracefully.
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: "Failed to connect to AI service",
                  message: errorMsg.includes("rate limit")
                    ? "You've made too many requests. Please wait a moment before trying again."
                    : "Unable to establish connection with the AI service. Please try again.",
                  details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
                })}\n\n`,
              ),
            )
            controller.close()
            return
          }

          // Signal normal completion to the client-side parser
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          // Catch-all error while streaming; surface an SSE error event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`,
            ),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    // Provide specific error responses based on error type
    if (errorMessage.includes("API key")) {
      return NextResponse.json(
        {
          error: "Authentication error",
          message: "There was an issue with the API authentication. Please check your API key configuration.",
          needsApiKey: true,
        },
        { status: 401 },
      )
    }

    if (errorMessage.includes("json") || errorMessage.includes("JSON")) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          message: "The request body contains invalid data. Please ensure you're sending properly formatted messages.",
        },
        { status: 400 },
      )
    }

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Network error",
          message: "Failed to connect to the AI service. Please check your internet connection and try again.",
        },
        { status: 503 },
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request. Please try again later.",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}
