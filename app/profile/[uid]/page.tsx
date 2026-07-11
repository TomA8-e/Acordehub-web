import { Navbar } from "@/components/navbar"
import { PublicProfilePage } from "@/components/public-profile-page"

export default async function PublicProfile({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PublicProfilePage uid={uid} />
    </div>
  )
}
