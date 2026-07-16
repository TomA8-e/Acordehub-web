"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChatLayout } from "@/components/chat/chat-layout"
import { useAuth } from "@/components/auth-provider"
import { useConversations } from "@/hooks/use-conversations"

export function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useSearchParams()
  const requestedConversation = params.get("conversation") || ""
  const { conversations, loading, error } = useConversations(user?.uid)
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    if (requestedConversation && conversations.some((item) => item.id === requestedConversation)) {
      setActiveId(requestedConversation)
    }
  }, [conversations, requestedConversation])

  useEffect(() => {
    if (activeId && !conversations.some((item) => item.id === activeId)) setActiveId("")
  }, [activeId, conversations])

  if (authLoading) return <main className="app-container">Cargando chats...</main>
  if (!user) {
    return (
      <main className="app-container text-center">
        <section className="surface-panel mx-auto max-w-xl rounded-[28px] p-8 lg:rounded-lg">
          <h1 className="text-2xl font-black text-[#1a1a1a]">Inicia sesion para ver tus chats</h1>
          <Button asChild className="mt-5 bg-[#1a1a1a] text-white"><Link href="/login">Entrar</Link></Button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-container py-4 lg:py-6">
      <ChatLayout
        conversations={conversations}
        currentUserId={user.uid}
        activeId={activeId}
        loading={loading}
        onSelect={setActiveId}
        onBack={() => setActiveId("")}
      />
      {error && <p className="mt-3 text-sm font-semibold text-red-700">No pudimos cargar tus chats. {error}</p>}
    </main>
  )
}
