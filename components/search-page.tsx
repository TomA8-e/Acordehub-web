"use client"

import { useState } from "react"
import { Filter, MapPin, Search, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const chips = ["Rock", "Pop", "Jazz", "Voz", "Guitarra", "Productor"]

const musicians = [
  {
    name: "Maria Garcia",
    role: "Vocalista",
    location: "Buenos Aires",
    tags: ["Pop", "R&B", "Soul"],
    initials: "MG",
    bio: "Vocalista con experiencia en bandas y proyectos solistas.",
  },
  {
    name: "Carlos Lopez",
    role: "Productor",
    location: "Montevideo",
    tags: ["Electronica", "House"],
    initials: "CL",
    bio: "Productor musical especializado en beats, mezcla y remixes.",
  },
  {
    name: "Ana Martinez",
    role: "Guitarrista",
    location: "Santiago",
    tags: ["Rock", "Blues", "Folk"],
    initials: "AM",
    bio: "Guitarrista versatil con foco en rock clasico y blues.",
  },
]

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [activeChip, setActiveChip] = useState("")

  const filteredMusicians = musicians.filter((musician) => {
    const term = query.toLowerCase()
    const matchesQuery =
      !term ||
      musician.name.toLowerCase().includes(term) ||
      musician.role.toLowerCase().includes(term) ||
      musician.tags.some((tag) => tag.toLowerCase().includes(term))
    const matchesChip = !activeChip || musician.tags.includes(activeChip) || musician.role.includes(activeChip)
    return matchesQuery && matchesChip
  })

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          <Card key={musician.name} className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-[#fff1c8] text-[#1a1a1a]">{musician.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-[#1a1a1a]">{musician.name}</h2>
                  <p className="text-sm text-[#666666]">{musician.role}</p>
                  <p className="flex items-center gap-1 text-xs text-[#666666]">
                    <MapPin className="h-3 w-3" />
                    {musician.location}
                  </p>
                </div>
              </div>
              <p className="mb-4 text-sm text-[#666666]">{musician.bio}</p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {musician.tags.map((tag) => (
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
