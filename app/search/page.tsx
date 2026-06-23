import { Navbar } from "@/components/navbar"
import { SearchPage } from "@/components/search-page"

export default function Search() {
  return (
    <div className="min-h-screen bg-background md:bg-[#fff8e7]">
      <Navbar />
      <SearchPage />
    </div>
  )
}
