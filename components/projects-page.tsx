"use client"

import { useState } from "react"
import { Plus, FolderKanban, Users, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateProjectModal } from "@/components/create-project-modal"

const userProjects = [
  {
    id: 1,
    title: "Álbum de Rock Alternativo",
    description: "Proyecto de álbum completo con 12 canciones. Buscamos bajista y vocalista para completar la formación.",
    genres: ["Rock", "Alternativo"],
    neededRoles: ["Bajista", "Vocalista"],
    status: "open" as const,
    createdAt: "2024-01-15",
    members: [
      { name: "Juan Músico", initials: "JM" },
      { name: "Pedro Sánchez", initials: "PS" },
    ],
  },
  {
    id: 2,
    title: "EP Acústico",
    description: "Sesión íntima de 5 canciones acústicas. Grabación en estudio casero.",
    genres: ["Folk", "Acústico"],
    neededRoles: [],
    status: "in_progress" as const,
    createdAt: "2024-02-01",
    members: [
      { name: "Juan Músico", initials: "JM" },
      { name: "Ana Martínez", initials: "AM" },
      { name: "Laura Torres", initials: "LT" },
    ],
  },
  {
    id: 3,
    title: "Single Electrónico",
    description: "Producción de single para lanzamiento digital. Colaboración con vocalista internacional.",
    genres: ["Electrónica", "House"],
    neededRoles: ["Vocalista"],
    status: "open" as const,
    createdAt: "2024-02-10",
    members: [
      { name: "Juan Músico", initials: "JM" },
      { name: "Carlos López", initials: "CL" },
    ],
  },
]

export function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const getStatusBadge = (status: "open" | "in_progress" | "completed") => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Abierto</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">En progreso</Badge>
      case "completed":
        return <Badge variant="secondary">Completado</Badge>
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mis proyectos
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Gestiona tus colaboraciones musicales
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Crear proyecto
        </Button>
      </div>

      {/* Projects Grid */}
      {userProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userProjects.map((project) => (
            <Card
              key={project.id}
              className="group flex flex-col transition-all hover:border-primary/50 hover:bg-secondary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-3">
                  {/* Genres */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {/* Needed Roles */}
                  {project.neededRoles.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Se busca:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.neededRoles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  {/* Members */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="bg-secondary text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No tienes proyectos aún</h3>
          <p className="mb-4 text-muted-foreground">
            Crea tu primer proyecto y empieza a colaborar
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear proyecto
          </Button>
        </Card>
      )}

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </main>
  )
}
