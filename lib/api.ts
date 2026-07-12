import { auth } from "@/lib/firebase"

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ??
  "https://us-central1-acordehub.cloudfunctions.net"

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

type ProjectInput = {
  projectId: string
  title: string
  description: string
  genre: string
  imageUrl?: string
  demoUrl: string
}

type PaymentPreference = {
  preferenceId?: string
  checkoutUrl?: string
  sandboxCheckoutUrl?: string
}

export type SpotifyArtist = {
  id: string
  name: string
  imageUrl: string
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const user = auth.currentUser
  if (!user) throw new Error("Debes iniciar sesion")

  const token = await user.getIdToken()
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "api_request_failed")
  }
  return payload as T
}

export function createProject(input: ProjectInput) {
  return apiRequest<{ projectId: string }>("createProject", { method: "POST", body: input })
}

export function updateProject(input: ProjectInput) {
  return apiRequest<{ projectId: string }>("updateProject", { method: "POST", body: input })
}

export function deleteProject(projectId: string) {
  return apiRequest<{ projectId: string }>("deleteProject", {
    method: "POST",
    body: { projectId },
  })
}

export function createPaymentPreference(planId: string, backUrl: string) {
  return apiRequest<PaymentPreference>("createMercadoPagoPreference", {
    method: "POST",
    body: { planId, backUrl },
  })
}

export function cancelSubscription() {
  return apiRequest<{ plan: string; status: string }>("cancelSubscription", { method: "POST" })
}

export function searchSpotifyArtists(query: string) {
  return apiRequest<{ artists: SpotifyArtist[] }>("searchSpotifyArtists", {
    method: "POST",
    body: { query },
  })
}
