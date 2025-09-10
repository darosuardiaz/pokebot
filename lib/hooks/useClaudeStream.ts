import { useState, useCallback, useRef } from "react"
import { sendMessage, parseStreamResponse, type ChatMessage, type StreamEvent } from "@/lib/api/chat"
import { useAppDispatch } from "@/lib/hooks"
import {
  addMessage,
  updateMessage,
  setStreaming,
  setStatus,
  addToolCall,
  type Message,
} from "@/lib/features/chat/chatSlice"

/**
 * Options for the streaming hook to expose lifecycle callbacks.
 *
 * - onStreamStart: called with the assistant message id when streaming begins
 * - onStreamEnd: called when the assistant message completes
 * - onStreamError: called with a terminal error during streaming
 * - onToolCall: called when a tool result is received mid-stream
 */
export interface UseClaudeStreamOptions {
  onStreamStart?: (messageId: string) => void
  onStreamEnd?: (messageId: string) => void
  onStreamError?: (error: Error) => void
  onToolCall?: (toolCall: StreamEvent) => void
}

/**
 * React hook that sends chat messages to the backend SSE endpoint and
 * incrementally builds the assistant's response as deltas arrive.
 *
 * Responsibilities:
 * - Initiates a request to `/api/chat` and parses SSE `data:` events
 * - Creates a placeholder assistant message and progressively updates it
 * - Dispatches Redux actions for status, streaming state, and tool results
 * - Handles server-communicated errors and network failures gracefully
 * - Supports cancelation via AbortController
 */
export function useClaudeStream(options: UseClaudeStreamOptions = {}) {
  const dispatch = useAppDispatch()
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const streamMessage = useCallback(
    async (messages: ChatMessage[], userMessage: Message) => {
      // Reset error state
      setError(null)
      setIsStreaming(true)

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      try {
        dispatch(setStatus('loading'))
        
        // Send the message and get the response
        const response = await sendMessage(messages)

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          
          if (errorData?.needsApiKey) {
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: `🔑 **API Key Required**\n\n${errorData.message}\n\nTo get started:\n1. Get an API key from [Anthropic Console](https://console.anthropic.com/)\n2. Add it as ANTHROPIC_API_KEY in your project environment variables\n3. Refresh the page and try again`,
              timestamp: Date.now(),
            }
            dispatch(addMessage(errorMessage))
            return
          }
          
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        // Create reader and SSE parser to iterate `data:` events as they arrive
        const reader = response.body.getReader()
        const streamParser = parseStreamResponse(reader)

        // Create an empty assistant message that will be filled with deltas
        const assistantMessageId = (Date.now() + 1).toString()
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          isStreaming: true,
        }

        dispatch(addMessage(assistantMessage))
        dispatch(setStreaming({ messageId: assistantMessageId, isStreaming: true }))
        
        if (options.onStreamStart) {
          options.onStreamStart(assistantMessageId)
        }

        let accumulatedContent = ""
        let currentContentBlockIndex = 0 // reserved for multi-block content support

        // Process the stream
        for await (const event of streamParser) {
          // Narrow unknown SSE payload fields for safe access
          const e: any = event
          // Check if stream was aborted
          if (abortControllerRef.current?.signal.aborted) {
            break
          }

          switch (event.type) {
            case "message_start":
              // Message started, no action needed
              break

            case "content_block_start":
              if (e.content_block?.type === "text") {
                currentContentBlockIndex = e.index || 0
              }
              break

            case "text_delta":
              accumulatedContent += e.text || ""
              dispatch(updateMessage({ 
                id: assistantMessageId, 
                content: accumulatedContent 
              }))
              break

            case "content_block_stop":
              // Content block completed
              break

            case "tool_result":
              // Tool results arrive mid-stream after a tool_use block finishes
              if (options.onToolCall) {
                options.onToolCall(event)
              }
              dispatch(
                addToolCall({
                  messageId: assistantMessageId,
                  toolCall: {
                    id: e.tool_call_id,
                    name: "Tool executed",
                    arguments: {},
                    result: e.result,
                  },
                })
              )
              break

            case "tool_error":
              dispatch(
                addToolCall({
                  messageId: assistantMessageId,
                  toolCall: {
                    id: e.tool_call_id,
                    name: "Tool error",
                    arguments: {},
                    result: { error: e.error },
                  },
                })
              )
              break

            case "message_stop":
              dispatch(setStreaming({ messageId: assistantMessageId, isStreaming: false }))
              if (options.onStreamEnd) {
                options.onStreamEnd(assistantMessageId)
              }
              break

            case "error":
              const errorMsg = typeof e.error === "string" ? e.error : "Unknown streaming error"
              // Handle streaming error and finalize the assistant message
              dispatch(
                updateMessage({
                  id: assistantMessageId,
                  content: accumulatedContent + "\n\n[Error: " + errorMsg + "]",
                })
              )
              dispatch(setStreaming({ messageId: assistantMessageId, isStreaming: false }))
              setError(new Error(errorMsg))
              if (options.onStreamError) {
                options.onStreamError(new Error(errorMsg))
              }
              break

                default:
                  // Handle any other event types
                  break
          }
        }
      } catch (error) {
        // Handle stream error
        setError(error as Error)
        
        if (options.onStreamError) {
          options.onStreamError(error as Error)
        }

        // Handle specific error types
        let errorContent = "Sorry, I encountered an error. Please try again."
        
        if (error instanceof Error) {
          if (error.message === "API_KEY_REQUIRED") {
            errorContent = `🔑 **API Key Required**\n\nThe Anthropic API key is not configured. Please:\n1. Get an API key from [Anthropic Console](https://console.anthropic.com/)\n2. Add it as ANTHROPIC_API_KEY in your project environment variables\n3. Refresh the page and try again`
          } else if (error.message.includes("500")) {
            errorContent = "🔧 **Server Error**\n\nA server error occurred. This might be due to:\n- Missing API configuration\n- Network connectivity issues\n- Service temporarily unavailable\n\nPlease check the console for details and try again."
          } else if (error.message.includes("Network") || error.message.includes("fetch")) {
            errorContent = "🌐 **Network Error**\n\nUnable to connect to the server. Please check your internet connection and try again."
          } else {
            errorContent = `❌ **Error**\n\n${error.message}\n\nPlease try again or check the console for more details.`
          }
        }

        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: errorContent,
          timestamp: Date.now(),
        }
        dispatch(addMessage(errorMessage))
      } finally {
        setIsStreaming(false)
        dispatch(setStatus('idle'))
        abortControllerRef.current = null
      }
    },
    [dispatch, options]
  )

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }, [])

  return {
    streamMessage,
    isStreaming,
    error,
    abortStream,
  }
}
