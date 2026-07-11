import { Suspense } from "react"
import { MessagesPage } from "@/components/messages-page"
export default function Page() { return <Suspense fallback={<main className="app-container">Cargando...</main>}><MessagesPage /></Suspense> }
