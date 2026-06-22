"use client"

import Link from "next/link"
import { Search, FolderKanban, User, AlertCircle, ArrowRight, Music, Guitar, Mic2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const quickActions = [
  {
    title: "Buscar músicos",
    description: "Encuentra colaboradores para tu próximo proyecto",
    icon: Search,
    href: "/search",
  },
  {
    title: "Mis proyectos",
    description: "Gestiona tus colaboraciones activas",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    title: "Mi perfil",
    description: "Actualiza tu información y habilidades",
    icon: User,
    href: "/profile",
  },
]

const recommendedMusicians = [
  {
    id: 1,
    name: "María García",
    role: "Vocalista",
    genres: ["Pop", "R&B"],
    avatar: null,
    initials: "MG",
  },
  {
    id: 2,
    name: "Carlos López",
    role: "Productor",
    genres: ["Electrónica", "House"],
    avatar: null,
    initials: "CL",
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Guitarrista",
    genres: ["Rock", "Blues"],
    avatar: null,
    initials: "AM",
  },
  {
    id: 4,
    name: "Pedro Sánchez",
    role: "Baterista",
    genres: ["Jazz", "Funk"],
    avatar: null,
    initials: "PS",
  },
]

const recommendedProjects = [
  {
    id: 1,
    title: "EP de Jazz Fusión",
    description: "Buscando bajo y teclados para EP de 5 canciones",
    neededRoles: ["Bajista", "Tecladista"],
    status: "open",
  },
  {
    id: 2,
    title: "Single Pop Latino",
    description: "Producción lista, necesitamos vocalista femenina",
    neededRoles: ["Vocalista"],
    status: "open",
  },
]

export function HomeDashboard() {
  const userName = "Juan"
  const profileIncomplete = true

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hola, {userName}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          El lugar donde los músicos se conectan
        </p>
      </div>

      {/* Profile Incomplete Alert */}
      {profileIncomplete && (
        <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-amber-500">Completa tu perfil</p>
                <p className="text-sm text-muted-foreground">
                  Añade tus instrumentos y géneros para que otros músicos te encuentren
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
              <Link href="/profile">
                Completar perfil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Acceso rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className="group h-full transition-all hover:border-primary/50 hover:bg-secondary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recommendations Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recommended Musicians */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Músicos recomendados</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search" className="text-muted-foreground hover:text-foreground">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recommendedMusicians.map((musician) => (
              <Card key={musician.id} className="transition-all hover:border-primary/50 hover:bg-secondary/30">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={musician.avatar || undefined} />
                      <AvatarFallback className="bg-secondary text-sm">
                        {musician.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{musician.name}</p>
                      <p className="text-sm text-muted-foreground">{musician.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {musician.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recommended Projects */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Proyectos abiertos</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects" className="text-muted-foreground hover:text-foreground">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recommendedProjects.map((project) => (
              <Card key={project.id} className="transition-all hover:border-primary/50 hover:bg-secondary/30">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge variant={project.status === "open" ? "default" : "secondary"} className="ml-2 shrink-0">
                      {project.status === "open" ? "Abierto" : "En progreso"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground">Se busca:</span>
                    {project.neededRoles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
