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
import { collection, doc, limit, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import type { Project, UserProfile } from "@/lib/acordehub-types"

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

export function HomeDashboard() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [musicians, setMusicians] = useState<UserProfile[]>([])
  const [activeProjectsCount, setActiveProjectsCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null)
    })

    const unsubscribeProjects = onSnapshot(
      query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(30)),
      (snapshot) => {
        setProjects(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }) as Project)
            .filter((project) => !project.status || project.status === "active")
        )
      }
    )

    const unsubscribeMyProjects = onSnapshot(
      query(collection(db, "projects"), where("ownerUid", "==", user.uid)),
      (snapshot) => {
        setActiveProjectsCount(
          snapshot.docs.filter((item) => {
            const data = item.data() as Project
            return !data.status || data.status === "active"
          }).length
        )
      }
    )

    const unsubscribeUsers = onSnapshot(query(collection(db, "users"), limit(12)), (snapshot) => {
      setMusicians(
        snapshot.docs
          .map((item) => ({ uid: item.id, ...item.data() }) as UserProfile)
          .filter((item) => item.uid !== user.uid)
      )
    })

    return () => {
      unsubscribeProfile()
      unsubscribeProjects()
      unsubscribeMyProjects()
      unsubscribeUsers()
    }
  }, [user])

  const displayName = useMemo(() => {
    return profile?.name || user?.displayName || "Musico"
  }, [profile?.name, user?.displayName])

  if (loading) {
    return <main className="mobile-shell px-5 py-10 text-[#1a1a1a]">Cargando...</main>
  }

  if (!user) {
    return (
      <main className="mobile-shell flex flex-col items-center justify-center px-5 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">AcordeHub</h1>
        <p className="mt-3 text-sm text-[#2c2c2c]">
          Inicia sesion para ver proyectos, musicos y tu perfil real.
        </p>
        <Button asChild className="mt-6 h-12 rounded-xl bg-[#1a1a1a] px-8 text-white">
          <Link href="/login">Iniciar sesion</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mobile-shell px-5 pb-28 pt-6 md:max-w-7xl md:px-8 md:pb-12">
      <section className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-12 w-12 border border-[#1a1a1a]">
            <AvatarImage src={profile?.photoUrl || user.photoURL || "/placeholder-user.jpg"} alt="Usuario" />
            <AvatarFallback className="bg-[#fff1c8] text-[#1a1a1a]">
              {getInitials(displayName, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#1a1a1a]">Hola, {displayName}!</h1>
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
            <p className="mt-1 text-base font-bold text-[#1a1a1a]">{activeProjectsCount} Activos</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#2c2c2c]">Musicos</p>
            <p className="mt-1 text-base font-bold text-[#1a1a1a]">{musicians.length} Disponibles</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Descubrir talentos</h2>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-[#666666]">
            <Link href="/search">
              Ver
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 md:grid md:grid-cols-3 md:overflow-visible">
          {musicians.slice(0, 6).map((musician) => (
            <Card key={musician.uid} className="min-w-56 rounded-2xl border-[#eeeeee] bg-white shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={musician.photoUrl || undefined} />
                    <AvatarFallback className="bg-[#fff1c8] text-[#1a1a1a]">
                      {getInitials(musician.name, musician.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">{musician.name || "Usuario"}</p>
                    <p className="text-sm text-[#666666]">{musician.role || "Musico"}</p>
                  </div>
                </div>
                <TagRow tags={musician.genres?.slice(0, 3) ?? []} />
              </CardContent>
            </Card>
          ))}
          {musicians.length === 0 && (
            <Card className="min-w-56 rounded-2xl border-[#eeeeee] bg-white shadow-none">
              <CardContent className="p-4 text-sm text-[#666666]">Todavia no hay otros musicos.</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Proyectos destacados</h2>
            <p className="text-xs text-[#2c2c2c]">Ideas recientes con demos para escuchar</p>
          </div>
          <Button asChild size="icon" className="h-11 w-11 rounded-2xl bg-[#fad080] text-[#d4881a] hover:bg-[#f7c948]">
            <Link href="/projects">
              <FolderKanban className="h-5 w-5" />
            </Link>
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
          {projects.slice(0, 6).map((project) => (
            <Card key={project.id} className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">{project.title}</h3>
                    <p className="mt-1 text-sm text-[#666666]">{project.description}</p>
                  </div>
                  <Mic2 className="mt-1 h-5 w-5 shrink-0 text-[#f5a623]" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.demoUri && (
                    <Badge variant="outline" className="rounded-full border-[#fad080] text-[#2c2c2c]">
                      Con demo
                    </Badge>
                  )}
                  <Badge variant="outline" className="rounded-full border-[#fad080] text-[#2c2c2c]">
                    {project.genre}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && (
            <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
              <CardContent className="p-4 text-sm text-[#666666]">
                Todavia no hay proyectos publicados.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="rounded-full bg-[#fff1c8] text-[#1a1a1a]">
          {tag}
        </Badge>
      ))}
    </div>
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
