"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Calendar,
  Clock3,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import type { Project } from "@/lib/acordehub-types"

const PREVIEW_LIMIT_SECONDS = 50

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  canJoin,
  requestSent,
  onRequestToJoin,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canJoin: boolean
  requestSent: boolean
  onRequestToJoin: () => void
}) {
  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-5xl gap-0 overflow-y-auto border-0 bg-[#f5f6f2] p-0 sm:rounded-[30px] lg:h-[min(840px,calc(100dvh-4rem))] lg:max-h-none lg:max-w-[min(1180px,calc(100vw-4rem))] lg:overflow-hidden">
        <DialogTitle className="sr-only">{project.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Información y demo del proyecto musical {project.title}.
        </DialogDescription>

        <div className="grid lg:h-full lg:grid-cols-[minmax(440px,0.95fr)_minmax(500px,1.05fr)]">
          <div className="relative min-h-72 overflow-hidden bg-[#252724] lg:min-h-0">
            {project.imageUri ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUri}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-65 blur-2xl"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUri}
                  alt={`Portada de ${project.title}`}
                  className="absolute inset-0 h-full w-full object-cover lg:inset-x-10 lg:top-10 lg:bottom-auto lg:h-[calc(100%-250px)] lg:w-[calc(100%-5rem)] lg:rounded-[24px] lg:object-contain lg:shadow-[0_24px_70px_rgba(0,0,0,0.38)]"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#f5a623_0%,#504329_28%,#20231f_72%)]">
                <div className="flex h-32 w-32 items-center justify-center rounded-[40px] border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur">
                  <Headphones className="h-14 w-14" />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25 lg:from-black/90 lg:via-black/15" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-0 bg-[#f5a623] font-bold text-[#1a1a1a] hover:bg-[#f5a623]">
                  {project.genre}
                </Badge>
                {project.demoUri && (
                  <Badge className="border border-white/25 bg-black/30 text-white hover:bg-black/30">
                    Demo de 50 segundos
                  </Badge>
                )}
              </div>
              <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.05]">{project.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/75">
                <Calendar className="h-4 w-4" />
                Publicado {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-col bg-white p-6 sm:p-8 lg:overflow-y-auto lg:p-10 xl:p-12">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Sobre la canción</p>
              <Badge variant="outline" className="hidden rounded-full border-[#dfe4dd] px-3 py-1 text-[#5f6661] lg:inline-flex">
                Proyecto activo
              </Badge>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-[#5f6661] lg:text-base lg:leading-8">
              {project.description}
            </p>

            <Link
              href={`/profile/${project.ownerUid}`}
              className="mt-7 flex items-center gap-3 rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] p-4 transition-colors hover:bg-[#eef2f0] focus:outline-none focus:ring-2 focus:ring-[#f5a623] lg:p-5"
            >
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-[#fff3cf] font-black text-[#c47a00]">
                  {getInitials(project.ownerName)}
                </AvatarFallback>
              </Avatar>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#8a918c]">Creado por</span>
                <span className="mt-0.5 block font-black text-[#1a1a1a]">{project.ownerName || "Usuario"}</span>
              </span>
            </Link>

            <div className="mt-8">
              {project.demoUri ? (
                <DemoPlayer key={project.id} src={project.demoUri} title={project.title} />
              ) : (
                <div className="rounded-[24px] bg-[#1f211f] p-6 text-white">
                  <Headphones className="h-7 w-7 text-[#f5a623]" />
                  <p className="mt-4 font-black">Este proyecto todavía no tiene demo</p>
                  <p className="mt-1 text-sm leading-6 text-white/60">Puedes leer la idea y contactar con su creador.</p>
                </div>
              )}
            </div>

            {canJoin && (
              <Button
                type="button"
                disabled={requestSent}
                onClick={onRequestToJoin}
                className="mt-6 h-12 w-full rounded-2xl bg-[#f5a623] font-black text-[#1a1a1a] hover:bg-[#e89a18]"
              >
                {requestSent ? "Solicitud enviada" : "Quiero sumarme al proyecto"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DemoPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(PREVIEW_LIMIT_SECONDS)
  const [volume, setVolume] = useState(0.8)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleMetadata = () => {
      setDuration(Math.min(Number.isFinite(audio.duration) ? audio.duration : PREVIEW_LIMIT_SECONDS, PREVIEW_LIMIT_SECONDS))
    }
    const handleTime = () => {
      if (audio.currentTime >= PREVIEW_LIMIT_SECONDS) {
        audio.pause()
        audio.currentTime = PREVIEW_LIMIT_SECONDS
        setPlaying(false)
      }
      setCurrentTime(Math.min(audio.currentTime, PREVIEW_LIMIT_SECONDS))
    }
    const handleEnded = () => setPlaying(false)

    audio.addEventListener("loadedmetadata", handleMetadata)
    audio.addEventListener("timeupdate", handleTime)
    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", handleMetadata)
      audio.removeEventListener("timeupdate", handleTime)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [src])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio || loadError) return
    if (audio.currentTime >= duration - 0.1) {
      audio.currentTime = 0
      setCurrentTime(0)
    }
    if (audio.paused) {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        setLoadError(true)
      }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  const seek = (nextTime: number) => {
    const audio = audioRef.current
    if (!audio) return
    const safeTime = Math.max(0, Math.min(nextTime, duration))
    audio.currentTime = safeTime
    setCurrentTime(safeTime)
  }

  const changeVolume = (nextVolume: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = nextVolume
    setVolume(nextVolume)
  }

  return (
    <div className="rounded-[24px] bg-[#1f211f] p-5 text-white shadow-[0_20px_45px_rgba(26,26,26,0.18)]">
      <audio ref={audioRef} src={src} preload="metadata" onError={() => setLoadError(true)} />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#f5a623]">Escuchar demo</p>
          <p className="mt-1 truncate font-black">{title}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
          <Clock3 className="h-3.5 w-3.5" />
          Máx. 0:50
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button
          type="button"
          size="icon"
          onClick={togglePlayback}
          disabled={loadError}
          aria-label={playing ? "Pausar demo" : "Reproducir demo"}
          className="h-12 w-12 shrink-0 rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-[#e89a18]"
        >
          {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
        </Button>
        <div className="min-w-0 flex-1">
          <Slider
            value={[currentTime]}
            max={Math.max(duration, 1)}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            aria-label="Posición de la demo"
            className="[&_[data-slot=slider-range]]:bg-[#f5a623] [&_[data-slot=slider-thumb]]:border-[#f5a623]"
          />
          <div className="mt-2 flex justify-between text-xs font-semibold tabular-nums text-white/55">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => seek(currentTime - 10)}
          aria-label="Retroceder 10 segundos"
          className="rounded-full text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => seek(currentTime + 10)}
          aria-label="Adelantar 10 segundos"
          className="h-9 rounded-full px-3 text-xs font-black text-white hover:bg-white/10 hover:text-white"
        >
          +10s
        </Button>
        <div className="ml-auto flex w-32 items-center gap-2 sm:w-40">
          {volume === 0 ? <VolumeX className="h-4 w-4 text-white/55" /> : <Volume2 className="h-4 w-4 text-white/55" />}
          <Slider
            value={[volume]}
            max={1}
            step={0.05}
            onValueChange={([value]) => changeVolume(value)}
            aria-label="Volumen"
            className="[&_[data-slot=slider-range]]:bg-white/80 [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-white"
          />
        </div>
      </div>

      {loadError && <p className="mt-4 text-xs font-semibold text-[#ffc766]">No se pudo cargar esta demo.</p>}
    </div>
  )
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function formatDate(timestamp?: Project["createdAt"]) {
  if (!timestamp?.toDate) return "recientemente"
  return timestamp.toDate().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
}

function getInitials(name?: string | null) {
  return (name || "Usuario")
    .split(/[ @.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U"
}
