import { getPokemonData } from "@/lib/tools/pokemon-api"
import { simulatePokemonBattle } from "@/lib/tools/battle-simulator"

/**
 * Minimal chat message shape expected by Anthropic's Messages API.
 */
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

/**
 * Internal representation of a tool invocation emitted by the model.
 */
export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

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

/**
 * Singleton wrapper around the Anthropic SDK providing:
 * - Lazy initialization bound to `ANTHROPIC_API_KEY`
 * - An async generator `streamChat` that translates SDK stream chunks into
 *   UI-friendly events and executes tool calls in-line
 * - Tool registry and execution helpers
 * - Message validation and a system prompt tailored for the Pokédex use-case
 */
class AnthropicServiceClass {
  private static instance: AnthropicServiceClass
  private anthropic: any

  private constructor() {}

  static getInstance(): AnthropicServiceClass {
    if (!AnthropicServiceClass.instance) {
      AnthropicServiceClass.instance = new AnthropicServiceClass()
    }
    return AnthropicServiceClass.instance
  }

  /** Initialize the Anthropic client if a key is present. */
  async initialize(): Promise<void> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured")
    }

    const anthropicModule = await import("@anthropic-ai/sdk")
    const Anthropic = anthropicModule.default

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  }

  /**
   * Stream chat completion deltas and tool events as an async generator of
   * `StreamEvent` objects. The consumer typically forwards these over SSE.
   */
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<StreamEvent> {
    if (!this.anthropic) {
      await this.initialize()
    }

    const tools = this.getToolDefinitions()

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const response = this.anthropic.messages.stream({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: formattedMessages,
      tools,
      system: this.getSystemPrompt(),
    })

    // Reserved if future logic wants to reconcile tool order or results
    const pendingToolCalls: ToolCall[] = []
    let currentToolCall: (ToolCall & { partialInput: string }) | null = null

    for await (const chunk of response) {
      if (!chunk) continue

      if (chunk.type === "message_start") {
        yield {
          type: "message_start",
          message: chunk.message,
        }
      } else if (chunk.type === "content_block_start") {
        if (chunk.content_block?.type === "tool_use") {
          currentToolCall = {
            id: chunk.content_block.id,
            name: chunk.content_block.name,
            input: {},
            partialInput: "",
          }
        }
        yield {
          type: "content_block_start",
          content_block: chunk.content_block,
        }
      } else if (chunk.type === "content_block_delta") {
        if (chunk.delta?.type === "text_delta") {
          yield {
            type: "text_delta",
            text: chunk.delta.text,
          }
        } else if (chunk.delta?.type === "input_json_delta" && currentToolCall) {
          const partialInput = chunk.delta?.partial_json
          if (partialInput !== undefined && partialInput !== null && typeof partialInput === "string") {
            currentToolCall.partialInput = (currentToolCall.partialInput || "") + partialInput
          }
        }
      } else if (chunk.type === "content_block_stop") {
        if (currentToolCall) {
          try {
            const inputString = currentToolCall.partialInput || "{}"
            currentToolCall.input = JSON.parse(inputString)

            if (!currentToolCall.input || typeof currentToolCall.input !== "object") {
              throw new Error("Invalid tool input format - expected object")
            }

            pendingToolCalls.push(currentToolCall)

            // Execute the tool
            const toolResult = await this.executeTool(currentToolCall)

            yield {
              type: "tool_result",
              tool_call_id: currentToolCall.id,
              result: toolResult,
            }
          } catch (toolError) {
            yield {
              type: "tool_error",
              tool_call_id: currentToolCall.id,
              error: toolError instanceof Error ? toolError.message : "Tool execution failed",
            }
          }
          currentToolCall = null
        }

        yield {
          type: "content_block_stop",
        }
      } else if (chunk.type === "message_delta") {
        if (chunk.delta?.stop_reason) {
          yield {
            type: "message_stop",
            stop_reason: chunk.delta.stop_reason,
          }
        }
      } else if (chunk.type === "message_stop") {
        yield {
          type: "message_stop",
        }
      }
    }
  }

  /** Execute a known tool by name with basic input validation. */
  private async executeTool(toolCall: ToolCall): Promise<any> {
    switch (toolCall.name) {
      case "get_pokemon_data":
        const pokemon = toolCall.input?.pokemon
        if (!pokemon || typeof pokemon !== "string") {
          throw new Error("Pokemon name is required and must be a string")
        }
        return await getPokemonData(pokemon.trim())

      case "pokemon_battle_simulator":
        const pokemon1 = toolCall.input?.pokemon1
        const pokemon2 = toolCall.input?.pokemon2

        if (!pokemon1 || typeof pokemon1 !== "string") {
          throw new Error("Pokemon1 name is required and must be a string")
        }
        if (!pokemon2 || typeof pokemon2 !== "string") {
          throw new Error("Pokemon2 name is required and must be a string")
        }

        return await simulatePokemonBattle(pokemon1.trim(), pokemon2.trim())

      default:
        throw new Error(`Unknown tool: ${toolCall.name}`)
    }
  }

  /**
   * Tool definitions exposed to the model. These mirror the handlers in
   * `executeTool` and define JSON schema for tool inputs.
   */
  private getToolDefinitions() {
    return [
      {
        name: "get_pokemon_data",
        description:
          "Fetch detailed information about a specific Pokémon including stats, types, abilities, and sprites. Use this when users ask about specific Pokémon or want to compare Pokémon stats.",
        input_schema: {
          type: "object" as const,
          properties: {
            pokemon: {
              type: "string" as const,
              description: "The name or ID of the Pokémon to look up (e.g., 'pikachu', 'charizard', '25')",
            },
          },
          required: ["pokemon"],
        },
      },
      {
        name: "pokemon_battle_simulator",
        description:
          "Simulate a battle between two Pokémon and determine the likely winner based on stats, types, and type effectiveness. Use this when users ask about battles, matchups, or 'who would win' questions.",
        input_schema: {
          type: "object" as const,
          properties: {
            pokemon1: {
              type: "string" as const,
              description: "Name of the first Pokémon in the battle",
            },
            pokemon2: {
              type: "string" as const,
              description: "Name of the second Pokémon in the battle",
            },
          },
          required: ["pokemon1", "pokemon2"],
        },
      },
    ]
  }

  /** Instructional system prompt guiding the assistant's tone and tool usage. */
  private getSystemPrompt(): string {
    return `You are a knowledgeable Pokédex AI assistant. You have access to comprehensive Pokémon data and can help users with:

- Looking up detailed Pokémon information (stats, types, abilities, moves)
- Compare Pokémon and their capabilities
- Simulating battles between Pokémon
- Providing strategic advice for team building
- Answering questions about Pokémon lore and mechanics

Always be enthusiastic about Pokémon and provide detailed, helpful responses. When users ask about specific Pokémon, use the get_pokemon_data tool to fetch accurate information. For battle-related questions, use the pokemon_battle_simulator tool.

When you use tools, explain what you're doing and provide context for the results. Make your responses engaging and informative.`
  }

  /**
   * Validate and normalize incoming messages from the client. Ensures shape
   * compatibility with Anthropic's API and enforces supported roles.
   */
  validateMessages(messages: any[]): ChatMessage[] {
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format")
    }

    const validatedMessages = messages
      .filter((msg) => {
        if (!msg || typeof msg !== "object") {
          return false
        }
        if (!msg.role || typeof msg.role !== "string") {
          return false
        }
        if (!msg.content || typeof msg.content !== "string") {
          return false
        }
        const role = msg.role.toLowerCase()
        return role === "user" || role === "assistant"
      })
      .map((msg) => ({
        ...msg,
        role: msg.role.toLowerCase() as "user" | "assistant",
      }))

    if (validatedMessages.length === 0) {
      throw new Error("No valid messages provided")
    }

    return validatedMessages
  }
}

export { AnthropicServiceClass as AnthropicService }
