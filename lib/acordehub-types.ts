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
  role?: string
  genres?: string[]
  instruments?: string[]
  level?: string
  description?: string
  location?: string
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
    role: "",
    genres: [],
    instruments: [],
    level: "",
    description: "",
    location: "",
    favoriteArtists: [],
  }
}
