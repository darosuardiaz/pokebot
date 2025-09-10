"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Square } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  isStreaming: boolean
  abortStream: () => void
}

export function ChatInput({ onSendMessage, isLoading, isStreaming, abortStream }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSendMessage = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
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
  )
}