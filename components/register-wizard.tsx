"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, MapPin, Music2, Search, Sparkles, Trash2, UserRound } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { auth, db } from "@/lib/firebase"
import { createPaymentPreference, searchSpotifyArtists, type SpotifyArtist } from "@/lib/api"
import { defaultProfile, plans, type FavoriteArtist } from "@/lib/acordehub-types"

const genres = ["Rock", "Pop", "Jazz", "Blues", "Electronica", "Folk", "Metal", "Funk", "Reggae", "Hip hop"]
const instruments = ["Guitarra", "Bajo", "Bateria", "Teclado", "Piano", "Voz", "Saxofon", "Violin", "Produccion"]
const steps = ["Tus datos", "Perfil musical", "Tus artistas", "Elegir plan"]

type RegistrationData = {
  firstName: string
  lastName: string
  email: string
  birthDate: string
  location: string
  password: string
  confirmPassword: string
  accountType: "musician" | "producer"
  role: string
  genres: string[]
  instruments: string[]
  level: string
  favoriteArtists: FavoriteArtist[]
}

const initialData: RegistrationData = {
  firstName: "", lastName: "", email: "", birthDate: "", location: "", password: "", confirmPassword: "",
  accountType: "musician", role: "", genres: [], instruments: [], level: "", favoriteArtists: [],
}

export function RegisterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialData)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim()

  const nextFromPersonal = () => {
    setError("")
    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim() || !data.birthDate || !data.location.trim()) {
      setError("Completa todos tus datos personales.")
      return
    }
    if (data.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.")
      return
    }
    if (data.password !== data.confirmPassword) {
      setError("Las contrasenas no coinciden.")
      return
    }
    setStep(1)
  }

  const createAccount = async () => {
    setError("")
    if (!data.role.trim() || data.genres.length === 0 || (data.accountType === "musician" && data.instruments.length === 0)) {
      setError("Completa tu rol y selecciona al menos un genero e instrumento.")
      return
    }
    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password)
      await updateProfile(credential.user, { displayName: fullName })
      await setDoc(doc(db, "users", credential.user.uid), {
        ...defaultProfile(credential.user.uid, credential.user.email ?? data.email, fullName),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        birthDate: data.birthDate,
        location: data.location.trim(),
        accountType: data.accountType,
        role: data.role.trim(),
        genres: data.genres,
        instruments: data.accountType === "producer" ? [] : data.instruments,
        level: data.level,
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
      })
      setStep(2)
    } catch (accountError) {
      setError(readableAuthError(accountError))
    } finally {
      setLoading(false)
    }
  }

  const saveArtists = async () => {
    if (!auth.currentUser) return
    setLoading(true)
    setError("")
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), { favoriteArtists: data.favoriteArtists }, { merge: true })
      setStep(3)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No pudimos guardar tus artistas")
    } finally {
      setLoading(false)
    }
  }

  const finish = async (planId: string) => {
    if (!auth.currentUser) return
    setLoading(true)
    setError("")
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        onboardingCompleted: true,
        onboardingCompletedAt: serverTimestamp(),
      }, { merge: true })
      if (planId === "free") {
        router.push("/")
        return
      }
      const result = await createPaymentPreference(planId, `${window.location.origin}/plans?status=approved`)
      const checkoutUrl = result.checkoutUrl || result.sandboxCheckoutUrl
      if (!checkoutUrl) throw new Error("No pudimos iniciar el pago")
      window.location.href = checkoutUrl
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : "No pudimos finalizar el registro")
      setLoading(false)
    }
  }

  return (
    <main className="acorde-gradient min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-stretch gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="hidden flex-col justify-between rounded-[32px] bg-[#1a1a1a] p-8 text-white shadow-[0_24px_80px_rgba(26,26,26,0.28)] lg:flex">
          <div>
            <span className="relative block h-16 w-56 overflow-hidden rounded-2xl bg-white">
              <Image src="/acordehub.png" alt="AcordeHub" fill priority sizes="224px" className="object-cover object-[center_69%]" />
            </span>
            <p className="mt-16 text-xs font-black uppercase tracking-[0.18em] text-[#f7c948]">Tu perfil musical</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">Empeza a conectar con personas que escuchan y crean como vos.</h1>
            <p className="mt-4 leading-7 text-white/65">En pocos pasos armamos un perfil que represente tu identidad musical.</p>
          </div>
          <div className="space-y-3">
            {steps.map((label, index) => (
              <div key={label} className={`flex items-center gap-3 rounded-2xl p-3 ${index === step ? "bg-white/10" : ""}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${index <= step ? "bg-[#f5a623] text-[#1a1a1a]" : "bg-white/10 text-white/50"}`}>
                  {index < step ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className={index <= step ? "font-bold" : "text-white/45"}>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex items-center">
          <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_24px_70px_rgba(26,26,26,0.16)] backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c47a00]">Paso {step + 1} de {steps.length}</p>
                <h2 className="mt-2 text-3xl font-black text-[#1a1a1a]">{steps[step]}</h2>
              </div>
              <div className="flex gap-1.5 lg:hidden">{steps.map((_, index) => <span key={index} className={`h-2 rounded-full ${index === step ? "w-8 bg-[#f5a623]" : "w-2 bg-[#dfe4dd]"}`} />)}</div>
            </div>

            {step === 0 && <PersonalStep data={data} setData={setData} showPassword={showPassword} setShowPassword={setShowPassword} />}
            {step === 1 && <MusicStep data={data} setData={setData} />}
            {step === 2 && <ArtistsStep selected={data.favoriteArtists} onChange={(favoriteArtists) => setData((current) => ({ ...current, favoriteArtists }))} />}
            {step === 3 && <PlanStep onChoose={finish} loading={loading} />}

            {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

            {step < 3 && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#dfe4dd] pt-5">
                {step === 0 ? <Link href="/login" className="text-sm font-bold text-[#5f6661] hover:underline">Ya tengo cuenta</Link> : (
                  <Button type="button" variant="ghost" disabled={loading || step === 2} onClick={() => setStep((current) => current - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Atras</Button>
                )}
                <Button type="button" disabled={loading} onClick={step === 0 ? nextFromPersonal : step === 1 ? createAccount : saveArtists} className="h-12 rounded-2xl bg-[#1a1a1a] px-6 font-bold text-white">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === 1 ? "Crear cuenta y continuar" : step === 2 ? "Continuar" : "Siguiente"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function PersonalStep({ data, setData, showPassword, setShowPassword }: { data: RegistrationData; setData: React.Dispatch<React.SetStateAction<RegistrationData>>; showPassword: boolean; setShowPassword: (value: boolean) => void }) {
  const field = (key: keyof RegistrationData, value: string) => setData((current) => ({ ...current, [key]: value }))
  return <div className="grid gap-5 sm:grid-cols-2">
    <LabelInput label="Nombre" value={data.firstName} onChange={(value) => field("firstName", value)} placeholder="Tu nombre" icon={UserRound} />
    <LabelInput label="Apellido" value={data.lastName} onChange={(value) => field("lastName", value)} placeholder="Tu apellido" />
    <LabelInput label="Email" type="email" value={data.email} onChange={(value) => field("email", value)} placeholder="tu@email.com" />
    <LabelInput label="Fecha de nacimiento" type="date" value={data.birthDate} onChange={(value) => field("birthDate", value)} />
    <div className="sm:col-span-2"><LabelInput label="Ubicacion" value={data.location} onChange={(value) => field("location", value)} placeholder="Ciudad, provincia" icon={MapPin} /></div>
    <PasswordInput label="Contrasena" value={data.password} onChange={(value) => field("password", value)} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
    <PasswordInput label="Repetir contrasena" value={data.confirmPassword} onChange={(value) => field("confirmPassword", value)} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
  </div>
}

function MusicStep({ data, setData }: { data: RegistrationData; setData: React.Dispatch<React.SetStateAction<RegistrationData>> }) {
  const toggle = (key: "genres" | "instruments", value: string) => setData((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))
  return <div className="space-y-6">
    <div><p className="mb-3 text-sm font-black text-[#1a1a1a]">¿Como participas en la musica?</p><div className="flex gap-2">{[["musician", "Musico"], ["producer", "Productor"]].map(([value, label]) => <button key={value} type="button" onClick={() => setData((current) => ({ ...current, accountType: value as RegistrationData["accountType"] }))} className={`rounded-full px-4 py-2 text-sm font-bold ${data.accountType === value ? "bg-[#f5a623] text-[#1a1a1a]" : "bg-[#eef2f0] text-[#5f6661]"}`}>{label}</button>)}</div></div>
    <LabelInput label={data.accountType === "producer" ? "Especialidad" : "Rol musical"} value={data.role} onChange={(role) => setData((current) => ({ ...current, role }))} placeholder={data.accountType === "producer" ? "Mezcla, beatmaker, mastering..." : "Guitarrista, cantante, baterista..."} />
    <ChoiceGroup title="Generos que te representan" items={genres} selected={data.genres} onToggle={(value) => toggle("genres", value)} />
    {data.accountType === "musician" && <ChoiceGroup title="Instrumentos" items={instruments} selected={data.instruments} onToggle={(value) => toggle("instruments", value)} />}
    <div><p className="mb-3 text-sm font-black text-[#1a1a1a]">Nivel de experiencia</p><select value={data.level} onChange={(event) => setData((current) => ({ ...current, level: event.target.value }))} className="h-12 w-full rounded-2xl border border-[#dfe4dd] bg-[#fbfcf8] px-4 text-sm"><option value="">Seleccionar nivel</option>{["Principiante", "Intermedio", "Avanzado", "Profesional"].map((level) => <option key={level}>{level}</option>)}</select></div>
  </div>
}

function ArtistsStep({ selected, onChange }: { selected: FavoriteArtist[]; onChange: (artists: FavoriteArtist[]) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotifyArtist[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState("")
  const search = async (event: React.FormEvent) => { event.preventDefault(); if (query.trim().length < 2) return; setSearching(true); setMessage(""); try { const response = await searchSpotifyArtists(query.trim()); setResults(response.artists); if (!response.artists.length) setMessage("No encontramos resultados.") } catch { setMessage("No pudimos buscar en Spotify.") } finally { setSearching(false) } }
  return <div className="space-y-5">
    <p className="text-sm leading-6 text-[#5f6661]">Elegí algunos artistas para mejorar tus recomendaciones y conexiones. También podés continuar sin agregar ninguno.</p>
    {selected.length > 0 && <div className="flex flex-wrap gap-2">{selected.map((artist) => <Badge key={artist.id} className="gap-2 rounded-full bg-[#1a1a1a] py-1.5 pl-2 pr-1 text-white"><ArtistAvatar artist={artist} />{artist.name}<button type="button" onClick={() => onChange(selected.filter((item) => item.id !== artist.id))} className="rounded-full p-1 hover:bg-white/15"><Trash2 className="h-3 w-3" /></button></Badge>)}</div>}
    <form onSubmit={search} className="flex gap-2"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar artista en Spotify" className="h-12 rounded-2xl border-[#dfe4dd] bg-[#fbfcf8]" /><Button disabled={searching} className="h-12 rounded-2xl bg-[#1ed760] text-black hover:bg-[#1fdf64]">{searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</Button></form>
    {message && <p className="text-sm text-[#c47a00]">{message}</p>}
    <div className="grid gap-3 sm:grid-cols-2">{results.map((artist) => { const added = selected.some((item) => item.id === artist.id); return <button key={artist.id} type="button" disabled={added} onClick={() => onChange([...selected, artist])} className="flex items-center gap-3 rounded-2xl border border-[#dfe4dd] bg-white p-3 text-left disabled:opacity-50"><ArtistAvatar artist={artist} large /><span className="min-w-0 flex-1 truncate font-bold text-[#1a1a1a]">{artist.name}</span><span className="text-xs font-bold text-[#5f6661]">{added ? "Agregado" : "Agregar"}</span></button> })}</div>
    <p className="text-xs text-[#8a918c]">Resultados provistos por Spotify.</p>
  </div>
}

function PlanStep({ onChoose, loading }: { onChoose: (planId: string) => void; loading: boolean }) {
  return <div><div className="mb-6 rounded-2xl bg-[#e6f4f1] p-4"><p className="font-black text-[#0f766e]">¡Tu cuenta ya esta lista!</p><p className="mt-1 text-sm text-[#5f6661]">Podes empezar gratis o mejorar tu plan ahora. Siempre vas a poder cambiarlo después.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{plans.map((plan) => <Card key={plan.id} className={`rounded-2xl ${plan.id === "plus" ? "border-[#f5a623] ring-1 ring-[#f5a623]" : "border-[#dfe4dd]"}`}><CardContent className="flex h-full flex-col p-4"><div className="flex items-center justify-between"><Music2 className="h-5 w-5" />{plan.id === "plus" && <Badge className="bg-[#fff3cf] text-[#c47a00]">Popular</Badge>}</div><h3 className="mt-4 text-xl font-black">{plan.name}</h3><p className="mt-1 font-black text-[#c47a00]">{plan.price} / mes</p><p className="mt-3 text-xs leading-5 text-[#5f6661]">{plan.description}</p><ul className="my-4 space-y-2">{plan.features.slice(0, 3).map((feature) => <li key={feature} className="flex gap-2 text-xs text-[#5f6661]"><Check className="h-3.5 w-3.5 shrink-0 text-[#0f766e]" />{feature}</li>)}</ul><Button disabled={loading} onClick={() => onChoose(plan.id)} variant={plan.id === "free" ? "outline" : "default"} className="mt-auto rounded-xl">{plan.id === "free" ? "Seguir con Free" : "Elegir plan"}</Button></CardContent></Card>)}</div></div>
}

function LabelInput({ label, value, onChange, placeholder, type = "text", icon: Icon }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; icon?: typeof UserRound }) { return <label className="block"><span className="mb-2 block text-sm font-black text-[#1a1a1a]">{label}</span><div className="relative">{Icon && <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a918c]" />}<Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} max={type === "date" ? new Date().toISOString().split("T")[0] : undefined} className={`h-12 rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] ${Icon ? "pl-11" : ""}`} /></div></label> }
function PasswordInput({ label, value, onChange, visible, onToggle }: { label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void }) { return <label className="block"><span className="mb-2 block text-sm font-black text-[#1a1a1a]">{label}</span><div className="relative"><Input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] pr-11" /><button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6661]">{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label> }
function ChoiceGroup({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void }) { return <div><p className="mb-3 text-sm font-black text-[#1a1a1a]">{title}</p><div className="flex flex-wrap gap-2">{items.map((item) => <button key={item} type="button" onClick={() => onToggle(item)} className={`rounded-full px-3 py-2 text-xs font-bold ${selected.includes(item) ? "bg-[#f5a623] text-[#1a1a1a]" : "bg-[#eef2f0] text-[#5f6661]"}`}>{item}</button>)}</div></div> }
function ArtistAvatar({ artist, large }: { artist: FavoriteArtist; large?: boolean }) { const size = large ? "h-12 w-12" : "h-6 w-6"; return artist.imageUrl ? <img src={artist.imageUrl} alt="" className={`${size} shrink-0 rounded-full object-cover`} /> : <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-[#eef2f0]`}><Sparkles className="h-4 w-4" /></span> }
function readableAuthError(error: unknown) { const message = error instanceof Error ? error.message : ""; if (message.includes("email-already-in-use")) return "Ese email ya tiene una cuenta."; if (message.includes("invalid-email")) return "El email no es valido."; if (message.includes("weak-password")) return "La contrasena es demasiado debil."; return "No pudimos crear la cuenta. Intenta nuevamente." }
