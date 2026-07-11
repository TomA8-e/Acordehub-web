"use client"

import { useEffect, useState } from "react"
import { collectionGroup, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore"
import { Bell, Check, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"

type JoinRequest = { id: string; projectId: string; projectTitle: string; ownerUid: string; requesterUid: string; requesterName: string; requesterEmail?: string; status: string; createdAt?: { toMillis?: () => number } }

export function NotificationsPage() {
  const { user, loading } = useAuth()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    return onSnapshot(query(collectionGroup(db, "joinRequests"), where("ownerUid", "==", user.uid)), (snapshot) => {
      setRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as JoinRequest).sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)))
    }, (err) => setError(err.message))
  }, [user])

  async function respond(request: JoinRequest, status: "accepted" | "rejected") {
    setBusy(request.projectId + request.requesterUid); setError("")
    try { await updateDoc(doc(db, "projects", request.projectId, "joinRequests", request.requesterUid), { status, respondedAt: serverTimestamp() }) }
    catch (err) { setError(err instanceof Error ? err.message : "No se pudo responder") }
    finally { setBusy("") }
  }

  if (loading) return <main className="app-container">Cargando...</main>
  if (!user) return <main className="app-container text-center">Inicia sesion para ver tus notificaciones.</main>
  const pending = requests.filter((request) => !request.status || request.status === "pending")
  return <main className="app-container">
    <section className="surface-panel rounded-[28px] p-5 sm:p-7 lg:rounded-lg"><p className="eyebrow">Actividad</p><h1 className="mt-2 text-3xl font-black">Notificaciones</h1><p className="mt-2 text-sm text-[#5f6661]">Solicitudes para colaborar en tus proyectos.</p></section>
    <section className="mt-5 space-y-3">{pending.map((request) => <Card key={request.projectId + request.requesterUid} className="surface-panel rounded-2xl lg:rounded-lg"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><strong className="block truncate">{request.requesterName || request.requesterEmail || "Usuario"}</strong><p className="text-sm text-[#5f6661]">Quiere sumarse a <b>{request.projectTitle}</b></p></div><div className="flex gap-2"><Button disabled={busy !== ""} onClick={() => respond(request, "accepted")} className="bg-[#1a1a1a] text-white"><Check />Aceptar</Button><Button disabled={busy !== ""} variant="outline" onClick={() => respond(request, "rejected")}><X />Rechazar</Button></div></CardContent></Card>)}
    {pending.length === 0 && <div className="soft-panel rounded-[28px] p-10 text-center text-[#5f6661] lg:rounded-lg"><Bell className="mx-auto mb-3 h-9 w-9" /><p>No tienes solicitudes pendientes.</p></div>}</section>
    {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
  </main>
}
