"use client"

import Link from "next/link"
import {
  ArrowRight,
  CreditCard,
  Headphones,
  Mic2,
  Plus,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react"
import { collection, doc, limit, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { getAccountTypeLabel, type Project, type UserProfile } from "@/lib/acordehub-types"

const quickActions = [
  {
    label: "Crear proyecto",
    caption: "Publica una demo",
    icon: Plus,
    href: "/projects",
    className: "bg-[#fff3cf] text-[#c47a00]",
  },
  {
    label: "Explorar musicos",
    caption: "Busca colaboradores",
    icon: Users,
    href: "/search",
    className: "bg-[#e6f4f1] text-[#0f766e]",
  },
  {
    label: "Escuchar demos",
    caption: "Ideas recientes",
    icon: Headphones,
    href: "/projects",
    className: "bg-[#e8eefc] text-[#2563eb]",
  },
  {
    label: "Planes y pagos",
    caption: "Ver Premium",
    icon: CreditCard,
    href: "/plans",
    className: "bg-[#1a1a1a] text-white",
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
    return <main className="app-container text-[#1a1a1a]">Cargando...</main>
  }

  if (!user) {
    return (
      <main className="app-container">
        <section className="surface-panel mx-auto max-w-3xl rounded-[32px] p-8 text-center lg:rounded-lg">
          <p className="eyebrow">AcordeHub web</p>
          <h1 className="mt-3 text-4xl font-black text-[#1a1a1a]">Tu red musical en un solo lugar</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#5f6661]">
            Inicia sesion para ver proyectos, descubrir musicos y mantener sincronizado tu perfil con la app mobile.
          </p>
          <Button asChild className="mt-7 h-12 rounded-2xl bg-[#1a1a1a] px-8 text-white">
            <Link href="/login">Iniciar sesion</Link>
          </Button>
        </section>
      </main>
    )
  }

  const demoProjects = projects.filter((project) => project.demoUri).length
  const completedProfile = [
    profile?.role,
    profile?.location,
    profile?.description,
    profile?.genres?.length,
    profile?.instruments?.length,
  ].filter(Boolean).length

  return (
    <main className="app-container">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="surface-panel rounded-[32px] p-5 sm:p-7 lg:rounded-lg lg:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-4 border-white shadow-sm lg:h-16 lg:w-16">
                  <AvatarImage src={profile?.photoUrl || user.photoURL || "/placeholder-user.jpg"} alt="Usuario" />
                  <AvatarFallback className="bg-[#f7c948] font-black text-[#1a1a1a]">
                    {getInitials(displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="eyebrow">Dashboard creativo</p>
                  <h1 className="text-3xl font-black leading-tight text-[#1a1a1a] sm:text-4xl lg:text-[42px]">
                    Hola, {displayName}
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-[#5f6661]">
                Administra tus proyectos, encuentra musicos compatibles y publica demos desde la misma base de datos de la app mobile.
              </p>
            </div>

            <Button asChild className="h-12 rounded-2xl bg-[#1a1a1a] px-5 font-bold text-white lg:rounded-md">
              <Link href="/projects">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo proyecto
              </Link>
            </Button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:gap-4">
            <Metric label="Tus proyectos" value={activeProjectsCount.toString()} tone="dark" />
            <Metric label="Musicos visibles" value={musicians.length.toString()} tone="teal" />
            <Metric label="Demos activas" value={demoProjects.toString()} tone="blue" />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="soft-panel rounded-[32px] p-5 lg:rounded-lg lg:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1a1a] text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-[#1a1a1a]">Perfil creativo</p>
                <p className="text-xs text-[#5f6661]">{completedProfile}/5 secciones completas</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7ebe6]">
              <div
                className="h-full rounded-full bg-[#f5a623]"
                style={{ width: `${Math.min(100, completedProfile * 20)}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5f6661]">
              Completar rol, generos e instrumentos mejora como apareces en busqueda.
            </p>
            <Button asChild variant="outline" className="mt-5 h-11 w-full rounded-2xl border-[#dfe4dd] bg-white lg:rounded-md">
              <Link href="/profile">Mejorar perfil</Link>
            </Button>
          </div>

          <div className="rounded-[32px] border border-[#1a1a1a] bg-[#1a1a1a] p-5 text-white shadow-[0_18px_50px_rgba(26,26,26,0.18)] lg:rounded-lg lg:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7c948] text-[#1a1a1a] lg:rounded-md">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black">Planes de pago</p>
                <p className="text-xs text-white/65">Free, Plus, Pro y Producer</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/72">
              Activa mas proyectos, perfil destacado y herramientas para productores.
            </p>
            <Button asChild className="mt-5 h-11 w-full rounded-2xl bg-white font-bold text-[#1a1a1a] hover:bg-[#f7c948] lg:rounded-md">
              <Link href="/plans">Ver planes</Link>
            </Button>
          </div>
        </aside>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4 lg:mt-6 lg:gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className="surface-panel group rounded-[24px] p-4 transition-transform hover:-translate-y-0.5 lg:rounded-lg lg:p-5"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl lg:rounded-md ${action.className}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-black text-[#1a1a1a]">{action.label}</p>
                  <p className="text-sm text-[#5f6661]">{action.caption}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-[#8a918c] transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          )
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div>
          <SectionHeader title="Descubrir talentos" href="/search" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {musicians.slice(0, 4).map((musician) => (
              <Card key={musician.uid} className="surface-panel rounded-[24px] lg:rounded-lg">
                <CardContent className="p-4 lg:p-5">
                  <Link href={`/profile/${musician.uid}`} className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={musician.photoUrl || undefined} />
                      <AvatarFallback className="bg-[#e6f4f1] font-black text-[#0f766e]">
                        {getInitials(musician.name, musician.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-black text-[#1a1a1a]">{musician.name || "Usuario"}</p>
                      <p className="truncate text-sm text-[#5f6661]">
                        {getAccountTypeLabel(musician.accountType)}{musician.role ? ` · ${musician.role}` : ""}
                      </p>
                    </div>
                  </Link>
                  <TagRow tags={musician.genres?.slice(0, 3) ?? []} />
                </CardContent>
              </Card>
            ))}
            {musicians.length === 0 && (
              <EmptyPanel text="Todavia no hay otros musicos disponibles." />
            )}
          </div>
        </div>

        <div>
          <SectionHeader title="Proyectos destacados" href="/projects" />
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Card key={project.id} className="surface-panel rounded-[24px] lg:rounded-lg">
                <CardContent className="flex gap-4 p-4 lg:p-5">
                  <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#fff3cf] text-[#c47a00] lg:rounded-md">
                    <Mic2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[#1a1a1a]">{project.title}</h3>
                      {project.demoUri && (
                        <Badge className="rounded-full bg-[#e8eefc] text-[#2563eb] hover:bg-[#e8eefc]">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-[#5f6661]">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full border-[#dfe4dd] bg-white">
                        {project.genre}
                      </Badge>
                      <span className="text-xs font-semibold text-[#8a918c]">por {project.ownerName || "Usuario"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && <EmptyPanel text="Todavia no hay proyectos publicados." />}
          </div>
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "dark" | "teal" | "blue" }) {
  const toneClass = {
    dark: "bg-[#1a1a1a] text-white",
    teal: "bg-[#e6f4f1] text-[#0f766e]",
    blue: "bg-[#e8eefc] text-[#2563eb]",
  }[tone]

  return (
    <div className="rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] p-4 lg:rounded-lg">
      <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-black ${toneClass}`}>{value}</span>
      <p className="mt-3 text-sm font-bold text-[#5f6661]">{label}</p>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xl font-black text-[#1a1a1a]">{title}</h2>
      <Button asChild variant="ghost" size="sm" className="rounded-xl text-[#5f6661]">
        <Link href={href}>
          Ver todo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} className="rounded-full bg-[#eef2f0] text-[#1a1a1a] hover:bg-[#eef2f0] lg:rounded-md">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="soft-panel rounded-[24px] p-5 text-sm font-medium text-[#5f6661] lg:rounded-lg">
      <Wand2 className="mb-3 h-5 w-5 text-[#f5a623]" />
      {text}
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
