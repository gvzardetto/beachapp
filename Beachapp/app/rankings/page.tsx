import { Navigation } from "@/components/navigation"
import { RankingsTable } from "@/components/rankings-table"

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <RankingsTable />
      </main>
    </div>
  )
}
