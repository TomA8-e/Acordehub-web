"use client"

import Link from "next/link"
import { ArrowLeft, Circle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { ConversationParticipant } from "@/lib/chat-types"

export function ConversationHeader({ person, onBack }: { person?: ConversationParticipant; onBack: () => void }) {
  return (
    <header className="flex min-h-20 items-center gap-3 border-b border-[#dfe4dd] bg-white/90 px-4 py-3 backdrop-blur md:px-5">
      <Button type="button" variant="ghost" size="icon" onClick={onBack} className="rounded-full md:hidden" aria-label="Volver a conversaciones">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Link href={person?.uid ? `/profile/${person.uid}` : "#"} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl">
        <Avatar className="h-12 w-12 border border-[#dfe4dd]">
          <AvatarImage src={person?.photoUrl || "/placeholder-user.jpg"} alt={person?.name || "Usuario"} />
          <AvatarFallback className="bg-[#f7c948] font-black text-[#1a1a1a]">{initials(person?.name)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <strong className="block truncate text-base text-[#1a1a1a]">{person?.name || "Usuario"}</strong>
          <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#6f7671]">
            {person?.online && <Circle className="h-2 w-2 fill-[#22c55e] text-[#22c55e]" />}
            {person?.online ? "En linea" : person?.role || "Musico"}
          </span>
        </span>
      </Link>
    </header>
  )
}

function initials(name?: string) {
  return (name || "U").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}
