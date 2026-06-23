"use client"

import { Calendar, Plus, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const projects = [
  {
    title: "Album de Rock Alternativo",
    description: "Proyecto de 12 canciones. Buscamos bajista y vocalista para completar la formacion.",
    genres: ["Rock", "Alternativo"],
    status: "Abierto",
    members: ["JM", "PS"],
    date: "15 ene",
  },
  {
    title: "EP Acustico",
    description: "Sesion intima de 5 canciones acusticas con grabacion en estudio casero.",
    genres: ["Folk", "Acustico"],
    status: "En progreso",
    members: ["JM", "AM", "LT"],
    date: "1 feb",
  },
  {
    title: "Single Electronico",
    description: "Produccion de single para lanzamiento digital. Falta sumar una voz principal.",
    genres: ["Electronica", "House"],
    status: "Abierto",
    members: ["JM", "CL"],
    date: "10 feb",
  },
]

export function ProjectsPage() {
  return (
    <main className="mobile-shell px-5 pb-28 pt-6 md:max-w-7xl md:px-8 md:pb-12">
      <section className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] md:text-4xl">Mis proyectos</h1>
          <p className="mt-1 text-sm text-[#2c2c2c]">Gestiona tus colaboraciones musicales</p>
        </div>
        <Button className="h-11 rounded-2xl bg-[#1a1a1a] px-4 text-white hover:bg-[#2c2c2c]">
          <Plus className="mr-2 h-4 w-4" />
          Crear
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title} className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[#1a1a1a]">{project.title}</h2>
                  <p className="mt-1 text-sm text-[#666666]">{project.description}</p>
                </div>
                <Badge className="rounded-full bg-[#fff1c8] text-[#1a1a1a] hover:bg-[#fff1c8]">
                  {project.status}
                </Badge>
              </div>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {project.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="rounded-full border-[#fad080] text-[#2c2c2c]">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#eeeeee] pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#666666]" />
                  <div className="flex -space-x-2">
                    {project.members.map((member) => (
                      <Avatar key={member} className="h-7 w-7 border-2 border-white">
                        <AvatarFallback className="bg-[#fff1c8] text-[10px] text-[#1a1a1a]">
                          {member}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#666666]">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.date}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
