import { Suspense } from "react"
import { MessagesPage } from "@/components/messages-page"
import { Navbar } from "@/components/navbar"

export default function ChatsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<main className="app-container">Cargando chats...</main>}>
        <MessagesPage />
      </Suspense>
    </div>
  )
}
