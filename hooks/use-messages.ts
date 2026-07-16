"use client"

import { useEffect, useState } from "react"
import { markConversationRead, watchMessages } from "@/lib/chat-service"
import type { ChatMessage } from "@/lib/chat-types"

export function useMessages(conversationId?: string, userId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!conversationId || !userId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    return watchMessages(
      conversationId,
      (next) => {
        setMessages(next)
        setLoading(false)
        void markConversationRead(conversationId, userId, next).catch(() => undefined)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      }
    )
  }, [conversationId, userId])

  return { messages, loading, error }
}
