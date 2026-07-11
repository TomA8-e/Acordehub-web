"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore"
import { MessageCircle, Send } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/acordehub-types"

type Chat = { id: string; participantIds: string[]; participantNames?: Record<string, string>; participantPhotos?: Record<string, string>; lastMessage?: string; updatedAt?: { toMillis?: () => number } }
type ChatMessage = { id: string; senderId: string; text: string; createdAt?: { toDate?: () => Date } }

export function MessagesPage() {
  const { user, loading } = useAuth()
  const params = useSearchParams()
  const requestedUid = params.get("with")
  const [chats, setChats] = useState<Chat[]>([])
  const [activeId, setActiveId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    return onSnapshot(query(collection(db, "chats"), where("participantIds", "array-contains", user.uid)), (snapshot) => {
      const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Chat).sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0))
      setChats(next)
      setActiveId((current) => current || next[0]?.id || "")
    }, (err) => setError(err.message))
  }, [user])

  useEffect(() => {
    if (!user || !requestedUid || requestedUid === user.uid) return
    void createChat(user.uid, requestedUid).then(setActiveId).catch((err) => setError(err instanceof Error ? err.message : "No se pudo abrir el chat"))
  }, [requestedUid, user])

  useEffect(() => {
    if (!activeId) { setMessages([]); return }
    return onSnapshot(query(collection(db, "chats", activeId, "messages"), orderBy("createdAt", "asc")), (snapshot) => setMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ChatMessage)), (err) => setError(err.message))
  }, [activeId])

  const active = chats.find((chat) => chat.id === activeId)
  const otherUid = useMemo(() => active?.participantIds.find((id) => id !== user?.uid) ?? "", [active, user])

  async function send(event: React.FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!user || !activeId || !value) return
    setText("")
    try {
      await addDoc(collection(db, "chats", activeId, "messages"), { senderId: user.uid, text: value, createdAt: serverTimestamp() })
      await setDoc(doc(db, "chats", activeId), { lastMessage: value, updatedAt: serverTimestamp() }, { merge: true })
    } catch (err) { setText(value); setError(err instanceof Error ? err.message : "No se pudo enviar") }
  }

  if (loading) return <main className="app-container">Cargando...</main>
  if (!user) return <main className="app-container text-center">Inicia sesion para ver tus mensajes.</main>

  return <main className="app-container">
    <div className="surface-panel grid min-h-[65vh] overflow-hidden rounded-[28px] md:grid-cols-[300px_1fr] lg:rounded-lg">
      <aside className="border-b border-[#dfe4dd] p-4 md:border-b-0 md:border-r">
        <h1 className="text-2xl font-black">Mensajes</h1>
        <div className="mt-4 space-y-2">{chats.map((chat) => { const uid = chat.participantIds.find((id) => id !== user.uid) ?? ""; return <button key={chat.id} onClick={() => setActiveId(chat.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${activeId === chat.id ? "bg-[#eef2f0]" : "hover:bg-[#fbfcf8]"}`}><Avatar><AvatarImage src={chat.participantPhotos?.[uid]} /><AvatarFallback>{initials(chat.participantNames?.[uid])}</AvatarFallback></Avatar><span className="min-w-0"><strong className="block truncate text-sm">{chat.participantNames?.[uid] || "Usuario"}</strong><span className="block truncate text-xs text-[#5f6661]">{chat.lastMessage || "Inicia la conversacion"}</span></span></button> })}</div>
      </aside>
      <section className="flex min-h-[480px] flex-col">
        {active ? <><header className="border-b border-[#dfe4dd] p-4 font-black">{active.participantNames?.[otherUid] || "Conversacion"}</header><div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${message.senderId === user.uid ? "bg-[#1a1a1a] text-white" : "bg-[#eef2f0] text-[#1a1a1a]"}`}>{message.text}</div></div>)}</div><form onSubmit={send} className="flex gap-2 border-t border-[#dfe4dd] p-4"><Input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Escribe un mensaje" className="h-11" /><Button aria-label="Enviar mensaje"><Send /></Button></form></> : <div className="flex flex-1 flex-col items-center justify-center text-center text-[#5f6661]"><MessageCircle className="mb-3 h-10 w-10" /><p>Selecciona una conversacion o contacta a alguien desde su perfil.</p></div>}
      </section>
    </div>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}
  </main>
}

async function createChat(uid: string, otherUid: string) {
  const ids = [uid, otherUid].sort(); const chatId = ids.join("_")
  const [meSnapshot, otherSnapshot, chatSnapshot] = await Promise.all([getDoc(doc(db, "users", uid)), getDoc(doc(db, "users", otherUid)), getDoc(doc(db, "chats", chatId))])
  if (!otherSnapshot.exists()) throw new Error("El usuario ya no esta disponible")
  const me = meSnapshot.data() as UserProfile | undefined; const other = otherSnapshot.data() as UserProfile
  await setDoc(doc(db, "chats", chatId), { participantIds: ids, participantNames: { [uid]: me?.name || "Usuario", [otherUid]: other.name || "Usuario" }, participantEmails: { [uid]: me?.email || "", [otherUid]: other.email || "" }, participantPhotos: { [uid]: me?.photoUrl || "", [otherUid]: other.photoUrl || "" }, ...(!chatSnapshot.exists() ? { createdAt: serverTimestamp() } : {}), updatedAt: serverTimestamp() }, { merge: true })
  return chatId
}
function initials(value?: string) { return (value || "U").split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() }
