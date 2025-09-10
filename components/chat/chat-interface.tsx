"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Trash2, Square } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addMessage, clearMessages, type Message } from "@/lib/features/chat/chatSlice"
import { MessageBubble } from "./message-bubble"
import { useClaudeStream } from "@/lib/hooks/useClaudeStream"

export function ChatInterface() {
  const dispatch = useAppDispatch()
  const { messages, status, streamingMessageId } = useAppSelector((state) => state.chat)
  const isLoading = status === "loading"
  const [input, setInput] = useState("")
  const scrollViewportRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Use the Claude stream hook
  const { streamMessage, isStreaming, abortStream } = useClaudeStream({
    onStreamStart: (_messageId) => {
      // Stream started
    },
    onStreamEnd: (_messageId) => {
      // Stream ended
    },
    onStreamError: (_error) => {
      // Handle stream error
    },
    onToolCall: (_toolCall) => {
      // Tool call received
    },
  })

  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current && messagesContainerRef.current) {
      const viewport = scrollViewportRef.current
      const container = messagesContainerRef.current

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        })
      })
    }
  }, [])

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Scroll when streaming message updates
  useEffect(() => {
    if (streamingMessageId) {
      scrollToBottom()
    }
  }, [streamingMessageId, scrollToBottom])

  // Scroll when any message content changes (for streaming updates)
  useEffect(() => {
    const streamingMessage = messages.find((m) => m.id === streamingMessageId)
    if (streamingMessage?.isStreaming) {
      scrollToBottom()
    }
  }, [messages, streamingMessageId, scrollToBottom])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    dispatch(addMessage(userMessage))
    const messageContent = input.trim()
    setInput("")

    // Prepare messages for API
    const apiMessages = [
      ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user" as const, content: messageContent },
    ]

    // Stream the message
    await streamMessage(apiMessages, userMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    dispatch(clearMessages())
  }

  return (
    <Card className="min-h-[500px] h-full flex flex-col overflow-hidden bg-cyan-100 border-4 border-gray-800 rounded-2xl shadow-inner">
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-700 bg-gray-800 rounded-t-xl">
          <h3 className="font-bold text-green-400 text-lg">POKÉDEX SYSTEM</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 relative bg-cyan-50">
          <div ref={scrollViewportRef} className="h-full overflow-y-auto overflow-x-hidden">
            <div ref={messagesContainerRef} className="p-4 space-y-4 min-h-full">
              {messages.length === 0 && (
                <div className="text-center text-gray-700 py-8">
                  <p className="text-lg mb-2 font-bold">POKÉDEX ACTIVATED</p>
                  <p className="text-sm mb-4">Digital encyclopedia ready for queries...</p>
                  <div className="mt-4 space-y-2 text-xs bg-white/50 rounded-lg p-4 border-2 border-gray-300">
                    <p className="font-semibold">SAMPLE QUERIES:</p>
                    <ul className="space-y-1 text-left">
                      <li>→ "Analyze Pikachu data"</li>
                      <li>→ "Battle simulation: Charizard vs Blastoise"</li>
                      <li>→ "Fire-type recommendations"</li>
                    </ul>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t-2 border-gray-700 bg-gray-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Pokémon query..."
              disabled={isLoading || isStreaming}
              className="flex-1 bg-white border-2 border-gray-600 text-gray-900 placeholder:text-gray-500 focus:border-blue-400"
            />
            {isStreaming ? (
              <Button
                onClick={abortStream}
                variant="destructive"
                size="icon"
                title="Stop streaming"
                className="bg-red-600 hover:bg-red-700 border-2 border-red-800"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 border-2 border-blue-800"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
