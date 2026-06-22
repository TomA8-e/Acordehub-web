"use client"

import { useState } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

const availableGenres = ["Rock", "Pop", "Jazz", "Blues", "Electrónica", "Hip Hop", "R&B", "Clásica", "Folk", "Reggae", "Metal", "Funk", "Soul", "Country", "Alternativo", "Indie"]
const availableRoles = ["Vocalista", "Guitarrista", "Bajista", "Baterista", "Tecladista", "Productor", "Saxofonista", "Violinista", "DJ", "Compositor"]

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle project creation here
    console.log({ title, description, selectedGenres, selectedRoles })
    // Reset form
    setTitle("")
    setDescription("")
    setSelectedGenres([])
    setSelectedRoles([])
    onOpenChange(false)
  }

  const isValid = title.trim() && description.trim() && selectedGenres.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo proyecto</DialogTitle>
          <DialogDescription>
            Define los detalles de tu proyecto musical
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Título del proyecto</FieldLabel>
              <Input
                id="title"
                placeholder="Ej: Álbum de Rock Alternativo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe tu proyecto, objetivos y lo que buscas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </Field>
          </FieldGroup>

          {/* Genres Selection */}
          <div className="space-y-3">
            <Label>Géneros musicales</Label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre)
                return (
                  <Badge
                    key={genre}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Roles Needed */}
          <div className="space-y-3">
            <Label>Roles que necesitas (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.includes(role)
                return (
                  <Badge
                    key={role}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleRole(role)}
                  >
                    {role}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid}>
              Publicar proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
