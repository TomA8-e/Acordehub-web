"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/chat-types"

type ConversationCardProps = {
  conversation: Conversation
  currentUserId: string
  active: boolean
  onSelect: () => void
}

export function ConversationCard({ conversation, currentUserId, active, onSelect }: ConversationCardProps) {
  const otherId = conversation.participants.find((uid) => uid !== currentUserId) ?? ""
  const person = conversation.participantProfiles?.[otherId]
  const unread = conversation.unreadCounts?.[currentUserId] ?? 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200",
        active ? "bg-[#1a1a1a] text-white shadow-sm" : "hover:bg-[#eef2f0]"
      )}
    >
      <span className="relative shrink-0">
        <Avatar className="h-12 w-12 border border-white/70 shadow-sm">
          <AvatarImage src={person?.photoUrl || "/placeholder-user.jpg"} alt={person?.name || "Usuario"} />
          <AvatarFallback className="bg-[#f7c948] font-black text-[#1a1a1a]">{initials(person?.name)}</AvatarFallback>
        </Avatar>
        {person?.online && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22c55e]" aria-label="En linea" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <strong className="truncate text-sm">{person?.name || "Usuario"}</strong>
          <time className={cn("shrink-0 text-[11px]", active ? "text-white/60" : "text-[#8a918c]")}>{formatListTime(conversation.lastMessageDate)}</time>
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span className={cn("min-w-0 flex-1 truncate text-xs", active ? "text-white/65" : unread > 0 ? "font-bold text-[#1a1a1a]" : "text-[#6f7671]")}> 
            {conversation.lastMessage || "Conversacion habilitada"}
          </span>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5a623] px-1.5 text-[10px] font-black text-[#1a1a1a]">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function formatListTime(value?: Conversation["lastMessageDate"]) {
  const date = value?.toDate?.()
  if (!date) return ""
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
}

function initials(name?: string) {
  return (name || "U").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}
