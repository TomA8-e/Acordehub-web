"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"

const genres = ["Rock", "Pop", "Jazz", "Blues", "Electrónica", "Hip Hop", "R&B", "Clásica", "Folk", "Reggae", "Metal", "Funk", "Soul", "Country"]
const instruments = ["Guitarra", "Bajo", "Batería", "Teclado", "Piano", "Voz", "Violín", "Saxofón", "Trompeta", "Flauta"]
const skillLevels = ["Principiante", "Intermedio", "Avanzado", "Profesional"]

const musicians = [
  {
    id: 1,
    name: "María García",
    role: "Vocalista",
    genres: ["Pop", "R&B", "Soul"],
    instruments: ["Voz"],
    location: "Buenos Aires",
    level: "Profesional",
    avatar: null,
    initials: "MG",
    bio: "Vocalista con 10 años de experiencia en bandas y proyectos solistas.",
  },
  {
    id: 2,
    name: "Carlos López",
    role: "Productor",
    genres: ["Electrónica", "House", "Techno"],
    instruments: ["Teclado", "Piano"],
    location: "Montevideo",
    level: "Avanzado",
    avatar: null,
    initials: "CL",
    bio: "Productor musical especializado en música electrónica y remixes.",
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Guitarrista",
    genres: ["Rock", "Blues", "Folk"],
    instruments: ["Guitarra"],
    location: "Santiago",
    level: "Avanzado",
    avatar: null,
    initials: "AM",
    bio: "Guitarrista versátil con pasión por el rock clásico y el blues.",
  },
  {
    id: 4,
    name: "Pedro Sánchez",
    role: "Baterista",
    genres: ["Jazz", "Funk", "Soul"],
    instruments: ["Batería"],
    location: "Lima",
    level: "Profesional",
    avatar: null,
    initials: "PS",
    bio: "Baterista de sesión con experiencia en jazz y funk.",
  },
  {
    id: 5,
    name: "Laura Torres",
    role: "Bajista",
    genres: ["Rock", "Metal", "Funk"],
    instruments: ["Bajo"],
    location: "Bogotá",
    level: "Intermedio",
    avatar: null,
    initials: "LT",
    bio: "Bajista en formación, busco proyectos para crecer musicalmente.",
  },
  {
    id: 6,
    name: "Diego Ramírez",
    role: "Tecladista",
    genres: ["Jazz", "Clásica", "Pop"],
    instruments: ["Teclado", "Piano"],
    location: "México DF",
    level: "Profesional",
    avatar: null,
    initials: "DR",
    bio: "Pianista clásico con formación académica, abierto a diversos géneros.",
  },
]

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("")
  const [selectedInstrument, setSelectedInstrument] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")

  const filteredMusicians = musicians.filter((musician) => {
    const matchesSearch =
      searchQuery === "" ||
      musician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      musician.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "" || musician.genres.includes(selectedGenre)
    const matchesInstrument =
      selectedInstrument === "" || musician.instruments.includes(selectedInstrument)
    const matchesLevel = selectedLevel === "" || musician.level === selectedLevel

    return matchesSearch && matchesGenre && matchesInstrument && matchesLevel
  })

  const hasActiveFilters = selectedGenre || selectedInstrument || selectedLevel

  const clearFilters = () => {
    setSelectedGenre("")
    setSelectedInstrument("")
    setSelectedLevel("")
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Buscar músicos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Encuentra colaboradores para tu próximo proyecto
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden gap-3 md:flex">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Instrumento" />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((instrument) => (
                  <SelectItem key={instrument} value={instrument}>
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Filters Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[selectedGenre, selectedInstrument, selectedLevel].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Filtra los resultados por género, instrumento o nivel
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Instrumento</Label>
                  <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar instrumento" />
                    </SelectTrigger>
                    <SelectContent>
                      {instruments.map((instrument) => (
                        <SelectItem key={instrument} value={instrument}>
                          {instrument}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nivel</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedGenre && (
              <Badge variant="secondary" className="gap-1">
                {selectedGenre}
                <button onClick={() => setSelectedGenre("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedInstrument && (
              <Badge variant="secondary" className="gap-1">
                {selectedInstrument}
                <button onClick={() => setSelectedInstrument("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedLevel && (
              <Badge variant="secondary" className="gap-1">
                {selectedLevel}
                <button onClick={() => setSelectedLevel("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMusicians.map((musician) => (
          <Card
            key={musician.id}
            className="group transition-all hover:border-primary/50 hover:bg-secondary/30"
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={musician.avatar || undefined} />
                  <AvatarFallback className="bg-secondary text-base">
                    {musician.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{musician.name}</h3>
                  <p className="text-sm text-muted-foreground">{musician.role}</p>
                  <p className="text-xs text-muted-foreground">{musician.location}</p>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {musician.bio}
              </p>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {musician.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {musician.genres.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{musician.genres.length - 3}
                  </Badge>
                )}
              </div>

              <Button variant="outline" className="w-full">
                Ver perfil
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMusicians.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No se encontraron resultados</h3>
          <p className="text-muted-foreground">
            Intenta ajustar tus filtros de búsqueda
          </p>
        </div>
      )}
    </main>
  )
}
