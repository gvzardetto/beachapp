import { Navigation } from "@/components/navigation"
import { StatsView } from "@/components/stats-view"

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <StatsView />
      </main>
    </div>
  )
}
