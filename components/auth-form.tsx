"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { Eye, EyeOff, Music2, ShieldCheck, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { auth, db } from "@/lib/firebase"
import { defaultProfile } from "@/lib/acordehub-types"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isLogin = mode === "login"

  const saveInitialUser = async (uid: string, email: string | null, name: string | null) => {
    const userRef = doc(db, "users", uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) return

    await setDoc(userRef, {
      ...defaultProfile(uid, email ?? "", name?.trim() || "Usuario"),
      createdAt: serverTimestamp(),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password)
      } else {
        const credential = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        )
        await saveInitialUser(credential.user.uid, credential.user.email, formData.name)
      }
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const credential = await signInWithPopup(auth, provider)
      await saveInitialUser(
        credential.user.uid,
        credential.user.email,
        credential.user.displayName
      )
      router.push("/")
    } catch (err) {
      setError(readableGoogleError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="acorde-gradient min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden min-h-[680px] flex-col justify-between rounded-[32px] bg-[#1a1a1a] p-8 text-white shadow-[0_24px_80px_rgba(26,26,26,0.28)] lg:flex">
          <div>
            <div>
              <span className="relative block h-16 w-56 overflow-hidden rounded-2xl bg-white">
                <Image
                  src="/acordehub.png"
                  alt="AcordeHub"
                  fill
                  priority
                  sizes="224px"
                  className="object-cover object-[center_69%]"
                />
              </span>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">Creative network</p>
            </div>

            <div className="mt-20 max-w-lg">
              <p className="eyebrow text-[#f7c948]">Musica colaborativa</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.02]">
                Crea, publica demos y conecta con otros musicos.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/68">
                Una experiencia web pensada para seguir el flujo de la app mobile: perfil,
                proyectos, busqueda y colaboracion desde el mismo Firebase.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Music2, label: "Demos" },
              { icon: Sparkles, label: "Matches" },
              { icon: ShieldCheck, label: "Firebase" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Icon className="h-5 w-5 text-[#f7c948]" />
                  <p className="mt-3 text-sm font-bold">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_70px_rgba(26,26,26,0.16)] backdrop-blur-xl sm:p-7">
          <div className="mb-8 text-center">
            <span className="relative mx-auto block h-20 w-64 max-w-full overflow-hidden">
              <Image
                src="/acordehub.png"
                alt="AcordeHub"
                fill
                priority
                sizes="256px"
                className="object-cover object-[center_69%]"
              />
            </span>
            <p className="eyebrow mt-4">AcordeHub</p>
            <h1 className="mt-2 text-3xl font-black text-[#1a1a1a]">
              {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#5f6661]">
              {isLogin ? "Entra para continuar tus proyectos." : "Completa tus datos para empezar a colaborar."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            {!isLogin && (
              <Field>
                <FieldLabel htmlFor="name" className="text-[#1a1a1a]">
                  Nombre completo
                </FieldLabel>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-[52px] rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] text-[#1a1a1a] shadow-none placeholder:text-[#8a918c]"
                  required
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="email" className="text-[#1a1a1a]">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="h-[52px] rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] text-[#1a1a1a] shadow-none placeholder:text-[#8a918c]"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="text-[#1a1a1a]">
                Contrasena
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="h-[52px] rounded-2xl border-[#dfe4dd] bg-[#fbfcf8] pr-12 text-[#1a1a1a] shadow-none placeholder:text-[#8a918c]"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] transition-colors hover:text-[#1a1a1a]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </FieldGroup>

          {error && (
            <p className="rounded-xl bg-white/70 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-[52px] w-full rounded-2xl bg-[#1a1a1a] text-base font-bold text-white shadow-[0_12px_28px_rgba(26,26,26,0.18)] hover:bg-[#2c2c2c]"
          >
            {loading ? "Procesando..." : isLogin ? "Iniciar sesion" : "Crear cuenta"}
          </Button>

          {isLogin && (
            <>
              <div className="flex items-center gap-3 py-1 text-sm text-[#2c2c2c]">
                <span className="h-px flex-1 bg-[#2c2c2c]/30" />
                o
                <span className="h-px flex-1 bg-[#2c2c2c]/30" />
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogle}
                className="h-[52px] w-full rounded-2xl border-[#dfe4dd] bg-white font-bold text-[#1a1a1a] hover:bg-[#f5f6f2]"
              >
                Continuar con Google
              </Button>
            </>
          )}
        </form>

          <div className="mt-8 text-center text-sm text-[#5f6661]">
          {isLogin ? (
            <p>
              No tenes cuenta?{" "}
              <Link href="/register" className="font-bold text-[#1a1a1a] hover:underline">
                Registrate
              </Link>
            </p>
          ) : (
            <p>
              Ya tenes cuenta?{" "}
              <Link href="/login" className="font-bold text-[#1a1a1a] hover:underline">
                Inicia sesion
              </Link>
            </p>
          )}
          </div>
        </div>
      </section>
    </main>
  )
}

function readableGoogleError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  if (message.includes("popup-closed-by-user") || message.includes("cancelled-popup-request")) return "Se canceló el acceso con Google."
  if (message.includes("popup-blocked")) return "El navegador bloqueó la ventana de Google. Habilita las ventanas emergentes e intenta nuevamente."
  if (message.includes("operation-not-allowed")) return "El acceso con Google todavía no está habilitado en Firebase."
  if (message.includes("unauthorized-domain")) return "Este dominio todavía no está autorizado para iniciar sesión con Google."
  return "No se pudo continuar con Google. Intenta nuevamente."
}
