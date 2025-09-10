"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Bot, Loader2, Zap, Search } from "lucide-react"
import type { Message } from "ai"
import { MarkdownRenderer } from "./markdown-renderer"
import { PokemonCard } from "@/components/pokemon/pokemon-card"
import {
  isBattleResult,
  isPokemonData,
  isToolError,
  ToolResult,
} from "@/lib/types"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isStreaming = message.isStreaming

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? "flex justify-end" : ""}`}>
        <Card className={`${isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}>
          <CardContent className="p-3">
            <div className="space-y-2">
              {message.content && (
                <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}>
                  <MarkdownRenderer content={message.content} />
                </div>
              )}

              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="space-y-3">
                  {message.toolCalls.map((toolCall) => (
                    <div key={toolCall.id} className="border rounded-lg p-3 bg-background/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {toolCall.name.includes("pokemon_data") ? (
                            <Search className="h-3 w-3" />
                          ) : (
                            <Zap className="h-3 w-3" />
                          )}
                          {toolCall.name.replace("_", " ")}
                        </Badge>
                      </div>
                      {toolCall.result && (
                        <div className="space-y-2">
                          {isToolError(toolCall.result) ? (
                            <div className="text-destructive text-sm">Error: {toolCall.result.error}</div>
                          ) : isPokemonData(toolCall.result) ? (
                            // Pokemon data result
                            <PokemonCard pokemon={toolCall.result} showActions={true} />
                          ) : isBattleResult(toolCall.result) ? (
                            // Battle result
                            <div className="space-y-2">
                              <div className="text-center">
                                <Badge className="bg-green-500 text-white">Winner: {toolCall.result.winner}</Badge>
                              </div>
                              <div className="text-xs bg-muted p-2 rounded">
                                <pre className="whitespace-pre-wrap">{toolCall.result.battleAnalysis}</pre>
                              </div>
                            </div>
                          ) : (
                            // Fallback for other results
                            <div className="text-xs text-muted-foreground">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(toolCall.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isStreaming && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground mt-2 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
