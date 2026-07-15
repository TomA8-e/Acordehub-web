"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
]

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const ActiveIcon = mounted && resolvedTheme === "dark" ? Moon : Sun

  return (
    <div className="fixed bottom-24 right-4 z-[60] md:bottom-6 md:right-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Cambiar tema de la web"
            className="h-12 w-12 rounded-full border-border bg-card text-card-foreground shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-transform hover:scale-105 hover:bg-secondary"
          >
            <ActiveIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-44 rounded-xl border-border bg-popover p-1.5 shadow-xl">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Apariencia
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={mounted ? theme : "light"} onValueChange={setTheme}>
            {themes.map((option) => {
              const Icon = option.icon
              return (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="rounded-lg py-2.5">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
