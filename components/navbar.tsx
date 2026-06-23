"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { Bell, FolderKanban, Home, MessageCircle, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
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
      <header className="sticky top-0 z-40 border-b border-[#ead8aa] bg-[#fff8e7]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/acordehub.png" alt="AcordeHub" width={38} height={38} className="object-contain" />
            <span className="hidden text-xl font-bold text-[#1a1a1a] sm:inline">AcordeHub</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#2c2c2c] hover:bg-[#fff1c8]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-[#1a1a1a]">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-[#1a1a1a]">
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Link href="/profile" aria-label="Perfil">
              <Avatar className="h-10 w-10 border border-[#1a1a1a]">
                <AvatarImage src={user?.photoURL ?? "/placeholder-user.jpg"} alt="Usuario" />
                <AvatarFallback className="bg-[#fff1c8] text-sm text-[#1a1a1a]">
                  {getInitials(user?.displayName, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Link>
            {user ? (
              <Button
                variant="ghost"
                onClick={() => signOut(auth)}
                className="hidden rounded-xl text-[#1a1a1a] md:inline-flex"
              >
                Salir
              </Button>
            ) : (
              <Button asChild className="hidden rounded-xl bg-[#1a1a1a] text-white md:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2a2a2a] bg-[#1a1a1a] px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 text-white md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                  isActive ? "text-[#f7c948]" : "text-white/65"
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
