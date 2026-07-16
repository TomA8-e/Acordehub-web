"use client"

export function TypingIndicator({ visible = false }: { visible?: boolean }) {
  if (!visible) return null
  return <p className="px-5 pb-2 text-xs font-semibold text-[#8a918c]">Escribiendo...</p>
}
