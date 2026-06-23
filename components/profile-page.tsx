"use client"

import type { ComponentType, ReactNode } from "react"
import { Edit2, Guitar, MapPin, Music, Save, Trophy, X } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialProfile = {
  name: "Juan Musico",
  role: "Guitarrista y compositor",
  location: "Buenos Aires, Argentina",
  bio: "Guitarrista con mas de 8 anos de experiencia. Me gusta el rock clasico, el blues y colaborar con musicos que quieran crear algo propio.",
  genres: ["Rock", "Blues", "Folk"],
  instruments: ["Guitarra", "Bajo"],
  level: "Avanzado",
  email: "juan@email.com",
}

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)

  const save = () => {
    setProfile(draft)
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(profile)
    setIsEditing(false)
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#050505] px-4 pb-28 pt-5 md:max-w-5xl md:px-8 md:pb-12">
      <Card className="overflow-hidden rounded-xl border-[#2a2a2a] bg-[#111111] text-white shadow-none">
        <div className="h-28 bg-[#202020]" />
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="-mt-12 h-24 w-24 border-4 border-[#111111] bg-[#202020]">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-[#202020] text-xl text-white">JM</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                    className="border-[#2a2a2a] bg-[#202020] text-white"
                  />
                  <Input
                    value={draft.role}
                    onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))}
                    className="border-[#2a2a2a] bg-[#202020] text-white"
                  />
                </div>
              ) : (
                <>
                  <h1 className="truncate text-2xl font-bold">{profile.name}</h1>
                  <p className="truncate text-sm text-[#a7afbc]">{profile.role}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 truncate text-sm text-[#a7afbc]">
              <MapPin className="h-4 w-4 shrink-0" />
              {profile.location}
            </p>
            {isEditing ? (
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={cancel} className="border-[#2a2a2a] bg-transparent text-white">
                  <X className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={save} className="bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f7c948]">
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
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <DarkCard icon={Music} title="Sobre mi">
            {isEditing ? (
              <Textarea
                value={draft.bio}
                onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                className="min-h-28 border-[#2a2a2a] bg-[#202020] text-white"
              />
            ) : (
              <p className="text-sm leading-6 text-[#a7afbc]">{profile.bio}</p>
            )}
          </DarkCard>

          <DarkCard title="Generos musicales">
            <TagList items={profile.genres} />
          </DarkCard>

          <DarkCard icon={Guitar} title="Instrumentos">
            <TagList items={profile.instruments} />
          </DarkCard>
        </div>

        <div className="space-y-5">
          <DarkCard icon={Trophy} title="Nivel de experiencia">
            <Badge className="rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-[#f5a623]">
              {profile.level}
            </Badge>
          </DarkCard>

          <DarkCard title="Contacto">
            <p className="text-xs text-[#a7afbc]">Email</p>
            <p className="mt-1 text-sm font-semibold text-white">{profile.email}</p>
          </DarkCard>

          <DarkCard title="Estadisticas">
            <div className="space-y-3 text-sm">
              <Stat label="Generos" value={profile.genres.length.toString()} />
              <Stat label="Artistas favoritos" value="4" />
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

function TagList({ items }: { items: string[] }) {
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#a7afbc]">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}
