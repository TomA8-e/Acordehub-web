import { Navbar } from "@/components/navbar"
import { ProfilePage } from "@/components/profile-page"

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProfilePage />
    </div>
  )
}
