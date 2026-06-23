"use client"

import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  FolderKanban,
  Headphones,
  MessageCircle,
  Mic2,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const quickActions = [
  {
    label: "Crear",
    icon: Plus,
    href: "/projects",
    className: "bg-[#fad080] text-[#d4881a]",
  },
  {
    label: "Explorar",
    icon: Users,
    href: "/search",
    className: "bg-[#e3f2fd] text-[#1976d2]",
  },
  {
    label: "Demos",
    icon: Headphones,
    href: "/projects",
    className: "bg-[#e8f5e9] text-[#2e7d32]",
  },
]

const musicians = [
  { name: "Maria Garcia", role: "Vocalista", tags: ["Pop", "R&B"], initials: "MG" },
  { name: "Carlos Lopez", role: "Productor", tags: ["Electronica", "House"], initials: "CL" },
  { name: "Ana Martinez", role: "Guitarrista", tags: ["Rock", "Blues"], initials: "AM" },
]

const projects = [
  {
    title: "EP de Jazz Fusion",
    description: "Buscando bajo y teclados para un EP de 5 canciones.",
    tags: ["Con demo", "Jazz"],
  },
  {
    title: "Single Pop Latino",
    description: "Produccion lista, falta sumar una voz principal.",
    tags: ["Abierto", "Pop"],
  },
]

export function HomeDashboard() {
  return (
    <main className="mobile-shell px-5 pb-28 pt-6 md:max-w-7xl md:px-8 md:pb-12">
      <section className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-12 w-12 border border-[#1a1a1a]">
            <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
            <AvatarFallback className="bg-[#fff1c8] text-[#1a1a1a]">JM</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#1a1a1a]">Hola, Musico!</h1>
            <p className="truncate text-xs font-medium text-[#2c2c2c]">Que vamos a crear hoy?</p>
          </div>
        </div>
        <div className="flex gap-2 md:hidden">
          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full">
            <AlertCircle className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <Link
        href="/search"
        className="mt-6 flex h-14 items-center gap-3 rounded-full bg-white px-5 text-sm text-[#666666] shadow-sm ring-1 ring-black/5 transition hover:ring-[#f5a623]/50"
      >
        <Search className="h-5 w-5" />
        Buscar musicos, proyectos o demos...
      </Link>

      <section className="mt-6 grid grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.className}`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-xs font-medium text-[#2c2c2c]">{action.label}</span>
            </Link>
          )
        })}
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#2c2c2c]">Proyectos</p>
            <p className="mt-1 text-base font-bold text-[#1a1a1a]">3 Activos</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#2c2c2c]">Tareas hoy</p>
            <p className="mt-1 text-base font-bold text-[#1a1a1a]">5 Pendientes</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Basado en tus artistas</h2>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-[#666666]">
            <Link href="/search">
              Ver
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 md:grid md:grid-cols-3 md:overflow-visible">
          {musicians.map((musician) => (
            <Card key={musician.name} className="min-w-56 rounded-2xl border-[#eeeeee] bg-white shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#fff1c8] text-[#1a1a1a]">{musician.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">{musician.name}</p>
                    <p className="text-sm text-[#666666]">{musician.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {musician.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full bg-[#fff1c8] text-[#1a1a1a]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Proyectos destacados</h2>
            <p className="text-xs text-[#2c2c2c]">Ideas recientes con demos para escuchar</p>
          </div>
          <Button size="icon" className="h-11 w-11 rounded-2xl bg-[#fad080] text-[#d4881a] hover:bg-[#f7c948]">
            <FolderKanban className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {["Todos", "Con demo", "Mios"].map((chip, index) => (
            <Badge
              key={chip}
              className={
                index === 0
                  ? "rounded-full bg-[#1a1a1a] px-4 py-1.5 text-white hover:bg-[#1a1a1a]"
                  : "rounded-full bg-white px-4 py-1.5 text-[#1a1a1a] hover:bg-white"
              }
            >
              {chip}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.title} className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">{project.title}</h3>
                    <p className="mt-1 text-sm text-[#666666]">{project.description}</p>
                  </div>
                  <Mic2 className="mt-1 h-5 w-5 shrink-0 text-[#f5a623]" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full border-[#fad080] text-[#2c2c2c]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-[#1a1a1a]">Actividad reciente</h2>
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="space-y-2 p-4 text-sm text-[#2c2c2c]">
            <p>Te uniste al proyecto Rock In Rio</p>
            <p>Subiste una nueva demo: Blues Jam</p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
