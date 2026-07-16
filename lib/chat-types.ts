import type { Timestamp } from "firebase/firestore"

export type ConversationParticipant = {
  uid: string
  name: string
  photoUrl?: string
  role?: string
  online?: boolean
}

export type Conversation = {
  id: string
  conversationId: string
  participants: string[]
  participantProfiles?: Record<string, ConversationParticipant>
  createdAt?: Timestamp
  lastMessage?: string
  lastMessageType?: MessageType
  lastMessageDate?: Timestamp | null
  lastSenderId?: string
  updatedAt?: Timestamp
  unreadCounts?: Record<string, number>
}

export type MessageType = "text" | "image" | "audio" | "file" | "location"
export type MessageStatus = "sent" | "read"

export type ChatMessage = {
  id: string
  messageId: string
  senderId: string
  text: string
  type: MessageType
  createdAt?: Timestamp
  read: boolean
  readAt?: Timestamp | null
  status: MessageStatus
  editedAt?: Timestamp | null
  deletedAt?: Timestamp | null
  replyTo?: string | null
  attachments?: unknown[]
  reactions?: Record<string, string[]>
}

export type ConnectionRequest = {
  id: string
  requesterUid: string
  requesterName?: string
  requesterRole?: string
  targetUid: string
  targetName?: string
  targetRole?: string
  status: "pending" | "accepted" | "rejected"
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type ProjectJoinRequest = {
  id: string
  projectId: string
  projectTitle: string
  ownerUid: string
  requesterUid: string
  requesterName: string
  requesterEmail?: string
  status: "pending" | "accepted" | "rejected"
  createdAt?: Timestamp
}
