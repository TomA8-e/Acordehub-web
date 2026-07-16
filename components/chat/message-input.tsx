"use client"

import { useState } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function MessageInput({ onSend, disabled }: { onSend: (text: string) => Promise<void>; disabled?: boolean }) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!value || sending || disabled) return
    setText("")
    setSending(true)
    try {
      await onSend(value)
    } catch {
      setText(value)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 border-t border-[#dfe4dd] bg-white p-3 sm:p-4">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={2000}
        disabled={disabled || sending}
        placeholder="Escribi un mensaje..."
        aria-label="Mensaje"
        className="h-12 flex-1 rounded-full border-[#dfe4dd] bg-[#f5f6f2] px-5 focus-visible:ring-[#f5a623]"
      />
      <Button type="submit" size="icon" disabled={!text.trim() || disabled || sending} className="h-12 w-12 shrink-0 rounded-full bg-[#1a1a1a] text-white hover:bg-[#343434]" aria-label="Enviar mensaje">
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </form>
  )
}
