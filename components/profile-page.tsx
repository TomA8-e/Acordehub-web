"use client"

import { useState } from "react"
import { Edit2, MapPin, Music, Guitar, Trophy, Save, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const availableGenres = ["Rock", "Pop", "Jazz", "Blues", "Electrónica", "Hip Hop", "R&B", "Clásica", "Folk", "Reggae", "Metal", "Funk", "Soul", "Country"]
const availableInstruments = ["Guitarra", "Bajo", "Batería", "Teclado", "Piano", "Voz", "Violín", "Saxofón", "Trompeta", "Flauta"]
const experienceLevels = ["Principiante", "Intermedio", "Avanzado", "Profesional"]

const initialProfile = {
  name: "Juan Músico",
  role: "Guitarrista y Compositor",
  location: "Buenos Aires, Argentina",
  bio: "Guitarrista con más de 8 años de experiencia. Me apasiona el rock clásico y el blues, pero siempre estoy abierto a explorar nuevos géneros. Busco colaborar con músicos que compartan la misma pasión por crear música auténtica.",
  genres: ["Rock", "Blues", "Folk"],
  instruments: ["Guitarra", "Bajo"],
  level: "Avanzado",
  email: "juan@email.com",
}

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const [editedProfile, setEditedProfile] = useState(initialProfile)

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const toggleGenre = (genre: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }))
  }

  const toggleInstrument = (instrument: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter((i) => i !== instrument)
        : [...prev.instruments, instrument],
    }))
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-secondary via-muted to-secondary" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="-mt-12 h-24 w-24 border-4 border-card sm:-mt-16 sm:h-32 sm:w-32">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-secondary text-2xl sm:text-3xl">JM</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editedProfile.name}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="text-xl font-bold"
                    />
                    <Input
                      value={editedProfile.role}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({ ...prev, role: e.target.value }))
                      }
                      placeholder="Tu rol (ej: Guitarrista)"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold sm:text-3xl">{profile.name}</h1>
                    <p className="text-muted-foreground">{profile.role}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {isEditing ? (
              <Input
                value={editedProfile.location}
                onChange={(e) =>
                  setEditedProfile((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Tu ubicación"
                className="max-w-xs"
              />
            ) : (
              <span>{profile.location}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Sobre mí
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedProfile.bio}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={5}
                  placeholder="Cuéntanos sobre ti y tu música..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Genres */}
          <Card>
            <CardHeader>
              <CardTitle>Géneros musicales</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Selecciona los géneros que te interesan"
                  : "Los géneros en los que me especializo"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {isEditing
                  ? availableGenres.map((genre) => {
                      const isSelected = editedProfile.genres.includes(genre)
                      return (
                        <Badge
                          key={genre}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleGenre(genre)}
                        >
                          {genre}
                        </Badge>
                      )
                    })
                  : profile.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
              </div>
            </CardContent>
          </Card>

          {/* Instruments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Guitar className="h-5 w-5" />
                Instrumentos
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Selecciona los instrumentos que tocas"
                  : "Los instrumentos que domino"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {isEditing
                  ? availableInstruments.map((instrument) => {
                      const isSelected = editedProfile.instruments.includes(instrument)
                      return (
                        <Badge
                          key={instrument}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleInstrument(instrument)}
                        >
                          {instrument}
                        </Badge>
                      )
                    })
                  : profile.instruments.map((instrument) => (
                      <Badge key={instrument} variant="secondary">
                        {instrument}
                      </Badge>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Experience Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Nivel de experiencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={editedProfile.level}
                  onValueChange={(value) =>
                    setEditedProfile((prev) => ({ ...prev, level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {profile.level}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({ ...prev, email: e.target.value }))
                    }
                    type="email"
                  />
                ) : (
                  <p className="text-sm">{profile.email}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Proyectos activos</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Colaboraciones</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Miembro desde</span>
                <span className="font-semibold">Ene 2024</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
