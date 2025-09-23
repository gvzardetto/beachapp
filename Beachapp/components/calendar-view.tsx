"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Trophy, Edit3, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Match, TEAM_COMBINATIONS } from "@/lib/types"

// Mock match data for different dates
const mockMatches: Record<string, Match[]> = {
  "2024-01-08": [
    {
      id: "1",
      date: "2024-01-08T14:00:00Z",
      winningTeam: "A",
      players: {
        teamA: TEAM_COMBINATIONS.A.players,
        teamB: TEAM_COMBINATIONS.B.players,
      },
    },
    {
      id: "2",
      date: "2024-01-08T15:30:00Z",
      winningTeam: "C",
      players: {
        teamA: TEAM_COMBINATIONS.C.players,
        teamB: TEAM_COMBINATIONS.A.players,
      },
    },
  ],
  "2024-01-15": [
    {
      id: "3",
      date: "2024-01-15T14:00:00Z",
      winningTeam: "B",
      players: {
        teamA: TEAM_COMBINATIONS.B.players,
        teamB: TEAM_COMBINATIONS.C.players,
      },
    },
  ],
  "2024-01-22": [
    {
      id: "4",
      date: "2024-01-22T14:00:00Z",
      winningTeam: "A",
      players: {
        teamA: TEAM_COMBINATIONS.A.players,
        teamB: TEAM_COMBINATIONS.C.players,
      },
    },
    {
      id: "5",
      date: "2024-01-22T15:30:00Z",
      winningTeam: "B",
      players: {
        teamA: TEAM_COMBINATIONS.B.players,
        teamB: TEAM_COMBINATIONS.A.players,
      },
    },
    {
      id: "6",
      date: "2024-01-22T17:00:00Z",
      winningTeam: "C",
      players: {
        teamA: TEAM_COMBINATIONS.C.players,
        teamB: TEAM_COMBINATIONS.B.players,
      },
    },
  ],
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)) // January 2024
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [matches, setMatches] = useState(mockMatches)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const handleDeleteMatch = (dateKey: string, matchId: string) => {
    setMatches((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey]?.filter((match) => match.id !== matchId) || [],
    }))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const days = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayMatches = matches[dateKey] || []
    const isMonday = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 1
    const hasMatches = dayMatches.length > 0

    days.push(
      <div
        key={day}
        className={cn(
          "h-24 p-2 border border-border cursor-pointer transition-all duration-200 relative",
          isMonday ? "bg-primary/5 border-primary/30 hover:bg-primary/10" : "hover:bg-accent/20",
          selectedDate === dateKey ? "bg-success/10 border-success ring-2 ring-success/20" : "",
        )}
        onClick={() => setSelectedDate(selectedDate === dateKey ? null : dateKey)}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={cn("text-sm font-medium", isMonday ? "text-primary font-semibold" : "text-foreground")}>
            {day}
          </span>
        </div>
        {hasMatches && (
          <div className="absolute bottom-2 left-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          </div>
        )}
      </div>,
    )
  }

  const selectedMatches = selectedDate ? matches[selectedDate] || [] : []

  const getTeamDisplay = (team: "A" | "B" | "C") => {
    const combination = TEAM_COMBINATIONS[team]
    return `${combination.players[0].name} + ${combination.players[1].name}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Match Calendar</h1>
        <p className="text-muted-foreground">View match history and results by date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                  {monthName}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="hover:bg-accent/20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="hover:bg-accent/20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Click on a date to view and edit match details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="p-3 bg-secondary text-center text-sm font-medium text-secondary-foreground border-b border-border"
                  >
                    {day}
                  </div>
                ))}
                {days}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Match Details</CardTitle>
                {selectedDate && (
                  <Button size="sm" variant="outline" className="hover:bg-success/20 bg-transparent">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Match
                  </Button>
                )}
              </div>
              <CardDescription>
                {selectedDate
                  ? `${new Date(selectedDate).toLocaleDateString()} - ${selectedMatches.length} match${selectedMatches.length !== 1 ? "es" : ""}`
                  : "Select a date to view matches"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedMatches.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMatches.map((match, index) => (
                      <Card
                        key={match.id}
                        className="bg-gradient-to-br from-accent/10 to-secondary/20 border border-accent/20"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs">
                              Match {index + 1}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent/20">
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                                onClick={() => handleDeleteMatch(selectedDate, match.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-sm flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-warning" />
                              <span className="text-success">{getTeamDisplay(match.winningTeam)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium mb-1">No matches on this date</p>
                    <Button size="sm" variant="outline" className="mt-2 hover:bg-success/20 bg-transparent">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Match
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Select a date to view match details</p>
                  <p className="text-sm mt-1">Click on any day in the calendar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
