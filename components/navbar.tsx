"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { Bell, CreditCard, FolderKanban, Home, LogOut, MessageCircle, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/plans", label: "Planes", icon: CreditCard },
  { href: "/profile", label: "Perfil", icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#dfe4dd]/80 bg-[#f5f6f2]/85 backdrop-blur-xl lg:bg-white lg:backdrop-blur-none">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-10 xl:px-12">
          <Link href="/" className="flex items-center rounded-xl py-2 transition-opacity hover:opacity-85">
            <span className="relative h-11 w-36 overflow-hidden sm:w-44">
              <Image
                src="/acordehub.png"
                alt="AcordeHub"
                fill
                priority
                sizes="(min-width: 640px) 176px, 144px"
                className="object-cover object-[center_69%]"
              />
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex lg:h-full lg:border-x lg:border-[#dfe4dd] lg:px-5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors lg:rounded-md",
                    isActive
                      ? "bg-[#1a1a1a] text-white shadow-sm lg:bg-[#eef2f0] lg:text-[#1a1a1a] lg:shadow-none"
                      : "text-[#5f6661] hover:bg-[#eef2f0] hover:text-[#1a1a1a]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden h-10 rounded-xl bg-[#f5a623] px-4 font-black text-[#1a1a1a] hover:bg-[#f7c948] md:inline-flex lg:rounded-md">
              <Link href="/plans">
                <CreditCard className="mr-2 h-4 w-4" />
                Planes
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-[#1a1a1a] hover:bg-white lg:rounded-md lg:hover:bg-[#eef2f0]">
              <Link href="/notifications" aria-label="Notificaciones"><Bell className="h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-[#1a1a1a] hover:bg-white lg:rounded-md lg:hover:bg-[#eef2f0]">
              <Link href="/messages" aria-label="Mensajes"><MessageCircle className="h-5 w-5" /></Link>
            </Button>
            <Link href="/profile" aria-label="Perfil">
              <Avatar className="h-10 w-10 border border-white shadow-sm ring-1 ring-[#dfe4dd]">
                <AvatarImage src={user?.photoURL ?? "/placeholder-user.jpg"} alt="Usuario" />
                <AvatarFallback className="bg-[#f7c948] text-sm font-black text-[#1a1a1a]">
                  {getInitials(user?.displayName, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Link>
            {user ? (
              <Button
                variant="ghost"
                onClick={() => signOut(auth)}
                className="hidden h-10 rounded-xl px-3 text-[#5f6661] hover:bg-white hover:text-[#1a1a1a] md:inline-flex lg:rounded-md lg:hover:bg-[#eef2f0]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            ) : (
              <Button asChild className="hidden h-10 rounded-xl bg-[#1a1a1a] px-5 text-white md:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[24px] border border-white/10 bg-[#1a1a1a]/96 p-1.5 text-white shadow-[0_16px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                  isActive ? "bg-white/10 text-[#f7c948]" : "text-white/60"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
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
