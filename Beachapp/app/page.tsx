import { Navigation } from "@/components/navigation"
import { MatchLogging } from "@/components/match-logging"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <MatchLogging />
      </main>
    </div>
  )
}
