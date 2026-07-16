"use client"

import { MessageCircleMore } from "lucide-react"
import { ConversationCard } from "@/components/chat/conversation-card"
import type { Conversation } from "@/lib/chat-types"

type ConversationListProps = {
  conversations: Conversation[]
  currentUserId: string
  activeId?: string
  loading?: boolean
  onSelect: (conversationId: string) => void
}

export function ConversationList({ conversations, currentUserId, activeId, loading, onSelect }: ConversationListProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-[#dfe4dd] md:border-r">
      <div className="border-b border-[#dfe4dd] px-5 py-5">
        <p className="eyebrow">Conexiones</p>
        <h1 className="mt-1 text-2xl font-black text-[#1a1a1a]">Chats</h1>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {loading && <p className="p-4 text-sm text-[#6f7671]">Cargando conversaciones...</p>}
        {!loading && conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            currentUserId={currentUserId}
            active={conversation.id === activeId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
        {!loading && conversations.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3cf] text-[#c47a00]">
              <MessageCircleMore className="h-7 w-7" />
            </span>
            <p className="mt-4 font-black text-[#1a1a1a]">Todavia no tenes conversaciones.</p>
            <p className="mt-2 max-w-56 text-sm leading-6 text-[#6f7671]">Se habilitaran cuando acepten una solicitud de interes o de proyecto.</p>
          </div>
        )}
      </div>
    </aside>
  )
}
