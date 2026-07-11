import type { Timestamp } from "firebase/firestore"

export type FavoriteArtist = {
  id?: string
  name?: string
  imageUrl?: string
}

export type UserProfile = {
  uid: string
  name: string
  email: string
  photoUrl?: string
  isPremium?: boolean
  plan?: "free" | "plus" | "pro" | "producer" | string
  subscriptionStatus?: string
  accountType?: "musician" | "producer" | string
  role?: string
  genres?: string[]
  instruments?: string[]
  level?: string
  description?: string
  location?: string
  producerServices?: string[]
  daw?: string
  equipment?: string
  rates?: string
  portfolioUrl?: string
  availability?: string
  favoriteArtists?: FavoriteArtist[]
  createdAt?: Timestamp
}

export type Project = {
  id: string
  ownerUid: string
  ownerName: string
  title: string
  description: string
  genre: string
  imageUri?: string
  demoUri?: string
  status: string
  createdAt?: Timestamp
}

export function defaultProfile(uid: string, email: string, name = "Usuario"): UserProfile {
  return {
    uid,
    name,
    email,
    photoUrl: "",
    isPremium: false,
    plan: "free",
    subscriptionStatus: "inactive",
    accountType: "musician",
    role: "",
    genres: [],
    instruments: [],
    level: "",
    description: "",
    location: "",
    producerServices: [],
    daw: "",
    equipment: "",
    rates: "",
    portfolioUrl: "",
    availability: "",
    favoriteArtists: [],
  }
}

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "USD 0",
    description: "Perfil musical basico para empezar a conectar.",
    features: ["Perfil publico", "Hasta 1 proyecto activo", "Demos MP3"],
  },
  {
    id: "plus",
    name: "Plus",
    price: "USD 3.99",
    description: "Mas visibilidad y filtros para encontrar colaboradores.",
    features: ["Filtros avanzados", "Hasta 5 proyectos activos", "MP3 y WAV", "Perfil destacado"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "USD 7.99",
    description: "Herramientas profesionales para crecer dentro de la red.",
    features: ["Estadisticas", "Proyectos ilimitados", "Stems y ZIP", "Mayor almacenamiento"],
  },
  {
    id: "producer",
    name: "Producer",
    price: "USD 9.99",
    description: "Portfolio y servicios visibles para productores musicales.",
    features: ["Portfolio profesional", "Servicios y tarifas", "DAW y equipamiento", "Perfil destacado"],
  },
]

export function getAccountTypeLabel(accountType?: string) {
  return accountType === "producer" ? "Productor" : "Musico"
}
