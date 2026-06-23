"use client"

import type { ComponentType, ReactNode } from "react"
import { useEffect, useState } from "react"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { Edit2, Guitar, MapPin, Music, Save, Trophy, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { defaultProfile, type UserProfile } from "@/lib/acordehub-types"

const defaultGenres = ["Rock", "Pop", "Jazz", "Blues", "Electronica", "Folk", "Metal", "Funk"]
const defaultInstruments = ["Guitarra", "Bajo", "Bateria", "Teclado", "Piano", "Voz", "Saxofon"]
const levels = ["Principiante", "Intermedio", "Avanzado", "Profesional"]

export function ProfilePage() {
  const { user, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const ref = doc(db, "users", user.uid)
      const snapshot = await getDoc(ref)
      const nextProfile = snapshot.exists()
        ? ({ uid: user.uid, ...snapshot.data() } as UserProfile)
        : defaultProfile(user.uid, user.email ?? "", user.displayName ?? "Usuario")

      if (!snapshot.exists()) {
        await setDoc(ref, { ...nextProfile, createdAt: serverTimestamp() }, { merge: true })
      }
      setProfile(nextProfile)
      setDraft(nextProfile)
    }

    load().catch((err) => setMessage(err instanceof Error ? err.message : "No se pudo cargar el perfil"))
  }, [user])

  const save = async () => {
    if (!user || !draft) return
    setSaving(true)
    setMessage("")

    try {
      const data = {
        uid: user.uid,
        email: user.email ?? draft.email ?? "",
        name: draft.name ?? "",
        role: draft.role ?? "",
        genres: draft.genres ?? [],
        instruments: draft.instruments ?? [],
        level: draft.level ?? "",
        description: draft.description ?? "",
        location: draft.location ?? "",
        photoUrl: draft.photoUrl ?? user.photoURL ?? "",
        favoriteArtists: draft.favoriteArtists ?? [],
      }
      await setDoc(doc(db, "users", user.uid), data, { merge: true })
      setProfile({ ...draft, ...data })
      setDraft({ ...draft, ...data })
      setIsEditing(false)
      setMessage("Perfil guardado")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setDraft(profile)
    setIsEditing(false)
    setMessage("")
  }

  const toggleArrayValue = (field: "genres" | "instruments", value: string) => {
    setDraft((current) => {
      if (!current) return current
      const values = current[field] ?? []
      return {
        ...current,
        [field]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      }
    })
  }

  if (loading || !profile || !draft) {
    return <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">Cargando perfil...</main>
  }

  if (!user) {
    return <main className="min-h-screen bg-[#050505] px-4 py-10 text-center text-white">Inicia sesion.</main>
  }

  const current = isEditing ? draft : profile

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#050505] px-4 pb-28 pt-5 md:max-w-5xl md:px-8 md:pb-12">
      <Card className="overflow-hidden rounded-xl border-[#2a2a2a] bg-[#111111] text-white shadow-none">
        <div className="h-28 bg-[#202020]" />
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="-mt-12 h-24 w-24 border-4 border-[#111111] bg-[#202020]">
              <AvatarImage src={current.photoUrl || user.photoURL || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-[#202020] text-xl text-white">
                {getInitials(current.name, current.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, name: e.target.value })}
                    className="border-[#2a2a2a] bg-[#202020] text-white"
                  />
                  <Input
                    value={draft.role ?? ""}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, role: e.target.value })}
                    placeholder="Rol musical"
                    className="border-[#2a2a2a] bg-[#202020] text-white"
                  />
                </div>
              ) : (
                <>
                  <h1 className="truncate text-2xl font-bold">{current.name || "Usuario"}</h1>
                  <p className="truncate text-sm text-[#a7afbc]">{current.role || "Rol musical"}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 truncate text-sm text-[#a7afbc]">
              <MapPin className="h-4 w-4 shrink-0" />
              {isEditing ? (
                <Input
                  value={draft.location ?? ""}
                  onChange={(e) => setDraft((prev) => prev && { ...prev, location: e.target.value })}
                  placeholder="Ciudad, provincia"
                  className="h-9 border-[#2a2a2a] bg-[#202020] text-white"
                />
              ) : (
                current.location || "Ubicacion no definida"
              )}
            </p>
            {isEditing ? (
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={cancel} className="border-[#2a2a2a] bg-transparent text-white">
                  <X className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={save} disabled={saving} className="bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f7c948]">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="border-[#2a2a2a] bg-transparent text-white">
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
          {message && <p className="mt-4 text-sm text-[#f7c948]">{message}</p>}
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <DarkCard icon={Music} title="Sobre mi">
            {isEditing ? (
              <Textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft((prev) => prev && { ...prev, description: e.target.value })}
                className="min-h-28 border-[#2a2a2a] bg-[#202020] text-white"
              />
            ) : (
              <p className="text-sm leading-6 text-[#a7afbc]">
                {current.description || "Todavia no agregaste una descripcion."}
              </p>
            )}
          </DarkCard>

          <DarkCard title="Generos musicales">
            {isEditing ? (
              <SelectableTags
                items={defaultGenres}
                selected={draft.genres ?? []}
                onToggle={(value) => toggleArrayValue("genres", value)}
              />
            ) : (
              <TagList items={current.genres ?? []} empty="Sin generos definidos" />
            )}
          </DarkCard>

          <DarkCard icon={Guitar} title="Instrumentos">
            {isEditing ? (
              <SelectableTags
                items={defaultInstruments}
                selected={draft.instruments ?? []}
                onToggle={(value) => toggleArrayValue("instruments", value)}
              />
            ) : (
              <TagList items={current.instruments ?? []} empty="Sin instrumentos definidos" />
            )}
          </DarkCard>
        </div>

        <div className="space-y-5">
          <DarkCard icon={Trophy} title="Nivel de experiencia">
            {isEditing ? (
              <SelectableTags
                items={levels}
                selected={draft.level ? [draft.level] : []}
                onToggle={(value) => setDraft((prev) => prev && { ...prev, level: value })}
                single
              />
            ) : (
              <Badge className="rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f5a623]">
                {current.level || "Sin definir"}
              </Badge>
            )}
          </DarkCard>

          <DarkCard title="Contacto">
            <p className="text-xs text-[#a7afbc]">Email</p>
            <p className="mt-1 text-sm font-semibold text-white">{current.email || user.email}</p>
          </DarkCard>

          <DarkCard title="Estadisticas">
            <div className="space-y-3 text-sm">
              <Stat label="Generos" value={(current.genres?.length ?? 0).toString()} />
              <Stat label="Artistas favoritos" value={(current.favoriteArtists?.length ?? 0).toString()} />
              <Stat label="Miembro desde" value="Nuevo" />
            </div>
          </DarkCard>
        </div>
      </div>
    </main>
  )
}

function DarkCard({
  title,
  children,
  icon: Icon,
}: {
  title: string
  children: ReactNode
  icon?: ComponentType<{ className?: string }>
}) {
  return (
    <Card className="rounded-xl border-[#2a2a2a] bg-[#111111] text-white shadow-none">
      <CardContent className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  )
}

function TagList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-[#a7afbc]">{empty}</p>

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} className="rounded-full bg-[#202020] text-white hover:bg-[#202020]">
          {item}
        </Badge>
      ))}
    </div>
  )
}

function SelectableTags({
  items,
  selected,
  onToggle,
}: {
  items: string[]
  selected: string[]
  onToggle: (value: string) => void
  single?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item)
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={
              active
                ? "rounded-full bg-[#f5a623] px-3 py-1.5 text-xs font-bold text-[#1a1a1a]"
                : "rounded-full bg-[#202020] px-3 py-1.5 text-xs font-bold text-white"
            }
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#a7afbc]">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "Usuario"
  return source
    .split(/[ @.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U"
}
