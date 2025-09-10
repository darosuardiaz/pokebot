import type { ChatMessage, StreamEvent } from "@/lib/types"

/**
 * POST the chat transcript to the Next.js route. The route responds with
 * `text/event-stream` (SSE). Consumers should not call `response.json()`; they
 * must read the stream from `response.body`.
 *
 * Throws a specialized `API_KEY_REQUIRED` error when the server indicates the
 * Anthropic key is missing, enabling the UI to show a guided setup message.
 */
export async function sendMessage(messages: ChatMessage[]) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, stream: true }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    if (errorData?.needsApiKey) {
      throw new Error("API_KEY_REQUIRED")
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}

/**
 * Parse a server-sent events (SSE) stream originating from `app/api/chat/route`.
 *
 * The server formats events as lines prefixed by `data: `, each containing a
 * JSON payload. A special `[DONE]` marker indicates normal completion.
 *
 * This function consumes a `ReadableStreamDefaultReader<Uint8Array>` and
 * exposes an async iterator yielding each parsed JSON event.
 */
export function parseStreamResponse(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncIterable<StreamEvent> {
  const decoder = new TextDecoder()
  let buffer = ""

  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true })
          
          // Process complete lines
          const lines = buffer.split("\n")
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmedLine = line.trim()
            
            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.slice(6)

              if (data === "[DONE]") {
                return
              }

              try {
                const parsed = JSON.parse(data)
                yield parsed
              } catch (e) {
                console.warn("Failed to parse SSE data:", data)
                // Skip invalid JSON
                continue
              }
            }
          }
        }
        
        // Process any remaining data in buffer
        if (buffer.trim().startsWith("data: ")) {
          const data = buffer.trim().slice(6)
          if (data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data)
              yield parsed
            } catch (e) {
              console.warn("Failed to parse final SSE data:", data)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  }
}
