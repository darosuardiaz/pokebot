import type { BattleResult } from "./battle"
import type { PokemonData } from "./pokemon"

export interface ToolError {
  error: string
}

export type ToolResult = PokemonData | BattleResult | ToolError

export function isToolError(result: unknown): result is ToolError {
  return result !== null && typeof result === "object" && "error" in result
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isStreaming?: boolean
  toolCalls?: ToolCall[]
  error?: string
  streamCompleted?: boolean
}

/**
 * Minimal chat message shape expected by Anthropic's Messages API.
 */
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ToolCall<T = unknown> {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: T
}

export type ChatStatus = "idle" | "loading" | "streaming"

/**
 * Normalized stream events surfaced to the SSE layer. These map Anthropic's
 * streaming chunks into a compact set of event types consumed by the UI.
 */
export interface StreamEvent {
  type:
    | "message_start"
    | "content_block_start"
    | "text_delta"
    | "tool_result"
    | "tool_error"
    | "error"
    | "content_block_stop"
    | "message_stop"
  text?: string
  content_block?: any
  message?: any
  tool_call_id?: string
  result?: any
  error?: string
  stop_reason?: string
}