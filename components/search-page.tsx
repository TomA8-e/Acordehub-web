"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, limit, onSnapshot, query } from "firebase/firestore"
import { ArrowRight, Filter, MapPin, Search, SlidersHorizontal, UserRound, X } from "lucide-react"
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
    return <main className="app-container text-[#1a1a1a]">Cargando...</main>
  }

  if (!user) {
    return <main className="app-container text-center text-[#1a1a1a]">Inicia sesion para buscar musicos.</main>
  }

  return (
    <main className="app-container">
      <section className="surface-panel rounded-[32px] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Explorar</p>
            <h1 className="mt-2 text-3xl font-black text-[#1a1a1a] sm:text-4xl">Encuentra tu proxima colaboracion</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6661]">
              Filtra por instrumento, genero, rol o ciudad para descubrir perfiles compatibles con tus proyectos.
            </p>
          </div>
          <div className="rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] px-4 py-3">
            <p className="text-2xl font-black text-[#1a1a1a]">{filteredMusicians.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5f6661]">resultados</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a918c]" />
            <Input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Buscar por nombre, rol, genero o instrumento"
              className="h-14 rounded-2xl border-[#dfe4dd] bg-white pl-12 text-[#1a1a1a] shadow-none placeholder:text-[#8a918c]"
            />
          </div>
          <Button variant="outline" className="h-14 rounded-2xl border-[#dfe4dd] bg-white px-5 font-bold">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </section>

      <section className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => {
          const active = chip === activeChip
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveChip(active ? "" : chip)}
              className={
                active
                  ? "flex h-10 items-center gap-1 rounded-full bg-[#1a1a1a] px-4 text-sm font-black text-white"
                  : "h-10 rounded-full border border-[#dfe4dd] bg-white px-4 text-sm font-black text-[#5f6661]"
              }
            >
              {chip}
              {active && <X className="h-3.5 w-3.5" />}
            </button>
          )
        })}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMusicians.map((musician) => (
          <Card key={musician.uid} className="surface-panel rounded-[28px]">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                  <AvatarImage src={musician.photoUrl || undefined} />
                  <AvatarFallback className="bg-[#e6f4f1] text-lg font-black text-[#0f766e]">
                    {getInitials(musician.name, musician.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-black text-[#1a1a1a]">{musician.name || "Usuario"}</h2>
                  <p className="text-sm font-bold text-[#5f6661]">{musician.role || "Musico"}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#8a918c]">
                    <MapPin className="h-3.5 w-3.5" />
                    {musician.location || "Sin ubicacion"}
                  </p>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 min-h-11 text-sm leading-6 text-[#5f6661]">
                {musician.description || "Todavia no agrego una descripcion."}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...(musician.genres ?? []), ...(musician.instruments ?? [])].slice(0, 5).map((tag) => (
                  <Badge key={tag} className="rounded-full bg-[#eef2f0] text-[#1a1a1a] hover:bg-[#eef2f0]">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button variant="outline" className="mt-5 h-11 w-full rounded-2xl border-[#dfe4dd] bg-white font-bold">
                <UserRound className="mr-2 h-4 w-4" />
                Ver perfil
                <ArrowRight className="ml-auto h-4 w-4 text-[#8a918c]" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {filteredMusicians.length === 0 && (
        <div className="soft-panel mt-6 rounded-[28px] p-8 text-center">
          <Filter className="mx-auto h-8 w-8 text-[#f5a623]" />
          <p className="mt-3 font-black text-[#1a1a1a]">No encontramos resultados</p>
          <p className="mt-1 text-sm text-[#5f6661]">Prueba con otro genero, rol o instrumento.</p>
        </div>
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
