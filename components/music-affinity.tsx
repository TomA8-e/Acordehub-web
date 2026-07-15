"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Flame, Music2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { UserProfile } from "@/lib/acordehub-types"
import { calculateMusicAffinity, isSameArtist } from "@/lib/music-affinity"
import { cn } from "@/lib/utils"

type MusicAffinityProps = {
  currentUser: UserProfile
  targetUser: UserProfile
  variant?: "compact" | "full"
  className?: string
}

export function MusicAffinity({ currentUser, targetUser, variant = "full", className }: MusicAffinityProps) {
  const result = useMemo(() => calculateMusicAffinity(currentUser, targetUser), [currentUser, targetUser])
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const compact = variant === "compact"

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedPercentage(result.percentage))
    return () => cancelAnimationFrame(frame)
  }, [result.percentage])

  const artists = (targetUser.favoriteArtists ?? []).filter((artist) => artist.name?.trim())

  return (
    <div className={cn("rounded-2xl border border-[#e5e2d7] bg-[#fffdf7]", compact ? "p-3" : "p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#787066]">Afinidad musical</p>
          <span className={cn("mt-1 block font-black tabular-nums text-[#1a1a1a]", compact ? "text-2xl" : "text-4xl")}>
            {result.percentage}%
          </span>
        </div>
        <Badge className={cn("border-0 text-center font-black", getBadgeClass(result.percentage))}>
          {result.badge}
        </Badge>
      </div>

      <div
        className={cn("mt-3 h-2.5 overflow-hidden rounded-full bg-[#e7e5df]", !compact && "h-3")}
        role="progressbar"
        aria-label={`Afinidad musical: ${result.percentage}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={result.percentage}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", getProgressClass(result.percentage))}
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>

      <p className={cn("mt-3 leading-5 text-[#625d55]", compact ? "text-xs" : "text-sm")}>{result.explanation}</p>

      <div className="mt-3">
        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#787066]">
          <Music2 className="h-3.5 w-3.5" />
          Artistas favoritos
        </p>
        {artists.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {artists.slice(0, compact ? 5 : undefined).map((artist, index) => {
              const common = result.commonArtists.some((candidate) => isSameArtist(candidate, artist))
              return (
                <span
                  key={artist.id || `${artist.name}-${index}`}
                  title={common ? "Artista en común" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                    common ? "bg-[#fff0c2] text-[#9a5b00]" : "bg-[#eef1ed] text-[#545b56]"
                  )}
                >
                  {common && (result.percentage >= 80 ? <Flame className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                  {artist.name}
                </span>
              )
            })}
            {compact && artists.length > 5 && (
              <span className="rounded-full bg-[#eef1ed] px-2.5 py-1 text-xs font-bold text-[#545b56]">+{artists.length - 5}</span>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-[#817b72]">Todavía no agregó artistas favoritos.</p>
        )}
      </div>
    </div>
  )
}

function getBadgeClass(percentage: number) {
  if (percentage >= 95) return "bg-[#ffe2b8] text-[#9a4300] hover:bg-[#ffe2b8]"
  if (percentage >= 80) return "bg-[#fff0c2] text-[#8a5700] hover:bg-[#fff0c2]"
  if (percentage >= 60) return "bg-[#dff3eb] text-[#17694f] hover:bg-[#dff3eb]"
  return "bg-[#e9ece8] text-[#59605b] hover:bg-[#e9ece8]"
}

function getProgressClass(percentage: number) {
  if (percentage >= 95) return "bg-gradient-to-r from-[#f5a623] to-[#ef5b2a]"
  if (percentage >= 80) return "bg-[#f5a623]"
  if (percentage >= 60) return "bg-[#2d9d78]"
  return "bg-[#89918b]"
}
