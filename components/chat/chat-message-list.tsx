"use client"

import { useRef, useEffect, useCallback } from "react"
import { MessageBubble } from "./message-bubble"
import type { Message } from "@/lib/features/chat/chatSlice"
import { useAppSelector } from "@/lib/hooks"

interface ChatMessageListProps {
  messages: Message[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const { streamingMessageId } = useAppSelector((state) => state.chat)
  const scrollViewportRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current && messagesContainerRef.current) {
      const viewport = scrollViewportRef.current
      const container = messagesContainerRef.current

      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        })
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (streamingMessageId) {
      scrollToBottom()
    }
  }, [streamingMessageId, scrollToBottom])

  useEffect(() => {
    const streamingMessage = messages.find((m) => m.id === streamingMessageId)
    if (streamingMessage?.isStreaming) {
      scrollToBottom()
    }
  }, [messages, streamingMessageId, scrollToBottom])

  return (
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
  )
}