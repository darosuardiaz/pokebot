import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ChatStatus, Message, ToolCall } from "@/lib/types"

interface ChatState {
  messages: Message[]
  status: ChatStatus
  streamingMessageId: string | null
}

const initialState: ChatState = {
  messages: [],
  status: 'idle',
  streamingMessageId: null,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    updateMessage: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const message = state.messages.find((m) => m.id === action.payload.id)
      if (message) {
        message.content = action.payload.content
      }
    },
    setStreaming: (state, action: PayloadAction<{ messageId: string; isStreaming: boolean }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId)
      if (message) {
        message.isStreaming = action.payload.isStreaming
        if (!action.payload.isStreaming) {
          message.streamCompleted = true
        }
      }
      
      if (action.payload.isStreaming) {
        state.status = 'streaming'
        state.streamingMessageId = action.payload.messageId
      } else {
        state.status = 'idle'
        state.streamingMessageId = null
      }
    },
    setStatus: (state, action: PayloadAction<ChatStatus>) => {
      state.status = action.payload
      if (action.payload !== 'streaming') {
        state.streamingMessageId = null
      }
    },
    addToolCall: (state, action: PayloadAction<{ messageId: string; toolCall: ToolCall }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId)
      if (message) {
        if (!message.toolCalls) {
          message.toolCalls = []
        }
        message.toolCalls.push(action.payload.toolCall)
      }
    },
    updateToolCall: (state, action: PayloadAction<{ messageId: string; toolCallId: string; result: unknown }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId)
      if (message && message.toolCalls) {
        const toolCall = message.toolCalls.find((tc) => tc.id === action.payload.toolCallId)
        if (toolCall) {
          toolCall.result = action.payload.result
        }
      }
    },
    clearMessages: (state) => {
      state.messages = []
      state.streamingMessageId = null
      state.status = 'idle'
    },
    setMessageError: (state, action: PayloadAction<{ messageId: string; error: string }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId)
      if (message) {
        message.error = action.payload.error
        message.isStreaming = false
        message.streamCompleted = true
      }
      state.status = 'idle'
      state.streamingMessageId = null
    },
  },
})

export const { addMessage, updateMessage, setStreaming, setStatus, addToolCall, updateToolCall, clearMessages, setMessageError } =
  chatSlice.actions

export default chatSlice.reducer
