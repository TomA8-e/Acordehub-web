"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, limit, onSnapshot, query, where } from "firebase/firestore"
import { ArrowLeft, BriefcaseBusiness, Calendar, ExternalLink, Headphones, MapPin, Music2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { getAccountTypeLabel, type Project, type UserProfile } from "@/lib/acordehub-types"

export function PublicProfilePage({ uid }: { uid: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const load = async () => {
      const snapshot = await getDoc(doc(db, "users", uid))
      if (!snapshot.exists()) {
        setMessage("No encontramos este perfil.")
        setLoading(false)
        return
      }
      setProfile({ uid, ...snapshot.data() } as UserProfile)
      setLoading(false)
    }

    load().catch((err) => {
      setMessage(err instanceof Error ? err.message : "No pudimos cargar el perfil")
      setLoading(false)
    })

    return onSnapshot(
      query(collection(db, "projects"), where("ownerUid", "==", uid), limit(12)),
      (snapshot) => {
        setProjects(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }) as Project)
            .filter((project) => !project.status || project.status === "active")
        )
      }
    )
  }, [uid])

  if (loading) return <main className="app-container text-[#1a1a1a]">Cargando perfil...</main>

  if (!profile) {
    return (
      <main className="app-container">
        <div className="surface-panel rounded-[28px] p-8 text-center lg:rounded-lg">
          <p className="font-black text-[#1a1a1a]">{message}</p>
          <Button asChild className="mt-5 rounded-2xl bg-[#1a1a1a] text-white lg:rounded-md">
            <Link href="/search">Volver a explorar</Link>
          </Button>
        </div>
      </main>
    )
  }

  const isProducer = profile.accountType === "producer"

  return (
    <main className="app-container">
      <Button asChild variant="ghost" className="mb-4 rounded-xl text-[#5f6661]">
        <Link href="/search">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </Button>

      <section className="surface-panel overflow-hidden rounded-[32px] lg:rounded-lg">
        <div className="h-32 bg-[#1a1a1a] lg:h-40" />
        <div className="p-5 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="-mt-16 h-28 w-28 border-4 border-white bg-white shadow-sm">
                <AvatarImage src={profile.photoUrl || "/placeholder-user.jpg"} />
                <AvatarFallback className="bg-[#f7c948] text-2xl font-black text-[#1a1a1a]">
                  {getInitials(profile.name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-1">
                <Badge className={isProducer ? "rounded-full bg-[#fff3cf] text-[#c47a00]" : "rounded-full bg-[#e6f4f1] text-[#0f766e]"}>
                  {getAccountTypeLabel(profile.accountType)}
                </Badge>
                <h1 className="mt-3 text-3xl font-black text-[#1a1a1a] lg:text-5xl">{profile.name || "Usuario"}</h1>
                <p className="mt-1 text-sm font-bold text-[#5f6661]">{profile.role || (isProducer ? "Productor musical" : "Musico")}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.portfolioUrl && (
                <Button asChild className="rounded-2xl bg-[#1a1a1a] text-white lg:rounded-md">
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Portfolio
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" className="rounded-2xl border-[#dfe4dd] bg-white lg:rounded-md">
                <Link href={`/messages?with=${profile.uid}`}>Enviar mensaje</Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-[#5f6661]">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {profile.location || "Sin ubicacion"}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {profile.level || "Nivel no definido"}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <InfoCard icon={Music2} title="Sobre el perfil">
            <p className="text-sm leading-6 text-[#5f6661]">{profile.description || "Todavia no agrego una descripcion."}</p>
          </InfoCard>

          <InfoCard title="Generos e instrumentos">
            <TagList items={[...(profile.genres ?? []), ...(profile.instruments ?? [])]} />
          </InfoCard>

          {isProducer && (
            <InfoCard icon={BriefcaseBusiness} title="Servicios de productor">
              <TagList items={profile.producerServices ?? []} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Detail label="DAW" value={profile.daw} />
                <Detail label="Tarifas" value={profile.rates} />
                <Detail label="Equipo" value={profile.equipment} wide />
              </div>
            </InfoCard>
          )}
        </div>

        <aside className="space-y-5">
          <InfoCard title="Proyectos activos">
            <p className="text-3xl font-black text-[#1a1a1a]">{projects.length}</p>
            <p className="mt-1 text-sm text-[#5f6661]">publicados en AcordeHub</p>
          </InfoCard>

          <InfoCard icon={Headphones} title="Demos">
            <div className="space-y-3">
              {projects.filter((project) => project.demoUri).slice(0, 4).map((project) => (
                <a
                  key={project.id}
                  href={project.demoUri}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] p-3 lg:rounded-md"
                >
                  <p className="font-black text-[#1a1a1a]">{project.title}</p>
                  <p className="text-xs text-[#5f6661]">{project.genre}</p>
                </a>
              ))}
              {projects.filter((project) => project.demoUri).length === 0 && (
                <p className="text-sm text-[#5f6661]">Sin demos publicadas.</p>
              )}
            </div>
          </InfoCard>
        </aside>
      </section>
    </main>
  )
}

function InfoCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: typeof Music2 }) {
  return (
    <Card className="surface-panel rounded-[28px] lg:rounded-lg">
      <CardContent className="p-5 lg:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-black text-[#1a1a1a]">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  )
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-[#5f6661]">Sin datos definidos.</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} className="rounded-full bg-[#eef2f0] text-[#1a1a1a] hover:bg-[#eef2f0] lg:rounded-md">
          {item}
        </Badge>
      ))}
    </div>
  )
}

function Detail({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  if (!value) return null
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a918c]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[#5f6661]">{value}</p>
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
