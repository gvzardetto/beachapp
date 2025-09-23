"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TEAM_COMBINATIONS, type Match } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Trophy, Users, Clock, Edit3, Trash2, Calendar, Zap, Star } from "lucide-react"

// Mock data for today's matches
const mockTodayMatches: Match[] = [
  {
    id: "1",
    date: new Date().toISOString(),
    winningTeam: "A",
    players: {
      teamA: TEAM_COMBINATIONS.A.players,
      teamB: TEAM_COMBINATIONS.B.players,
    },
  },
  {
    id: "2",
    date: new Date().toISOString(),
    winningTeam: "C",
    players: {
      teamA: TEAM_COMBINATIONS.C.players,
      teamB: TEAM_COMBINATIONS.B.players,
    },
  },
]

export function MatchLogging() {
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | "C" | null>(null)
  const [todayMatches, setTodayMatches] = useState<Match[]>(mockTodayMatches)
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split("T")[0])

  const handleSaveResult = () => {
    if (!selectedTeam) return

    // Create new match
    const newMatch: Match = {
      id: Date.now().toString(),
      date: new Date(matchDate).toISOString(),
      winningTeam: selectedTeam,
      players: {
        teamA: TEAM_COMBINATIONS[selectedTeam].players,
        teamB: selectedTeam === "A" ? TEAM_COMBINATIONS.B.players : TEAM_COMBINATIONS.A.players,
      },
    }

    setTodayMatches([...todayMatches, newMatch])
    setSelectedTeam(null)
  }

  const handleDeleteMatch = (matchId: string) => {
    setTodayMatches(todayMatches.filter((match) => match.id !== matchId))
  }

  const getTeamDisplay = (team: "A" | "B" | "C") => {
    const combination = TEAM_COMBINATIONS[team]
    return `${combination.players[0].name} + ${combination.players[1].name}`
  }

  const getTeamIcon = (team: "A" | "B" | "C") => {
    const icons = { A: Trophy, B: Star, C: Zap }
    return icons[team]
  }

  const getTeamGradient = (team: "A" | "B" | "C") => {
    const gradients = {
      A: "gradient-purple",
      B: "gradient-pink",
      C: "gradient-yellow",
    }
    return gradients[team]
  }

  return (
    <div className="space-y-8">
      {/* Match Logging Section */}
      <div className="grid gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Match Results
          </h1>
          <p className="text-muted-foreground">Track your tennis victories with style</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Log Match Result</CardTitle>
                <CardDescription>Select the winning team and date</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="match-date" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                Match Date
              </Label>
              <Input
                id="match-date"
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full md:w-auto rounded-xl border-0 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(TEAM_COMBINATIONS) as Array<"A" | "B" | "C">).map((team) => {
                const TeamIcon = getTeamIcon(team)
                const isSelected = selectedTeam === team
                return (
                  <Card
                    key={team}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-xl border-0 overflow-hidden group",
                      isSelected
                        ? "ring-2 ring-primary shadow-2xl shadow-primary/25 scale-105"
                        : "hover:scale-102 shadow-lg hover:shadow-xl",
                    )}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className={cn("h-2", getTeamGradient(team))} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={cn("w-12 h-12 rounded-xl flex items-center justify-center", getTeamGradient(team))}
                        >
                          <TeamIcon className="w-6 h-6 text-white" />
                        </div>
                        <Badge
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "font-semibold",
                            isSelected ? "bg-primary text-primary-foreground" : "border-muted-foreground/30",
                          )}
                        >
                          Team {team}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">{getTeamDisplay(team)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>Doubles Team</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Button
              onClick={handleSaveResult}
              disabled={!selectedTeam}
              className="w-full h-12 rounded-xl gradient-green text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              size="lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Save Match Result
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Matches Display Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-secondary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-pink flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {matchDate === new Date().toISOString().split("T")[0]
                  ? "Today's Matches"
                  : `Matches for ${new Date(matchDate).toLocaleDateString()}`}
              </CardTitle>
              <CardDescription>
                {todayMatches.length} match{todayMatches.length !== 1 ? "es" : ""} played
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {todayMatches.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-purple flex items-center justify-center opacity-20">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-semibold mb-2 text-foreground">No matches logged yet</p>
              <p className="text-sm text-muted-foreground">Start by logging your first match above</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayMatches.map((match, index) => {
                const TeamIcon = getTeamIcon(match.winningTeam)
                return (
                  <Card
                    key={match.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group"
                  >
                    <div className={cn("h-1", getTeamGradient(match.winningTeam))} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              getTeamGradient(match.winningTeam),
                            )}
                          >
                            <TeamIcon className="w-4 h-4 text-white" />
                          </div>
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-medium">
                            Match {index + 1}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50 rounded-lg">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive rounded-lg"
                            onClick={() => handleDeleteMatch(match.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-warning" />
                          <span className="text-sm font-semibold text-foreground">
                            {getTeamDisplay(match.winningTeam)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
