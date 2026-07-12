"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Crown, Loader2, Music, ShieldCheck, Sparkles } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { plans, type UserProfile } from "@/lib/acordehub-types"
import { cancelSubscription, createPaymentPreference } from "@/lib/api"

export function PlansPage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState("")
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const snapshot = await getDoc(doc(db, "users", user.uid))
      setProfile(snapshot.exists() ? ({ uid: user.uid, ...snapshot.data() } as UserProfile) : null)
    }

    load().catch((err) => setMessage(err instanceof Error ? err.message : "No pudimos cargar tu plan"))
  }, [user])

  const currentPlan = useMemo(() => profile?.plan || "free", [profile?.plan])

  const choosePlan = async (planId: string) => {
    if (!user) return
    setMessage("")

    if (planId === "free") {
      setLoadingPlan(planId)
      try {
        await cancelSubscription()
        setProfile((current) => current && { ...current, plan: "free", subscriptionStatus: "cancelled" })
        setMessage("Volviste al plan Free.")
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "No pudimos actualizar el plan")
      } finally {
        setLoadingPlan(null)
      }
      return
    }

    setLoadingPlan(planId)
    try {
      const backUrl = `${window.location.origin}/plans?status=approved`
      const payload = await createPaymentPreference(planId, backUrl)
      const checkoutUrl = payload.checkoutUrl || payload.sandboxCheckoutUrl
      if (!checkoutUrl) throw new Error("No pudimos iniciar el pago")
      window.location.href = checkoutUrl
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No pudimos iniciar el pago")
      setLoadingPlan(null)
    }
  }

  if (loading) return <main className="app-container text-[#1a1a1a]">Cargando planes...</main>

  if (!user) {
    return (
      <main className="app-container">
        <section className="surface-panel mx-auto max-w-2xl rounded-[32px] p-8 text-center lg:rounded-lg">
          <p className="eyebrow">Planes</p>
          <h1 className="mt-3 text-3xl font-black text-[#1a1a1a]">Inicia sesion para elegir un plan</h1>
          <Button asChild className="mt-6 rounded-2xl bg-[#1a1a1a] text-white lg:rounded-md">
            <Link href="/login">Entrar</Link>
          </Button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-container">
      <section className="surface-panel rounded-[32px] p-5 sm:p-7 lg:rounded-lg lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Planes AcordeHub</p>
            <h1 className="mt-2 text-3xl font-black text-[#1a1a1a] sm:text-4xl lg:text-[42px]">
              Suscripcion para crear y conectar mejor
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6661]">
              Los pagos se procesan con Mercado Pago y el plan se activa cuando recibimos la confirmacion.
            </p>
          </div>
          <Badge className="w-fit rounded-full bg-[#e6f4f1] px-4 py-2 text-[#0f766e] hover:bg-[#e6f4f1]">
            Plan actual: {plans.find((plan) => plan.id === currentPlan)?.name ?? "Free"}
          </Badge>
        </div>
      </section>

      {message && (
        <p className="mt-4 rounded-2xl border border-[#dfe4dd] bg-white px-4 py-3 text-sm font-bold text-[#5f6661] lg:rounded-lg">
          {message}
        </p>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const active = plan.id === currentPlan
          const busy = loadingPlan === plan.id
          return (
            <Card key={plan.id} className={`surface-panel rounded-[28px] lg:rounded-lg ${active ? "ring-2 ring-[#f5a623]" : ""}`}>
              <CardContent className="flex min-h-[360px] flex-col p-5 lg:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1a1a] text-white lg:rounded-md">
                    {plan.id === "producer" ? <Crown className="h-5 w-5" /> : plan.id === "free" ? <Music className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </span>
                  {active && <Badge className="rounded-full bg-[#fff3cf] text-[#c47a00]">Actual</Badge>}
                </div>

                <h2 className="mt-5 text-2xl font-black text-[#1a1a1a]">{plan.name}</h2>
                <p className="mt-2 text-lg font-black text-[#c47a00]">{plan.price} / mes</p>
                <p className="mt-3 text-sm leading-6 text-[#5f6661]">{plan.description}</p>

                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex items-start gap-2 text-sm font-semibold text-[#5f6661]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" />
                      {feature}
                    </p>
                  ))}
                </div>

                <Button
                  disabled={active || busy}
                  onClick={() => choosePlan(plan.id)}
                  className="mt-auto h-12 rounded-2xl bg-[#1a1a1a] font-bold text-white lg:rounded-md"
                  variant={plan.id === "free" ? "outline" : "default"}
                >
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {active ? "Plan actual" : plan.id === "free" ? "Usar Free" : "Suscribirme"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="soft-panel mt-6 rounded-[28px] p-5 lg:rounded-lg lg:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-[#0f766e]" />
          <div>
            <p className="font-black text-[#1a1a1a]">Activacion segura</p>
            <p className="mt-1 text-sm leading-6 text-[#5f6661]">
              No guardamos datos de tarjeta en AcordeHub. La confirmacion llega desde Mercado Pago al backend de Firebase.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
