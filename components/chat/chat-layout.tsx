"use client"

import { cn } from "@/lib/utils"
import { ChatWindow } from "@/components/chat/chat-window"
import { ConversationList } from "@/components/chat/conversation-list"
import type { Conversation } from "@/lib/chat-types"

export function ChatLayout({ conversations, currentUserId, activeId, loading, onSelect, onBack }: {
  conversations: Conversation[]
  currentUserId: string
  activeId?: string
  loading?: boolean
  onSelect: (conversationId: string) => void
  onBack: () => void
}) {
  const active = conversations.find((conversation) => conversation.id === activeId)
  return (
    <div className="surface-panel grid h-[calc(100dvh-118px)] min-h-[560px] overflow-hidden rounded-[28px] md:grid-cols-[340px_minmax(0,1fr)] lg:h-[calc(100dvh-128px)] lg:max-h-[820px] lg:rounded-lg">
      <div className={cn("min-h-0", activeId ? "hidden md:block" : "block")}>
        <ConversationList conversations={conversations} currentUserId={currentUserId} activeId={activeId} loading={loading} onSelect={onSelect} />
      </div>
      <div className={cn("min-h-0", activeId ? "flex" : "hidden md:flex")}>
        <ChatWindow conversation={active} currentUserId={currentUserId} onBack={onBack} />
      </div>
    </div>
  )
}
