"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { Calendar, Eye, ImageIcon, Mic2, Plus, Upload } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ProjectDetailDialog } from "@/components/project-detail-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db, storage } from "@/lib/firebase"
import type { Project, UserProfile } from "@/lib/acordehub-types"
import { createProject } from "@/lib/api"

export function ProjectsPage() {
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [cover, setCover] = useState<File | null>(null)
  const [demo, setDemo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [requestedProjects, setRequestedProjects] = useState<Set<string>>(new Set())
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (!user) return

    return onSnapshot(
      query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(100)),
      (snapshot) => {
        setProjects(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }) as Project)
            .filter((project) => !project.status || project.status === "active")
        )
      },
      (err) => setMessage(err.message)
    )
  }, [user])

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, "projects"), limit(100))).then(async (snapshot) => {
      const checks = await Promise.all(snapshot.docs.map(async (project) => {
        const request = await getDoc(doc(db, "projects", project.id, "joinRequests", user.uid))
        return request.exists() ? project.id : ""
      }))
      setRequestedProjects(new Set(checks.filter(Boolean)))
    }).catch(() => undefined)
  }, [user])

  const myProjects = useMemo(() => {
    if (!user) return []
    return projects.filter((project) => project.ownerUid === user.uid)
  }, [projects, user])

  const publishProject = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    setMessage("")
    if (!title.trim() || !description.trim() || !genre.trim()) {
      setMessage("Completa titulo, descripcion y genero.")
      return
    }
    if (!demo) {
      setMessage("Subi una demo MP3 o WAV para publicar.")
      return
    }
    if (!isSupportedAudio(demo)) {
      setMessage("La demo debe ser MP3 o WAV.")
      return
    }

    setSaving(true)
    try {
      const projectId = doc(collection(db, "projects")).id
      const imageUrl = cover ? await uploadProjectFile(user.uid, projectId, "cover", cover) : ""
      const demoUrl = await uploadProjectFile(user.uid, projectId, "demo", demo)
      await createProject({
        projectId,
        title: title.trim(),
        description: description.trim(),
        genre: genre.trim(),
        imageUrl,
        demoUrl,
      })

      setTitle("")
      setDescription("")
      setGenre("")
      setCover(null)
      setDemo(null)
      setShowForm(false)
      setMessage("Proyecto publicado")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo publicar")
    } finally {
      setSaving(false)
    }
  }

  const requestToJoin = async (project: Project) => {
    if (!user || project.ownerUid === user.uid || requestedProjects.has(project.id)) return
    setMessage("")
    try {
      const profileSnapshot = await getDoc(doc(db, "users", user.uid))
      const profile = profileSnapshot.data() as UserProfile | undefined
      await setDoc(doc(db, "projects", project.id, "joinRequests", user.uid), {
        projectId: project.id, projectTitle: project.title, ownerUid: project.ownerUid,
        requesterUid: user.uid, requesterName: profile?.name || user.displayName || "Usuario",
        requesterEmail: profile?.email || user.email || "", status: "pending", createdAt: serverTimestamp(),
      })
      setRequestedProjects((current) => new Set(current).add(project.id))
      setMessage("Solicitud enviada al creador del proyecto")
    } catch (err) { setMessage(err instanceof Error ? err.message : "No se pudo enviar la solicitud") }
  }

  if (loading) {
    return <main className="app-container text-[#1a1a1a]">Cargando...</main>
  }

  if (!user) {
    return <main className="app-container text-center text-[#1a1a1a]">Inicia sesion para ver y publicar proyectos.</main>
  }

  return (
    <main className="app-container">
      <section className="surface-panel rounded-[32px] p-5 sm:p-7 lg:rounded-lg lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Proyectos</p>
            <h1 className="mt-2 text-3xl font-black text-[#1a1a1a] sm:text-4xl lg:text-[42px]">Publica y encuentra colaboraciones</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6661]">
              Sube demos, muestra ideas en progreso y deja que otros musicos descubran donde pueden sumarse.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((value) => !value)}
            className="h-12 rounded-2xl bg-[#1a1a1a] px-5 font-bold text-white lg:rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cerrar" : "Crear proyecto"}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:max-w-3xl lg:gap-4">
          <Metric label="Mis proyectos" value={myProjects.length.toString()} />
          <Metric label="Publicados" value={projects.length.toString()} />
          <Metric label="Con demo" value={projects.filter((project) => project.demoUri).length.toString()} />
        </div>
      </section>

      {message && (
        <p className="mt-4 rounded-2xl border border-[#dfe4dd] bg-white px-4 py-3 text-sm font-bold text-[#5f6661] lg:rounded-lg">
          {message}
        </p>
      )}

      {showForm && (
        <section className="surface-panel mt-5 rounded-[28px] p-5 sm:p-6 lg:rounded-lg lg:p-6">
          <form onSubmit={publishProject} className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titulo del proyecto"
                maxLength={120}
                className="h-12 rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] text-[#1a1a1a] lg:rounded-md"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripcion del sonido, integrantes buscados o estado de la idea"
                maxLength={2000}
                className="min-h-32 rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] text-[#1a1a1a] lg:rounded-md"
              />
              <Input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Genero"
                maxLength={80}
                className="h-12 rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] text-[#1a1a1a] lg:rounded-md"
              />
            </div>

            <div className="space-y-3">
              <FileField
                icon={ImageIcon}
                label="Portada opcional"
                helper={cover?.name || "Imagen para identificar el proyecto"}
                accept="image/*"
                onChange={setCover}
              />
              <FileField
                icon={Mic2}
                label="Demo MP3/WAV"
                helper={demo?.name || "Archivo requerido para publicar"}
                accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
                onChange={setDemo}
                required
              />
              <Button disabled={saving} className="h-12 w-full rounded-2xl bg-[#1a1a1a] font-bold text-white lg:rounded-md">
                {saving ? "Publicando..." : "Publicar proyecto"}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {projects.map((project) => (
          <Card key={project.id} className="surface-panel group relative overflow-hidden rounded-[28px] transition-transform hover:-translate-y-1 lg:rounded-lg">
            <button
              type="button"
              className="absolute inset-0 z-0 cursor-pointer rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 lg:rounded-lg"
              onClick={() => setSelectedProject(project)}
              aria-label={`Ver proyecto ${project.title}`}
            />
            <CardContent className="p-0">
              {project.imageUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.imageUri} alt={project.title} className="h-44 w-full object-cover lg:h-36" />
              ) : (
                <div className="flex h-44 items-center justify-center bg-[#eef2f0] text-[#8a918c] lg:h-36">
                  <FolderArtwork />
                </div>
              )}

              <div className="p-5 lg:p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-1 font-black text-[#1a1a1a]">{project.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5f6661]">{project.description}</p>
                  </div>
                  <Badge className="rounded-full bg-[#e6f4f1] text-[#0f766e] hover:bg-[#e6f4f1]">
                    Activo
                  </Badge>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full border-[#dfe4dd] bg-white">
                    {project.genre}
                  </Badge>
                  {project.demoUri && (
                    <Badge className="rounded-full bg-[#e8eefc] text-[#2563eb] hover:bg-[#e8eefc]">
                      Demo
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#dfe4dd] pt-4">
                  <Link href={`/profile/${project.ownerUid}`} className="relative z-10 flex min-w-0 items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#fff3cf] text-xs font-black text-[#c47a00]">
                        {getInitials(project.ownerName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-bold text-[#5f6661]">{project.ownerName || "Usuario"}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#8a918c]">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
                {project.ownerUid !== user.uid && (
                  <Button type="button" variant="outline" disabled={requestedProjects.has(project.id)} onClick={() => requestToJoin(project)} className="relative z-10 mt-4 w-full rounded-xl border-[#dfe4dd]">
                    {requestedProjects.has(project.id) ? "Solicitud enviada" : "Quiero sumarme"}
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#343734] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                >
                  <Eye className="h-4 w-4" />
                  Ver proyecto
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {projects.length === 0 && (
        <div className="soft-panel mt-6 rounded-[28px] p-8 text-center text-sm font-medium text-[#5f6661] lg:rounded-lg">
          Todavia no hay proyectos publicados.
        </div>
      )}

      <ProjectDetailDialog
        project={selectedProject}
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null)
        }}
        canJoin={Boolean(selectedProject && selectedProject.ownerUid !== user.uid)}
        requestSent={Boolean(selectedProject && requestedProjects.has(selectedProject.id))}
        onRequestToJoin={() => {
          if (selectedProject) void requestToJoin(selectedProject)
        }}
      />
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] p-4 lg:rounded-lg">
      <p className="text-2xl font-black text-[#1a1a1a]">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#5f6661]">{label}</p>
    </div>
  )
}

function FileField({
  icon: Icon,
  label,
  helper,
  accept,
  onChange,
  required,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  helper: string
  accept: string
  onChange: (file: File | null) => void
  required?: boolean
}) {
  return (
    <label className="block rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] p-4 lg:rounded-lg">
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1a1a1a] lg:rounded-md">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-[#1a1a1a]">{label}</span>
          <span className="block truncate text-xs text-[#5f6661]">{helper}</span>
        </span>
        <Upload className="ml-auto h-4 w-4 text-[#8a918c]" />
      </span>
      <Input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="sr-only"
        required={required}
      />
    </label>
  )
}

async function uploadProjectFile(uid: string, projectId: string, kind: "cover" | "demo", file: File) {
  const extension = getFileExtension(file, kind)
  const contentType = getContentType(file, kind)
  const fileRef = ref(storage, `project_uploads/${uid}/${projectId}/${kind}.${extension}`)
  await uploadBytes(fileRef, file, { contentType })
  return getDownloadURL(fileRef)
}

function getContentType(file: File, kind: "cover" | "demo") {
  if (file.type) return file.type
  if (kind === "cover") return "image/jpeg"
  return file.name.toLowerCase().endsWith(".wav") ? "audio/wav" : "audio/mpeg"
}

function getFileExtension(file: File, kind: "cover" | "demo") {
  const name = file.name.toLowerCase()
  if (name.endsWith(".wav")) return "wav"
  if (name.endsWith(".mp3")) return "mp3"
  if (kind === "cover") return "jpg"
  return "mp3"
}

function isSupportedAudio(file: File) {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return (
    type === "audio/mpeg" ||
    type === "audio/mp3" ||
    type === "audio/wav" ||
    type === "audio/x-wav" ||
    type === "audio/wave" ||
    name.endsWith(".mp3") ||
    name.endsWith(".wav")
  )
}

function formatDate(timestamp?: Project["createdAt"]) {
  if (!timestamp?.toDate) return "Nuevo"
  return timestamp.toDate().toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

function getInitials(name?: string | null) {
  const source = name || "Usuario"
  return source
    .split(/[ @.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U"
}

function FolderArtwork() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white lg:rounded-lg">
      <Mic2 className="h-7 w-7" />
    </div>
  )
}
