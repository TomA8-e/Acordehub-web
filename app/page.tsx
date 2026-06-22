import { Navbar } from "@/components/navbar"
import { HomeDashboard } from "@/components/home-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HomeDashboard />
    </div>
  )
}
