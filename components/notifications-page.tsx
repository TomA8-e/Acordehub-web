"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, collectionGroup, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore"
import { Bell, Check, FolderKanban, UserPlus, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import type { ConnectionRequest, ProjectJoinRequest } from "@/lib/chat-types"

export function NotificationsPage() {
  const { user, loading } = useAuth()
  const [joinRequests, setJoinRequests] = useState<ProjectJoinRequest[]>([])
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [busy, setBusy] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!user) return
    const unsubscribeJoin = onSnapshot(
      query(collectionGroup(db, "joinRequests"), where("ownerUid", "==", user.uid)),
      (snapshot) => setJoinRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ProjectJoinRequest)),
      (error) => setMessage(error.message)
    )
    const unsubscribeConnections = onSnapshot(
      query(collection(db, "connectionRequests"), where("targetUid", "==", user.uid)),
      (snapshot) => setConnectionRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ConnectionRequest)),
      (error) => setMessage(error.message)
    )
    return () => { unsubscribeJoin(); unsubscribeConnections() }
  }, [user])

  const pendingConnections = useMemo(() => connectionRequests.filter((request) => request.status === "pending").sort(sortNewest), [connectionRequests])
  const pendingProjects = useMemo(() => joinRequests.filter((request) => !request.status || request.status === "pending").sort(sortNewest), [joinRequests])

  async function respondConnection(request: ConnectionRequest, status: "accepted" | "rejected") {
    const key = `connection-${request.id}`
    setBusy(key); setMessage("")
    try {
      await updateDoc(doc(db, "connectionRequests", request.id), { status, updatedAt: serverTimestamp() })
      setMessage(status === "accepted" ? "Conexion aceptada. Ya pueden conversar desde Chats." : "Solicitud rechazada.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo responder") }
    finally { setBusy("") }
  }

  async function respondProject(request: ProjectJoinRequest, status: "accepted" | "rejected") {
    const key = `project-${request.projectId}-${request.requesterUid}`
    setBusy(key); setMessage("")
    try {
      await updateDoc(doc(db, "projects", request.projectId, "joinRequests", request.requesterUid), { status, respondedAt: serverTimestamp() })
      setMessage(status === "accepted" ? "Solicitud aceptada. El chat se creo automaticamente." : "Solicitud rechazada.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo responder") }
    finally { setBusy("") }
  }

  if (loading) return <main className="app-container">Cargando...</main>
  if (!user) return <main className="app-container text-center">Inicia sesion para ver tus notificaciones.</main>

  const empty = pendingConnections.length === 0 && pendingProjects.length === 0
  return (
    <main className="app-container">
      <section className="surface-panel rounded-[28px] p-5 sm:p-7 lg:rounded-lg">
        <p className="eyebrow">Actividad</p>
        <h1 className="mt-2 text-3xl font-black">Notificaciones</h1>
        <p className="mt-2 text-sm text-[#5f6661]">Acepta conexiones y colaboradores. El chat se habilita automaticamente.</p>
      </section>

      {message && <p className="mt-4 rounded-2xl border border-[#dfe4dd] bg-white px-4 py-3 text-sm font-semibold text-[#5f6661]">{message}</p>}

      <section className="mt-5 space-y-3">
        {pendingConnections.map((request) => (
          <RequestCard key={request.id} icon={UserPlus} name={request.requesterName || "Usuario"} detail="Quiere conectar con vos">
            <ActionButtons busy={busy} requestKey={`connection-${request.id}`} onAccept={() => respondConnection(request, "accepted")} onReject={() => respondConnection(request, "rejected")} />
          </RequestCard>
        ))}
        {pendingProjects.map((request) => (
          <RequestCard key={`${request.projectId}-${request.requesterUid}`} icon={FolderKanban} name={request.requesterName || request.requesterEmail || "Usuario"} detail={<>Quiere sumarse a <b>{request.projectTitle}</b></>}>
            <ActionButtons busy={busy} requestKey={`project-${request.projectId}-${request.requesterUid}`} onAccept={() => respondProject(request, "accepted")} onReject={() => respondProject(request, "rejected")} />
          </RequestCard>
        ))}
        {empty && <div className="soft-panel rounded-[28px] p-10 text-center text-[#5f6661] lg:rounded-lg"><Bell className="mx-auto mb-3 h-9 w-9" /><p>No tenes solicitudes pendientes.</p></div>}
      </section>
    </main>
  )
}

function RequestCard({ icon: Icon, name, detail, children }: { icon: typeof UserPlus; name: string; detail: React.ReactNode; children: React.ReactNode }) {
  return <Card className="surface-panel rounded-2xl lg:rounded-lg"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff3cf] text-[#c47a00]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><strong className="block truncate">{name}</strong><p className="text-sm text-[#5f6661]">{detail}</p></div>{children}</CardContent></Card>
}

function ActionButtons({ busy, requestKey, onAccept, onReject }: { busy: string; requestKey: string; onAccept: () => void; onReject: () => void }) {
  return <div className="flex gap-2"><Button disabled={busy !== ""} onClick={onAccept} className="bg-[#1a1a1a] text-white"><Check />{busy === requestKey ? "Procesando..." : "Aceptar"}</Button><Button disabled={busy !== ""} variant="outline" onClick={onReject}><X />Rechazar</Button></div>
}

function sortNewest(a: { createdAt?: { toMillis?: () => number } }, b: { createdAt?: { toMillis?: () => number } }) {
  return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
}
