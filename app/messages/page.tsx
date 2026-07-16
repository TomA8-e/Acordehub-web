import { redirect } from "next/navigation"

type LegacyMessagesPageProps = {
  searchParams: Promise<{ conversation?: string | string[] }>
}

export default async function LegacyMessagesPage({ searchParams }: LegacyMessagesPageProps) {
  const params = await searchParams
  const requestedConversation = Array.isArray(params.conversation) ? params.conversation[0] : params.conversation
  const destination = requestedConversation
    ? `/chats?conversation=${encodeURIComponent(requestedConversation)}`
    : "/chats"

  redirect(destination)
}
