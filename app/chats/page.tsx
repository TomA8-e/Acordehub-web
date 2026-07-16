import { Suspense } from "react"
import { MessagesPage } from "@/components/messages-page"

export default function ChatsPage() {
  return <Suspense fallback={<main className="app-container">Cargando chats...</main>}><MessagesPage /></Suspense>
}
