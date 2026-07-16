"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore"
import { Check, Clock3, MessageCircle, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import type { ConnectionRequest } from "@/lib/chat-types"
import type { UserProfile } from "@/lib/acordehub-types"

export function ConnectionAction({ currentUser, targetUser }: { currentUser: UserProfile; targetUser: UserProfile }) {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const outgoingId = `${currentUser.uid}_${targetUser.uid}`

  useEffect(() => {
    const states = new Map<"outgoing" | "incoming", ConnectionRequest[]>()
    const publish = () => setRequests(Array.from(states.values()).flat())
    const unsubscribeOutgoing = onSnapshot(
      query(collection(db, "connectionRequests"), where("requesterUid", "==", currentUser.uid)),
      (snapshot) => {
        states.set("outgoing", snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ConnectionRequest).filter((request) => request.targetUid === targetUser.uid))
        publish()
      }
    )
    const unsubscribeIncoming = onSnapshot(
      query(collection(db, "connectionRequests"), where("targetUid", "==", currentUser.uid)),
      (snapshot) => {
        states.set("incoming", snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ConnectionRequest).filter((request) => request.requesterUid === targetUser.uid))
        publish()
      }
    )
    return () => { unsubscribeOutgoing(); unsubscribeIncoming() }
  }, [currentUser.uid, targetUser.uid])

  const accepted = requests.some((request) => request.status === "accepted")
  const outgoingPending = requests.some((request) => request.requesterUid === currentUser.uid && request.status === "pending")
  const incomingPending = requests.some((request) => request.targetUid === currentUser.uid && request.status === "pending")
  const conversationId = useMemo(() => [currentUser.uid, targetUser.uid].sort().join("_"), [currentUser.uid, targetUser.uid])

  async function requestConnection() {
    setSending(true)
    setError("")
    try {
      await setDoc(doc(db, "connectionRequests", outgoingId), {
        requesterUid: currentUser.uid,
        requesterName: currentUser.name || "Usuario",
        requesterRole: currentUser.role || "Musico",
        targetUid: targetUser.uid,
        targetName: targetUser.name || "Usuario",
        targetRole: targetUser.role || "Musico",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos enviar la solicitud")
    } finally {
      setSending(false)
    }
  }

  if (accepted) {
    return (
      <Button asChild variant="outline" className="rounded-2xl border-[#dfe4dd] bg-white lg:rounded-md">
        <Link href={`/chats?conversation=${conversationId}`}><MessageCircle className="mr-2 h-4 w-4" />Abrir chat</Link>
      </Button>
    )
  }

  if (incomingPending) {
    return (
      <Button asChild variant="outline" className="rounded-2xl border-[#f5a623] bg-[#fff9e8] lg:rounded-md">
        <Link href="/notifications"><Check className="mr-2 h-4 w-4" />Responder solicitud</Link>
      </Button>
    )
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={outgoingPending || sending}
        onClick={requestConnection}
        className="rounded-2xl border-[#dfe4dd] bg-white lg:rounded-md"
      >
        {outgoingPending ? <Clock3 className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
        {outgoingPending ? "Solicitud enviada" : sending ? "Enviando..." : "Enviar interes"}
      </Button>
      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  )
}
