import { Navigation } from "@/components/navigation"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CalendarView />
      </main>
    </div>
  )
}
