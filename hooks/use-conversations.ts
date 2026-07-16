"use client"

import { useEffect, useState } from "react"
import { prepareAcceptedConversations, watchConversations } from "@/lib/chat-service"
import type { Conversation } from "@/lib/chat-types"

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!userId) {
      setConversations([])
      setLoading(false)
      return
    }

    let unsubscribe: () => void = () => undefined
    let cancelled = false
    setLoading(true)
    setError("")

    prepareAcceptedConversations()
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return
        unsubscribe = watchConversations(
          userId,
          (next) => {
            setConversations(next)
            setLoading(false)
          },
          (watchError) => {
            setError(watchError.message)
            setLoading(false)
          }
        )
      })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [userId])

  return { conversations, loading, error }
}
