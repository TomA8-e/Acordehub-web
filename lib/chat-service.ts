import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { syncAcceptedConversations } from "@/lib/api"
import type { ChatMessage, Conversation } from "@/lib/chat-types"

export function watchConversations(
  userId: string,
  onData: (conversations: Conversation[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  )

  return onSnapshot(
    conversationsQuery,
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Conversation)),
    onError
  )
}

export function watchMessages(
  conversationId: string,
  onData: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const messagesQuery = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(300)
  )

  return onSnapshot(
    messagesQuery,
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ChatMessage)),
    onError
  )
}

export async function sendTextMessage(conversation: Conversation, senderId: string, text: string) {
  const cleanText = text.trim()
  if (!cleanText || cleanText.length > 2000 || !conversation.participants.includes(senderId)) return

  const recipientId = conversation.participants.find((uid) => uid !== senderId)
  if (!recipientId) throw new Error("Conversacion invalida")

  const conversationRef = doc(db, "conversations", conversation.id)
  const messageRef = doc(collection(conversationRef, "messages"))
  const batch = writeBatch(db)

  batch.set(messageRef, {
    messageId: messageRef.id,
    senderId,
    text: cleanText,
    type: "text",
    createdAt: serverTimestamp(),
    read: false,
    readAt: null,
    status: "sent",
    editedAt: null,
    deletedAt: null,
    replyTo: null,
    attachments: [],
    reactions: {},
  })
  batch.update(conversationRef, {
    lastMessage: cleanText,
    lastMessageType: "text",
    lastMessageDate: serverTimestamp(),
    lastSenderId: senderId,
    updatedAt: serverTimestamp(),
    [`unreadCounts.${recipientId}`]: increment(1),
  })

  await batch.commit()
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
  messages: ChatMessage[]
) {
  const unreadMessages = messages.filter((message) => message.senderId !== userId && !message.read).slice(0, 100)
  if (unreadMessages.length === 0) return

  const batch = writeBatch(db)
  const conversationRef = doc(db, "conversations", conversationId)
  unreadMessages.forEach((message) => {
    batch.update(doc(conversationRef, "messages", message.id), {
      read: true,
      readAt: serverTimestamp(),
      status: "read",
    })
  })
  batch.update(conversationRef, { [`unreadCounts.${userId}`]: 0 })
  await batch.commit()
}

export async function prepareAcceptedConversations() {
  return syncAcceptedConversations()
}

export async function setConversationUnreadCount(conversationId: string, userId: string, count: number) {
  await updateDoc(doc(db, "conversations", conversationId), { [`unreadCounts.${userId}`]: Math.max(0, count) })
}
