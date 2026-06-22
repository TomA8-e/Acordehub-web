import { Navbar } from "@/components/navbar"
import { ProjectsPage } from "@/components/projects-page"

export default function Projects() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProjectsPage />
    </div>
  )
}
