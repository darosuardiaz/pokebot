"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addMessage, clearMessages, type Message } from "@/lib/features/chat/chatSlice"
import { useClaudeStream } from "@/lib/hooks/useClaudeStream"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"

export function ChatInterface() {
  const dispatch = useAppDispatch()
  const { messages, status } = useAppSelector((state) => state.chat)
  const isLoading = status === "loading"

  const { streamMessage, isStreaming, abortStream } = useClaudeStream({
    onStreamStart: (_messageId) => {},
    onStreamEnd: (_messageId) => {},
    onStreamError: (_error) => {},
    onToolCall: (_toolCall) => {},
  })

  const handleSendMessage = async (messageContent: string) => {
    if (isLoading || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: Date.now(),
    }

    dispatch(addMessage(userMessage))

    const apiMessages = [
      ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user" as const, content: messageContent },
    ]

    await streamMessage(apiMessages, userMessage)
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

        <ChatMessageList messages={messages} />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
          abortStream={abortStream}
        />
      </CardContent>
    </Card>
  )
}
