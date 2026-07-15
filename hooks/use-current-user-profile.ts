"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import type { UserProfile } from "@/lib/acordehub-types"
import { db } from "@/lib/firebase"

export function useCurrentUserProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? ({ uid: snapshot.id, ...snapshot.data() } as UserProfile) : null)
      setLoading(false)
    }, () => {
      setProfile(null)
      setLoading(false)
    })
  }, [authLoading, user])

  return { profile, loading }
}
