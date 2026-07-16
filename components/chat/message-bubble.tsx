"use client"

import { Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/chat-types"

export function MessageBubble({ message, own }: { message: ChatMessage; own: boolean }) {
  const time = message.createdAt?.toDate?.().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) ?? ""
  return (
    <div className={cn("flex animate-in fade-in slide-in-from-bottom-1 duration-200", own ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[82%] rounded-[22px] px-4 py-2.5 text-sm leading-5 shadow-sm sm:max-w-[68%]",
        own ? "rounded-br-md bg-[#1a1a1a] text-white" : "rounded-bl-md border border-[#e5e9e3] bg-white text-[#1a1a1a]"
      )}>
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <span className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", own ? "text-white/55" : "text-[#8a918c]")}> 
          {time}
          {own && (message.read ? <CheckCheck className="h-3.5 w-3.5 text-[#f7c948]" aria-label="Leido" /> : <Check className="h-3.5 w-3.5" aria-label="Enviado" />)}
        </span>
      </div>
    </div>
  )
}
