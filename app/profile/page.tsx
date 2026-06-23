import { Navbar } from "@/components/navbar"
import { ProfilePage } from "@/components/profile-page"

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <ProfilePage />
    </div>
  )
}
