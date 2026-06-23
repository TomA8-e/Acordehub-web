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
import { Eye, EyeOff } from "lucide-react"
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
      const credential = await signInWithPopup(auth, new GoogleAuthProvider())
      await saveInitialUser(
        credential.user.uid,
        credential.user.email,
        credential.user.displayName
      )
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo continuar con Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="acorde-gradient flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {!isLogin && (
            <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a]">Crear cuenta</h1>
          )}
          <Image
            src="/acordehub.png"
            alt="AcordeHub"
            width={isLogin ? 220 : 148}
            height={isLogin ? 220 : 148}
            priority
            className="object-contain"
          />
          <p className="mb-8 text-sm font-medium text-[#2c2c2c]">
            {isLogin ? "Conecta con musicos" : "Completa tus datos para empezar"}
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
                  className="h-14 rounded-[14px] border-0 bg-white/95 text-[#1a1a1a] shadow-sm placeholder:text-[#666666]"
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
                className="h-14 rounded-[14px] border-0 bg-white/95 text-[#1a1a1a] shadow-sm placeholder:text-[#666666]"
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
                  className="h-14 rounded-[14px] border-0 bg-white/95 pr-12 text-[#1a1a1a] shadow-sm placeholder:text-[#666666]"
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
            className="h-14 w-full rounded-[14px] bg-[#1a1a1a] text-base text-white hover:bg-[#2c2c2c]"
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
                className="h-14 w-full rounded-[14px] border-[#1a1a1a] bg-white text-[#1a1a1a] hover:bg-white/90"
              >
                Continuar con Google
              </Button>
            </>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-[#2c2c2c]">
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
      </section>
    </main>
  )
}
