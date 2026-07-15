import type { FavoriteArtist, UserProfile } from "@/lib/acordehub-types"

export type MusicAffinityResult = {
  percentage: number
  commonArtists: FavoriteArtist[]
  explanation: string
  badge: "Match Perfecto 🔥" | "Muy compatibles ⭐" | "Compatibles 👍" | "Estilos diferentes 🎵"
}

const WEIGHTS = { artists: 60, genres: 20, role: 8, instruments: 8, level: 4 } as const
const LEVELS = ["principiante", "intermedio", "avanzado", "profesional"]

/** Calcula una afinidad determinista con los datos musicales de Firestore. */
export function calculateMusicAffinity(
  currentUser: Pick<UserProfile, "favoriteArtists" | "genres" | "role" | "instruments" | "level">,
  targetUser: Pick<UserProfile, "favoriteArtists" | "genres" | "role" | "instruments" | "level">
): MusicAffinityResult {
  const currentArtists = uniqueArtists(currentUser.favoriteArtists)
  const targetArtists = uniqueArtists(targetUser.favoriteArtists)
  const currentArtistKeys = new Set(currentArtists.map(artistKey))
  const commonArtists = targetArtists.filter((artist) => currentArtistKeys.has(artistKey(artist)))
  const commonGenres = intersection(currentUser.genres, targetUser.genres)
  const commonInstruments = intersection(currentUser.instruments, targetUser.instruments)
  const roleScore = setSimilarity(roleKeys(currentUser.role), roleKeys(targetUser.role))
  const levelScore = getLevelSimilarity(currentUser.level, targetUser.level)

  const score =
    diceScore(currentArtists.length, targetArtists.length, commonArtists.length) * WEIGHTS.artists +
    diceScore(currentUser.genres?.length ?? 0, targetUser.genres?.length ?? 0, commonGenres.length) * WEIGHTS.genres +
    roleScore * WEIGHTS.role +
    diceScore(currentUser.instruments?.length ?? 0, targetUser.instruments?.length ?? 0, commonInstruments.length) * WEIGHTS.instruments +
    levelScore * WEIGHTS.level
  const percentage = Math.max(0, Math.min(100, Math.round(score)))

  return {
    percentage,
    commonArtists,
    explanation: buildExplanation(percentage, commonArtists, commonGenres, commonInstruments, roleScore, levelScore),
    badge: getAffinityBadge(percentage),
  }
}

export function getAffinityBadge(percentage: number): MusicAffinityResult["badge"] {
  if (percentage >= 95) return "Match Perfecto 🔥"
  if (percentage >= 80) return "Muy compatibles ⭐"
  if (percentage >= 60) return "Compatibles 👍"
  return "Estilos diferentes 🎵"
}

export function isSameArtist(left: FavoriteArtist, right: FavoriteArtist) {
  return artistKey(left) !== "" && artistKey(left) === artistKey(right)
}

function uniqueArtists(artists?: FavoriteArtist[]) {
  const result = new Map<string, FavoriteArtist>()
  for (const artist of artists ?? []) {
    const key = artistKey(artist)
    if (key && !result.has(key)) result.set(key, artist)
  }
  return [...result.values()]
}

function artistKey(artist: FavoriteArtist) {
  // Android guarda nombre e imagen; la web también puede guardar el id de Spotify.
  // Priorizar el nombre permite reconocer al mismo artista entre ambas plataformas.
  return normalize(artist.name) || (artist.id?.trim() ? `id:${artist.id.trim().toLowerCase()}` : "")
}

function intersection(left?: string[], right?: string[]) {
  const rightKeys = new Set((right ?? []).map(normalize).filter(Boolean))
  return [...new Set((left ?? []).map(normalize).filter((item) => item && rightKeys.has(item)))]
}

function diceScore(leftCount: number, rightCount: number, commonCount: number) {
  if (leftCount === 0 || rightCount === 0) return 0
  return (2 * commonCount) / (leftCount + rightCount)
}

function setSimilarity(left: string[], right: string[]) {
  return diceScore(left.length, right.length, intersection(left, right).length)
}

function roleKeys(role?: string) {
  const value = normalize(role)
  if (!value) return []
  const aliases: Array<[RegExp, string]> = [
    [/productor|producer|produccion|beatmaker/, "produccion"],
    [/cantante|vocalista|voz|singer/, "voz"],
    [/guitarr/, "guitarra"],
    [/bajista|\bbajo\b/, "bajo"],
    [/baterista|bateria|drummer/, "bateria"],
    [/pianista|piano|tecladista|teclado/, "teclado"],
    [/compositor|compositora|songwriter/, "composicion"],
    [/dj|disc jockey/, "dj"],
  ]
  const matched = aliases.filter(([pattern]) => pattern.test(value)).map(([, key]) => key)
  return matched.length ? [...new Set(matched)] : value.split(/[,/&+]+/).map((item) => item.trim()).filter(Boolean)
}

function getLevelSimilarity(left?: string, right?: string) {
  const leftIndex = LEVELS.indexOf(normalize(left))
  const rightIndex = LEVELS.indexOf(normalize(right))
  if (leftIndex < 0 || rightIndex < 0) return 0
  const distance = Math.abs(leftIndex - rightIndex)
  if (distance === 0) return 1
  if (distance === 1) return 0.5
  return 0
}

function buildExplanation(
  percentage: number,
  commonArtists: FavoriteArtist[],
  commonGenres: string[],
  commonInstruments: string[],
  roleScore: number,
  levelScore: number
) {
  const artistCount = commonArtists.length
  const artistText = artistCount === 1 ? "1 artista favorito" : `${artistCount} artistas favoritos`
  const genreText = commonGenres.length === 1 ? "1 género" : `${commonGenres.length} géneros`
  if (artistCount > 0 && commonGenres.length > 0) return `Comparten ${artistText} y ${genreText}; sus referencias musicales están muy conectadas.`
  if (artistCount > 0) return `Comparten ${artistText}, la señal más importante para calcular este match.`
  if (commonGenres.length > 0) return `Comparten ${genreText}, aunque todavía no coinciden en artistas favoritos.`
  if (commonInstruments.length > 0 || roleScore > 0 || levelScore > 0) return "Coinciden en parte de su perfil musical, pero sus artistas y géneros son diferentes."
  if (percentage === 0) return "Aún no encontramos coincidencias con la información musical disponible."
  return "Tienen algunos puntos musicales en común para empezar a conocerse."
}

function normalize(value?: string) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()
}
