"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageCircleHeart } from "lucide-react"
import { ConversationHeader } from "@/components/chat/conversation-header"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { useMessages } from "@/hooks/use-messages"
import { sendTextMessage } from "@/lib/chat-service"
import type { Conversation } from "@/lib/chat-types"

export function ChatWindow({ conversation, currentUserId, onBack }: { conversation?: Conversation; currentUserId: string; onBack: () => void }) {
  const { messages, loading, error } = useMessages(conversation?.id, currentUserId)
  const [sendError, setSendError] = useState("")
  const endRef = useRef<HTMLDivElement>(null)
  const otherId = conversation?.participants.find((uid) => uid !== currentUserId) ?? ""
  const person = conversation?.participantProfiles?.[otherId]
  const messageKey = useMemo(() => messages.map((message) => `${message.id}:${message.read}`).join("|"), [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto", block: "end" })
  }, [messageKey, messages.length])

  if (!conversation) {
    return (
      <section className="hidden min-h-0 flex-1 flex-col items-center justify-center bg-[#fbfcf8] px-8 text-center md:flex">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#dfe4dd] bg-white text-[#c47a00] shadow-sm">
          <MessageCircleHeart className="h-9 w-9" />
        </span>
        <h2 className="mt-5 text-xl font-black text-[#1a1a1a]">Tus conversaciones</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#6f7671]">Selecciona un chat. Solo aparecen personas con una conexion o solicitud de proyecto aceptada.</p>
      </section>
    )
  }

  async function send(text: string) {
    if (!conversation) return
    setSendError("")
    try {
      await sendTextMessage(conversation, currentUserId, text)
    } catch (sendFailure) {
      setSendError(sendFailure instanceof Error ? sendFailure.message : "No pudimos enviar el mensaje")
      throw sendFailure
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#f5f6f2]">
      <ConversationHeader person={person} onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {loading && <p className="text-center text-sm text-[#8a918c]">Cargando mensajes...</p>}
        {!loading && messages.length === 0 && (
          <div className="flex min-h-full flex-col items-center justify-center pb-16 text-center">
            <AvatarIntro name={person?.name} />
          </div>
        )}
        <div className="space-y-2.5">
          {messages.map((message) => <MessageBubble key={message.id} message={message} own={message.senderId === currentUserId} />)}
          <div ref={endRef} />
        </div>
      </div>
      {(error || sendError) && <p className="bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">{error || sendError}</p>}
      <TypingIndicator />
      <MessageInput onSend={send} />
    </section>
  )
}

function AvatarIntro({ name }: { name?: string }) {
  return (
    <>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3cf] text-2xl font-black text-[#c47a00]">{(name || "U")[0]?.toUpperCase()}</span>
      <p className="mt-4 font-black text-[#1a1a1a]">Tu conversacion con {name || "este usuario"}</p>
      <p className="mt-1 text-sm text-[#6f7671]">La conexion fue aceptada. Ya pueden empezar a hablar.</p>
    </>
  )
}
