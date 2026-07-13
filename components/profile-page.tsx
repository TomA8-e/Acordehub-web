"use client"

import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { BriefcaseBusiness, CreditCard, Edit2, ExternalLink, Guitar, Loader2, MapPin, Music, Save, Search, Trash2, Trophy, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { defaultProfile, getAccountTypeLabel, type FavoriteArtist, type UserProfile } from "@/lib/acordehub-types"
import { searchSpotifyArtists, type SpotifyArtist } from "@/lib/api"

const defaultGenres = ["Rock", "Pop", "Jazz", "Blues", "Electronica", "Folk", "Metal", "Funk"]
const defaultInstruments = ["Guitarra", "Bajo", "Bateria", "Teclado", "Piano", "Voz", "Saxofon"]
const levels = ["Principiante", "Intermedio", "Avanzado", "Profesional"]
const accountTypes = [
  { value: "musician", label: "Musico" },
  { value: "producer", label: "Productor" },
]
const producerServices = ["Mezcla", "Mastering", "Grabacion", "Beatmaking", "Produccion vocal", "Arreglos", "Edicion"]

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
        accountType: draft.accountType ?? "musician",
        genres: draft.genres ?? [],
        instruments: draft.instruments ?? [],
        level: draft.level ?? "",
        description: draft.description ?? "",
        location: draft.location ?? "",
        producerServices: draft.producerServices ?? [],
        daw: draft.daw ?? "",
        equipment: draft.equipment ?? "",
        rates: draft.rates ?? "",
        portfolioUrl: draft.portfolioUrl ?? "",
        availability: draft.availability ?? "",
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

  const toggleArrayValue = (field: "genres" | "instruments" | "producerServices", value: string) => {
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
    return <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:bg-background md:text-[#1a1a1a]">Cargando perfil...</main>
  }

  if (!user) {
    return <main className="min-h-screen bg-[#050505] px-4 py-10 text-center text-white md:bg-background md:text-[#1a1a1a]">Inicia sesion.</main>
  }

  const current = isEditing ? draft : profile

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#050505] px-4 pb-28 pt-5 md:max-w-7xl md:bg-background md:px-8 md:pb-14 md:pt-8 lg:px-10 xl:px-12">
      <Card className="overflow-hidden rounded-xl border-[#2a2a2a] bg-[#111111] text-white shadow-none md:rounded-lg md:border-[#dfe4dd] md:bg-white md:text-[#1a1a1a] md:shadow-sm">
        <div className="h-28 bg-[#202020] md:h-36 md:bg-[#eef2f0]" />
        <CardContent className="p-5 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="-mt-12 h-24 w-24 border-4 border-[#111111] bg-[#202020] md:border-white md:bg-[#eef2f0]">
                <AvatarImage src={current.photoUrl || user.photoURL || "/placeholder-user.jpg"} />
                <AvatarFallback className="bg-[#202020] text-xl text-white md:bg-[#f7c948] md:text-[#1a1a1a]">
                  {getInitials(current.name, current.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft((prev) => prev && { ...prev, name: e.target.value })}
                      className="border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                    />
                    <SelectableTags
                      items={accountTypes.map((item) => item.label)}
                      selected={[getAccountTypeLabel(draft.accountType)]}
                      onToggle={(value) =>
                        setDraft((prev) => prev && { ...prev, accountType: value === "Productor" ? "producer" : "musician" })
                      }
                      single
                    />
                    <Input
                      value={draft.role ?? ""}
                      onChange={(e) => setDraft((prev) => prev && { ...prev, role: e.target.value })}
                      placeholder={draft.accountType === "producer" ? "Especialidad: mezcla, beatmaker..." : "Rol musical: guitarrista, cantante..."}
                      className="border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="truncate text-2xl font-bold md:text-4xl md:font-black">{current.name || "Usuario"}</h1>
                    <p className="truncate text-sm text-[#a7afbc] md:mt-1 md:text-[#5f6661]">
                      {getAccountTypeLabel(current.accountType)}{current.role ? ` · ${current.role}` : ""}
                    </p>
                  </>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="hidden gap-2 md:flex">
                <Button asChild className="bg-[#f5a623] font-bold text-[#1a1a1a] hover:bg-[#f7c948] md:rounded-md">
                  <Link href="/plans">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ver planes
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="border-[#dfe4dd] bg-white text-[#1a1a1a] md:rounded-md">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 truncate text-sm text-[#a7afbc] md:text-[#5f6661]">
              <MapPin className="h-4 w-4 shrink-0" />
              {isEditing ? (
                <Input
                  value={draft.location ?? ""}
                  onChange={(e) => setDraft((prev) => prev && { ...prev, location: e.target.value })}
                  placeholder="Ciudad, provincia"
                  className="h-9 border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                />
              ) : (
                current.location || "Ubicacion no definida"
              )}
            </p>
            {isEditing ? (
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={cancel} className="border-[#2a2a2a] bg-transparent text-white md:rounded-md md:border-[#dfe4dd] md:text-[#1a1a1a]">
                  <X className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={save} disabled={saving} className="bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f7c948] md:rounded-md">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 md:hidden">
                <Button asChild className="bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f7c948]">
                  <Link href="/plans">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Planes
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="border-[#2a2a2a] bg-transparent text-white">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            )}
          </div>
          {message && <p className="mt-4 text-sm text-[#f7c948] md:text-[#c47a00]">{message}</p>}
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 md:mt-6 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <DarkCard icon={Music} title="Sobre mi">
            {isEditing ? (
              <Textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft((prev) => prev && { ...prev, description: e.target.value })}
                className="min-h-28 border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
              />
            ) : (
              <p className="text-sm leading-6 text-[#a7afbc] md:text-[#5f6661]">
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

          <DarkCard icon={Music} title="Artistas favoritos">
            {isEditing ? (
              <FavoriteArtistsEditor
                selected={draft.favoriteArtists ?? []}
                onChange={(favoriteArtists) =>
                  setDraft((previous) => previous && { ...previous, favoriteArtists })
                }
              />
            ) : (
              <FavoriteArtistsList artists={current.favoriteArtists ?? []} />
            )}
          </DarkCard>

          {current.accountType === "producer" && (
            <DarkCard icon={BriefcaseBusiness} title="Perfil de productor">
              {isEditing ? (
                <div className="space-y-4">
                  <SelectableTags
                    items={producerServices}
                    selected={draft.producerServices ?? []}
                    onToggle={(value) => toggleArrayValue("producerServices", value)}
                  />
                  <Input
                    value={draft.daw ?? ""}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, daw: e.target.value })}
                    placeholder="DAW principal"
                    className="border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                  />
                  <Textarea
                    value={draft.equipment ?? ""}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, equipment: e.target.value })}
                    placeholder="Equipamiento, sala, plugins o herramientas"
                    className="min-h-24 border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                  />
                  <Input
                    value={draft.rates ?? ""}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, rates: e.target.value })}
                    placeholder="Tarifas orientativas"
                    className="border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                  />
                  <Input
                    value={draft.portfolioUrl ?? ""}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, portfolioUrl: e.target.value })}
                    placeholder="Link a portfolio, Spotify, SoundCloud..."
                    className="border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <TagList items={current.producerServices ?? []} empty="Sin servicios definidos" />
                  <ProducerLine label="DAW" value={current.daw} />
                  <ProducerLine label="Equipo" value={current.equipment} />
                  <ProducerLine label="Tarifas" value={current.rates} />
                  {current.portfolioUrl && (
                    <Button asChild variant="outline" className="rounded-xl border-[#2a2a2a] bg-transparent text-white md:rounded-md md:border-[#dfe4dd] md:bg-white md:text-[#1a1a1a]">
                      <a href={current.portfolioUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver portfolio
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </DarkCard>
          )}
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
              <Badge className="rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f5a623] md:rounded-md">
                {current.level || "Sin definir"}
              </Badge>
            )}
          </DarkCard>

          <DarkCard title="Contacto">
            <p className="text-xs text-[#a7afbc] md:text-[#5f6661]">Email</p>
            <p className="mt-1 text-sm font-semibold text-white md:text-[#1a1a1a]">{current.email || user.email}</p>
          </DarkCard>

          <DarkCard icon={CreditCard} title="Plan y pagos">
            <p className="text-sm leading-6 text-[#a7afbc] md:text-[#5f6661]">
              Plan actual: <span className="font-bold text-white md:text-[#1a1a1a]">{current.plan || "free"}</span>
            </p>
            <Button asChild className="mt-4 h-11 w-full rounded-xl bg-[#f5a623] font-bold text-[#1a1a1a] hover:bg-[#f7c948] md:rounded-md">
              <Link href="/plans">Ver planes de pago</Link>
            </Button>
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
    <Card className="rounded-xl border-[#2a2a2a] bg-[#111111] text-white shadow-none md:rounded-lg md:border-[#dfe4dd] md:bg-white md:text-[#1a1a1a] md:shadow-sm">
      <CardContent className="p-5 md:p-6">
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
  if (items.length === 0) return <p className="text-sm text-[#a7afbc] md:text-[#5f6661]">{empty}</p>

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} className="rounded-full bg-[#202020] text-white hover:bg-[#202020] md:rounded-md md:bg-[#eef2f0] md:text-[#1a1a1a] md:hover:bg-[#eef2f0]">
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
                ? "rounded-full bg-[#f5a623] px-3 py-1.5 text-xs font-bold text-[#1a1a1a] md:rounded-md"
                : "rounded-full bg-[#202020] px-3 py-1.5 text-xs font-bold text-white md:rounded-md md:bg-[#eef2f0] md:text-[#1a1a1a]"
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
      <span className="text-[#a7afbc] md:text-[#5f6661]">{label}</span>
      <span className="font-semibold text-white md:text-[#1a1a1a]">{value}</span>
    </div>
  )
}

function ProducerLine({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a7afbc] md:text-[#5f6661]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-white md:text-[#1a1a1a]">{value}</p>
    </div>
  )
}

function FavoriteArtistsEditor({
  selected,
  onChange,
}: {
  selected: FavoriteArtist[]
  onChange: (artists: FavoriteArtist[]) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotifyArtist[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")

  const search = async (event: React.FormEvent) => {
    event.preventDefault()
    if (query.trim().length < 2) {
      setError("Escribi al menos dos caracteres.")
      return
    }
    setSearching(true)
    setError("")
    try {
      const response = await searchSpotifyArtists(query.trim())
      setResults(response.artists)
      if (response.artists.length === 0) setError("No encontramos artistas con ese nombre.")
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : ""
      setError(
        message === "unauthenticated"
          ? "Tu sesion vencio. Volve a iniciar sesion para buscar artistas."
          : "No pudimos buscar en Spotify. Intenta nuevamente."
      )
    } finally {
      setSearching(false)
    }
  }

  const add = (artist: SpotifyArtist) => {
    if (selected.some((item) => item.id === artist.id)) return
    onChange([...selected, artist])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl bg-[#e8f8ed] p-3 text-[#116530]">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black">
          <Music className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-black">Conecta tus gustos con Spotify</p>
          <p className="mt-0.5 text-xs leading-5 text-[#3f6f50]">
            Busca artistas, agregalos a tu perfil y guarda los cambios al terminar.
          </p>
        </div>
      </div>
      <FavoriteArtistsList
        artists={selected}
        onRemove={(artist) => onChange(selected.filter((item) => item.id !== artist.id))}
      />
      <form onSubmit={search} className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un artista en Spotify"
          maxLength={100}
          className="border-[#2a2a2a] bg-[#202020] text-white md:rounded-md md:border-[#dfe4dd] md:bg-[#fbfcf8] md:text-[#1a1a1a]"
        />
        <Button type="submit" disabled={searching} className="bg-[#1ed760] text-black hover:bg-[#1fdf64]">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="sr-only">Buscar en Spotify</span>
        </Button>
      </form>
      {error && <p className="text-sm text-[#f7c948] md:text-[#c47a00]">{error}</p>}
      {results.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((artist) => {
            const added = selected.some((item) => item.id === artist.id)
            return (
              <button
                key={artist.id}
                type="button"
                disabled={added}
                onClick={() => add(artist)}
                className="flex items-center gap-3 rounded-xl border border-[#2a2a2a] p-2 text-left disabled:opacity-50 md:rounded-md md:border-[#dfe4dd]"
              >
                <ArtistImage artist={artist} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{artist.name}</span>
                <span className="text-xs text-[#a7afbc] md:text-[#5f6661]">{added ? "Agregado" : "Agregar"}</span>
              </button>
            )
          })}
        </div>
      )}
      <p className="text-xs text-[#a7afbc] md:text-[#5f6661]">Resultados provistos por Spotify.</p>
    </div>
  )
}

function FavoriteArtistsList({
  artists,
  onRemove,
}: {
  artists: FavoriteArtist[]
  onRemove?: (artist: FavoriteArtist) => void
}) {
  if (artists.length === 0) {
    return <p className="text-sm text-[#a7afbc] md:text-[#5f6661]">Todavia no agregaste artistas favoritos.</p>
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {artists.map((artist, index) => (
        <div key={artist.id || `${artist.name}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#202020] p-2 md:rounded-md md:bg-[#eef2f0]">
          <ArtistImage artist={artist} />
          <span className="min-w-0 flex-1 truncate text-sm font-bold">{artist.name || "Artista"}</span>
          {onRemove && (
            <Button type="button" size="icon" variant="ghost" onClick={() => onRemove(artist)} className="h-8 w-8 shrink-0" aria-label={`Quitar ${artist.name || "artista"}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

function ArtistImage({ artist }: { artist: FavoriteArtist }) {
  return artist.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={artist.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
      <Music className="h-4 w-4" />
    </span>
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
