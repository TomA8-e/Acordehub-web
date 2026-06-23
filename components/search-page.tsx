"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, limit, onSnapshot, query } from "firebase/firestore"
import { Filter, MapPin, Search, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/acordehub-types"

const chips = ["Rock", "Pop", "Jazz", "Voz", "Guitarra", "Productor"]

export function SearchPage() {
  const { user, loading } = useAuth()
  const [queryText, setQueryText] = useState("")
  const [activeChip, setActiveChip] = useState("")
  const [musicians, setMusicians] = useState<UserProfile[]>([])

  useEffect(() => {
    if (!user) return

    return onSnapshot(query(collection(db, "users"), limit(100)), (snapshot) => {
      setMusicians(
        snapshot.docs
          .map((item) => ({ uid: item.id, ...item.data() }) as UserProfile)
          .filter((item) => item.uid !== user.uid)
      )
    })
  }, [user])

  const filteredMusicians = useMemo(() => {
    const term = queryText.trim().toLowerCase()

    return musicians.filter((musician) => {
      const haystack = [
        musician.name,
        musician.email,
        musician.role,
        musician.location,
        musician.description,
        ...(musician.genres ?? []),
        ...(musician.instruments ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesQuery = !term || haystack.includes(term)
      const chip = activeChip.toLowerCase()
      const matchesChip =
        !activeChip ||
        musician.role?.toLowerCase().includes(chip) ||
        musician.genres?.some((genre) => genre.toLowerCase() === chip) ||
        musician.instruments?.some((instrument) => instrument.toLowerCase() === chip)

      return matchesQuery && matchesChip
    })
  }, [activeChip, musicians, queryText])

  if (loading) {
    return <main className="mobile-shell px-5 py-10 text-[#1a1a1a]">Cargando...</main>
  }

  if (!user) {
    return (
      <main className="mobile-shell px-5 py-10 text-center text-[#1a1a1a]">
        Inicia sesion para buscar musicos.
      </main>
    )
  }

  return (
    <main className="mobile-shell px-5 pb-28 pt-6 md:max-w-7xl md:px-8 md:pb-12">
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a] md:text-4xl">Buscar musicos</h1>
        <p className="mt-1 text-sm text-[#2c2c2c]">Encuentra colaboradores para tu proximo proyecto</p>
      </section>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
          <Input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Nombre, rol o genero..."
            className="h-14 rounded-full border-0 bg-white pl-11 text-[#1a1a1a] shadow-sm placeholder:text-[#666666]"
          />
        </div>
        <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-[#ead8aa] bg-white">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => {
          const active = chip === activeChip
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveChip(active ? "" : chip)}
              className={
                active
                  ? "flex items-center gap-1 rounded-full bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
              }
            >
              {chip}
              {active && <X className="h-3.5 w-3.5" />}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMusicians.map((musician) => (
          <Card key={musician.uid} className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={musician.photoUrl || undefined} />
                  <AvatarFallback className="bg-[#fff1c8] text-[#1a1a1a]">
                    {getInitials(musician.name, musician.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-[#1a1a1a]">{musician.name || "Usuario"}</h2>
                  <p className="text-sm text-[#666666]">{musician.role || "Musico"}</p>
                  <p className="flex items-center gap-1 text-xs text-[#666666]">
                    <MapPin className="h-3 w-3" />
                    {musician.location || "Sin ubicacion"}
                  </p>
                </div>
              </div>
              <p className="mb-4 line-clamp-2 text-sm text-[#666666]">
                {musician.description || "Todavia no agrego una descripcion."}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {[...(musician.genres ?? []), ...(musician.instruments ?? [])].slice(0, 4).map((tag) => (
                  <Badge key={tag} className="rounded-full bg-[#fff1c8] text-[#1a1a1a] hover:bg-[#fff1c8]">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" className="h-11 w-full rounded-xl border-[#1a1a1a] text-[#1a1a1a]">
                Ver perfil
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMusicians.length === 0 && (
        <div className="py-12 text-center text-[#666666]">No se encontraron resultados.</div>
      )}
    </main>
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
