"use client"

import { useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { Calendar, Headphones, Plus, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db, storage } from "@/lib/firebase"
import type { Project, UserProfile } from "@/lib/acordehub-types"

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
      const userSnapshot = await getDoc(doc(db, "users", user.uid))
      const profile = userSnapshot.exists() ? (userSnapshot.data() as UserProfile) : null
      const ownerName = profile?.name || user.displayName || user.email || "Usuario"
      const projectRef = await addDoc(collection(db, "projects"), {
        ownerUid: user.uid,
        ownerName,
        title: title.trim(),
        description: description.trim(),
        genre: genre.trim(),
        imageUri: "",
        demoUri: "",
        status: "active",
        createdAt: serverTimestamp(),
      })

      const imageUri = cover ? await uploadProjectFile(user.uid, projectRef.id, "cover", cover) : ""
      const demoUri = await uploadProjectFile(user.uid, projectRef.id, "demo", demo)

      await addDoc(collection(db, "projects", projectRef.id, "activity"), {
        type: "created",
        createdAt: serverTimestamp(),
      }).catch(() => undefined)

      await updateDoc(projectRef, {
        imageUri,
        demoUri,
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

  if (loading) {
    return <main className="mobile-shell px-5 py-10 text-[#1a1a1a]">Cargando...</main>
  }

  if (!user) {
    return (
      <main className="mobile-shell px-5 py-10 text-center text-[#1a1a1a]">
        Inicia sesion para ver y publicar proyectos.
      </main>
    )
  }

  return (
    <main className="mobile-shell px-5 pb-28 pt-6 md:max-w-7xl md:px-8 md:pb-12">
      <section className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] md:text-4xl">Proyectos</h1>
          <p className="mt-1 text-sm text-[#2c2c2c]">Publica demos y encuentra colaboradores</p>
        </div>
        <Button
          onClick={() => setShowForm((value) => !value)}
          className="h-11 rounded-2xl bg-[#1a1a1a] px-4 text-white hover:bg-[#2c2c2c]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear
        </Button>
      </section>

      {message && (
        <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#2c2c2c]">
          {message}
        </p>
      )}

      {showForm && (
        <Card className="mb-6 rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-4">
            <form onSubmit={publishProject} className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titulo del proyecto"
                maxLength={120}
                className="h-12 rounded-xl border-[#ead8aa] text-[#1a1a1a]"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripcion"
                maxLength={2000}
                className="min-h-28 rounded-xl border-[#ead8aa] text-[#1a1a1a]"
              />
              <Input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Genero"
                maxLength={80}
                className="h-12 rounded-xl border-[#ead8aa] text-[#1a1a1a]"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <label className="rounded-xl border border-[#ead8aa] bg-[#fff8e7] p-3 text-sm text-[#2c2c2c]">
                  Portada opcional
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                    className="mt-2 bg-white"
                  />
                </label>
                <label className="rounded-xl border border-[#ead8aa] bg-[#fff8e7] p-3 text-sm text-[#2c2c2c]">
                  Demo MP3/WAV
                  <Input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
                    onChange={(e) => setDemo(e.target.files?.[0] ?? null)}
                    className="mt-2 bg-white"
                    required
                  />
                </label>
              </div>
              <Button disabled={saving} className="h-12 w-full rounded-xl bg-[#1a1a1a] text-white">
                {saving ? "Publicando..." : "Publicar proyecto"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="mb-6 grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#2c2c2c]">Mis proyectos</p>
            <p className="mt-1 text-base font-bold text-[#1a1a1a]">{myProjects.length} Activos</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#2c2c2c]">Publicados</p>
            <p className="mt-1 text-base font-bold text-[#1a1a1a]">{projects.length} Totales</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
            <CardContent className="p-4">
              {project.imageUri && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.imageUri}
                  alt={project.title}
                  className="mb-4 h-40 w-full rounded-xl object-cover"
                />
              )}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[#1a1a1a]">{project.title}</h2>
                  <p className="mt-1 text-sm text-[#666666]">{project.description}</p>
                </div>
                <Badge className="rounded-full bg-[#fff1c8] text-[#1a1a1a] hover:bg-[#fff1c8]">
                  {project.status || "active"}
                </Badge>
              </div>

              <div className="mb-4 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="rounded-full border-[#fad080] text-[#2c2c2c]">
                  {project.genre}
                </Badge>
                {project.demoUri && (
                  <Badge variant="outline" className="rounded-full border-[#fad080] text-[#2c2c2c]">
                    Con demo
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[#eeeeee] pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#666666]" />
                  <Avatar className="h-7 w-7 border-2 border-white">
                    <AvatarFallback className="bg-[#fff1c8] text-[10px] text-[#1a1a1a]">
                      {getInitials(project.ownerName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-[#666666]">{project.ownerName || "Usuario"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {project.demoUri && (
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                      <a href={project.demoUri} target="_blank" rel="noreferrer" aria-label="Escuchar demo">
                        <Headphones className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <div className="flex items-center gap-1 text-xs text-[#666666]">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(project.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="rounded-2xl border-[#eeeeee] bg-white shadow-none">
          <CardContent className="p-6 text-center text-sm text-[#666666]">
            Todavia no hay proyectos publicados.
          </CardContent>
        </Card>
      )}
    </main>
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
