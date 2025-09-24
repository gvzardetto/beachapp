"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Trophy, Edit3, Trash2, Plus, Loader2, Users, Zap, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Match } from "@/lib/types"
import { getAllMatches, getMatchesByDate, deleteMatch, getAllPlayers, updateMatch, logMatch, type Match as SupabaseMatch, type Player } from "@/lib/supabaseClient"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, Match[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [teamCombinations, setTeamCombinations] = useState<any>({})
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | "C" | "D" | "E" | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newMatchTeam, setNewMatchTeam] = useState<"A" | "B" | "C" | "D" | "E" | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch players first
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const fetchedPlayers = await getAllPlayers()
        setPlayers(fetchedPlayers)
        
        // Create team combinations with real player names
        if (fetchedPlayers.length >= 4) {
          const combinations = {
            A: { 
              players: [fetchedPlayers[0], fetchedPlayers[1]], 
              label: `${fetchedPlayers[0].name} + ${fetchedPlayers[1].name}` 
            },
            B: { 
              players: [fetchedPlayers[0], fetchedPlayers[2]], 
              label: `${fetchedPlayers[0].name} + ${fetchedPlayers[2].name}` 
            },
            C: { 
              players: [fetchedPlayers[0], fetchedPlayers[3]], 
              label: `${fetchedPlayers[0].name} + ${fetchedPlayers[3].name}` 
            },
            D: { 
              players: [fetchedPlayers[1], fetchedPlayers[2]], 
              label: `${fetchedPlayers[1].name} + ${fetchedPlayers[2].name}` 
            },
            E: { 
              players: [fetchedPlayers[2], fetchedPlayers[3]], 
              label: `${fetchedPlayers[2].name} + ${fetchedPlayers[3].name}` 
            }
          }
          setTeamCombinations(combinations)
        }
      } catch (error) {
        console.error("Error fetching players:", error)
        setError("Failed to load players")
      }
    }
    
    fetchPlayers()
  }, [])

  // Fetch all matches after players are loaded
  useEffect(() => {
    const fetchMatches = async () => {
      if (Object.keys(teamCombinations).length === 0) return
      
      try {
        setIsLoading(true)
        setError(null)
        const allMatches = await getAllMatches()
        
        // Group matches by date
        const matchesByDate: Record<string, Match[]> = {}
        
        allMatches.forEach((match: SupabaseMatch) => {
          const matchDate = new Date(match.date).toISOString().split('T')[0]
          
          // Convert Supabase match to our Match format
          const teamA = teamCombinations.A.players
          const teamB = teamCombinations.B.players
          const teamC = teamCombinations.C.players
          const teamD = teamCombinations.D.players
          const teamE = teamCombinations.E.players
          
          let winningTeam: "A" | "B" | "C" | "D" | "E" = "A"
          
          // Check if player1_id and player2_id match any team combination
          if ((match.player1_id === teamA[0].id && match.player2_id === teamA[1].id) ||
              (match.player1_id === teamA[1].id && match.player2_id === teamA[0].id)) {
            winningTeam = "A"
          } else if ((match.player1_id === teamB[0].id && match.player2_id === teamB[1].id) ||
                     (match.player1_id === teamB[1].id && match.player2_id === teamB[0].id)) {
            winningTeam = "B"
          } else if ((match.player1_id === teamC[0].id && match.player2_id === teamC[1].id) ||
                     (match.player1_id === teamC[1].id && match.player2_id === teamC[0].id)) {
            winningTeam = "C"
          } else if ((match.player1_id === teamD[0].id && match.player2_id === teamD[1].id) ||
                     (match.player1_id === teamD[1].id && match.player2_id === teamD[0].id)) {
            winningTeam = "D"
          } else if ((match.player1_id === teamE[0].id && match.player2_id === teamE[1].id) ||
                     (match.player1_id === teamE[1].id && match.player2_id === teamE[0].id)) {
            winningTeam = "E"
          }
          
          const convertedMatch: Match = {
            id: match.id?.toString() || "",
            date: match.date,
            winningTeam,
      players: {
              teamA: teamA,
              teamB: teamB
            }
          }
          
          if (!matchesByDate[matchDate]) {
            matchesByDate[matchDate] = []
          }
          matchesByDate[matchDate].push(convertedMatch)
        })
        
        setMatches(matchesByDate)
      } catch (err) {
        console.error("Error fetching matches:", err)
        setError("Failed to load matches")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMatches()
  }, [teamCombinations])

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

  const handleDeleteMatch = async (dateKey: string, matchId: string) => {
    try {
      setIsLoading(true)
      await deleteMatch(parseInt(matchId))
      
      // Update local state
    setMatches((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey]?.filter((match) => match.id !== matchId) || [],
    }))
    } catch (error) {
      console.error("Error deleting match:", error)
      setError("Failed to delete match")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match)
    setSelectedTeam(match.winningTeam)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditingMatch(null)
    setSelectedTeam(null)
    setIsEditing(false)
  }

  const handleUpdateMatch = async () => {
    if (!editingMatch || !selectedTeam) {
      setError("Please select a winning team")
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      // Get player IDs for the selected team
      const teamPlayers = teamCombinations[selectedTeam].players
      const player1Id = teamPlayers[0].id
      const player2Id = teamPlayers[1].id

      // Update match in Supabase
      await updateMatch(parseInt(editingMatch.id), {
        player1_id: player1Id,
        player2_id: player2Id,
        score: "Won"
      })

      // Update local state
      const updatedMatch = {
        ...editingMatch,
        winningTeam: selectedTeam,
        players: {
          teamA: teamCombinations[selectedTeam].players,
          teamB: teamCombinations[selectedTeam === "A" ? "B" : "A"].players
        }
      }

      setMatches(prev => {
        const newMatches = { ...prev }
        const dateKey = new Date(editingMatch.date).toISOString().split('T')[0]
        if (newMatches[dateKey]) {
          newMatches[dateKey] = newMatches[dateKey].map(m => 
            m.id === editingMatch.id ? updatedMatch : m
          )
        }
        return newMatches
      })

      setEditingMatch(null)
      setSelectedTeam(null)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating match:", error)
      setError("Failed to update match")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddMatch = () => {
    setIsAdding(true)
    setNewMatchTeam(null)
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewMatchTeam(null)
  }

  const handleSaveNewMatch = async () => {
    if (!newMatchTeam || !selectedDate) {
      setError("Please select a winning team")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Get player IDs for the selected team
      const teamPlayers = teamCombinations[newMatchTeam].players
      const player1Id = teamPlayers[0].id
      const player2Id = teamPlayers[1].id

      // Create match in Supabase
      const newMatch = await logMatch({
        player1_id: player1Id,
        player2_id: player2Id,
        score: "Won",
        date: new Date(selectedDate).toISOString()
      })

      // Convert to our Match format
      const convertedMatch: Match = {
        id: newMatch.id?.toString() || "",
        date: newMatch.date,
        winningTeam: newMatchTeam,
        players: {
          teamA: teamCombinations[newMatchTeam].players,
          teamB: teamCombinations[newMatchTeam === "A" ? "B" : "A"].players
        }
      }

      // Update local state
      setMatches(prev => {
        const newMatches = { ...prev }
        if (newMatches[selectedDate]) {
          newMatches[selectedDate] = [...newMatches[selectedDate], convertedMatch]
        } else {
          newMatches[selectedDate] = [convertedMatch]
        }
        return newMatches
      })

      setIsAdding(false)
      setNewMatchTeam(null)
    } catch (error) {
      console.error("Error creating match:", error)
      setError("Failed to create match")
    } finally {
      setIsSaving(false)
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const days = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-28 rounded-xl bg-slate-50/30" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayMatches = matches[dateKey] || []
    const isMonday = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 1
    const hasMatches = dayMatches.length > 0
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

    // Get match count badge color
    const getMatchBadgeColor = (count: number) => {
      if (count >= 3) return "bg-gradient-to-br from-red-500 to-pink-500"
      if (count === 2) return "bg-gradient-to-br from-blue-500 to-cyan-500"
      return "bg-gradient-to-br from-green-500 to-emerald-500"
    }

    days.push(
      <div
        key={day}
        className={cn(
          "h-28 p-3 cursor-pointer transition-all duration-300 relative rounded-2xl group shadow-sm hover:shadow-lg",
          "bg-gradient-to-br from-white to-slate-50/80 border-0",
          isMonday ? "bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 shadow-md" : "hover:from-slate-50 hover:to-slate-100",
          selectedDate === dateKey ? "bg-gradient-to-br from-emerald-50 to-green-50 ring-2 ring-emerald-400/50 shadow-xl scale-105" : "",
          isToday && "ring-2 ring-violet-400/60 bg-gradient-to-br from-violet-50/80 to-indigo-50/80 shadow-lg"
        )}
        onClick={() => setSelectedDate(selectedDate === dateKey ? null : dateKey)}
      >
        <div className="flex justify-start items-start mb-2">
          <span className={cn(
            "text-base font-semibold transition-all duration-200 px-2 py-1 rounded-lg",
            isMonday ? "text-violet-700 font-bold bg-violet-100/50" : "text-slate-700",
            isToday && "text-violet-800 font-bold text-lg bg-violet-200/60 shadow-sm"
          )}>
            {day}
          </span>
        </div>
        {hasMatches && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex gap-1.5 justify-center">
              {dayMatches.slice(0, 4).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110",
                    getMatchBadgeColor(dayMatches.length)
                  )}
                />
              ))}
              {dayMatches.length > 4 && (
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-sm" />
              )}
            </div>
          </div>
        )}
        {isToday && (
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 animate-pulse shadow-lg" />
        )}
      </div>,
    )
  }

  const selectedMatches = selectedDate ? matches[selectedDate] || [] : []

  const getTeamDisplay = (team: "A" | "B" | "C" | "D" | "E") => {
    const combination = teamCombinations[team]
    return combination?.label || `Team ${team}`
  }

  const getTeamIcon = (team: "A" | "B" | "C" | "D" | "E") => {
    const icons = { A: Trophy, B: Star, C: Zap, D: Users, E: Clock }
    return icons[team]
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Match Calendar</h1>
          <p className="text-muted-foreground">View match history and results by date</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading calendar...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Match Calendar</h1>
          <p className="text-muted-foreground">View match history and results by date</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Edit form component
  if (isEditing && editingMatch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Match</h2>
          <Button variant="outline" onClick={handleCancelEdit}>
            Cancel
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Match Details</CardTitle>
            <CardDescription>
              Update the match information for {new Date(editingMatch.date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Select Winning Team</h3>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {(Object.keys(teamCombinations) as Array<"A" | "B" | "C" | "D" | "E">).map((team) => {
                      const TeamIcon = getTeamIcon(team)
                      const isSelected = selectedTeam === team
                      return (
                        <Card
                          key={team}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-md",
                            isSelected
                              ? "ring-2 ring-primary bg-primary/5 border-primary"
                              : "hover:border-primary/50"
                          )}
                          onClick={() => setSelectedTeam(team)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}>
                                <TeamIcon className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <Badge
                                  variant={isSelected ? "default" : "secondary"}
                                  className={cn(
                                    "text-xs",
                                    isSelected && "bg-primary text-primary-foreground"
                                  )}
                                >
                                  Team {team}
                                </Badge>
                                <p className="text-sm font-medium">{teamCombinations[team]?.label || `Team ${team}`}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleCancelEdit} variant="outline" disabled={isUpdating}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMatch} disabled={!selectedTeam || isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Match"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Add match form component
  if (isAdding && selectedDate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Match</h2>
          <Button variant="outline" onClick={handleCancelAdd} className="rounded-xl shadow-md hover:shadow-lg">
            Cancel
          </Button>
        </div>
        
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Create New Match</CardTitle>
            <CardDescription>
              Add a new match for {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Select Winning Team</h3>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {(Object.keys(teamCombinations) as Array<"A" | "B" | "C" | "D" | "E">).map((team) => {
                      const TeamIcon = getTeamIcon(team)
                      const isSelected = newMatchTeam === team
                      return (
                        <Card
                          key={team}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-102 rounded-xl shadow-md",
                            isSelected
                              ? "ring-2 ring-primary bg-primary/5 border-primary"
                              : "hover:border-primary/50"
                          )}
                          onClick={() => setNewMatchTeam(team)}
                        >
                          <div className={cn("h-1 bg-gradient-to-r rounded-t-xl", {
                            "from-purple-500 to-pink-500": team === "A",
                            "from-blue-500 to-cyan-500": team === "B",
                            "from-yellow-500 to-orange-500": team === "C", 
                            "from-green-500 to-emerald-500": team === "D",
                            "from-pink-500 to-rose-500": team === "E"
                          })} />
                          <CardContent className="p-6">
                            <div className="flex items-center justify-center mb-4">
                              <div
                                className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", {
                                  "bg-gradient-to-br from-purple-500 to-pink-500": team === "A",
                                  "bg-gradient-to-br from-blue-500 to-cyan-500": team === "B",
                                  "bg-gradient-to-br from-yellow-500 to-orange-500": team === "C", 
                                  "bg-gradient-to-br from-green-500 to-emerald-500": team === "D",
                                  "bg-gradient-to-br from-pink-500 to-rose-500": team === "E"
                                })}
                              >
                                <TeamIcon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="font-semibold text-foreground">{teamCombinations[team]?.label || `Team ${team}`}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleCancelAdd} variant="outline" disabled={isSaving} className="rounded-xl shadow-md hover:shadow-lg">
                  Cancel
                </Button>
                <Button onClick={handleSaveNewMatch} disabled={!newMatchTeam || isSaving} className="rounded-xl shadow-md hover:shadow-lg">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Match"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-slate-800 font-bold">{monthName}</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="rounded-2xl shadow-lg hover:shadow-xl border-0 bg-white/80 hover:bg-white transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="rounded-2xl shadow-lg hover:shadow-xl border-0 bg-white/80 hover:bg-white transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-slate-600 text-base">Click on a date to view and edit match details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 p-4 bg-gradient-to-br from-slate-50/50 to-white rounded-2xl shadow-inner">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "p-3 text-center text-sm font-bold rounded-xl shadow-sm transition-all duration-200",
                      index === 1 ? "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700" : "bg-white/80 text-slate-600"
                    )}
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
          <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-800 font-bold">Match Details</span>
                </CardTitle>
                {selectedDate && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-2xl shadow-lg hover:shadow-xl border-0 bg-white/80 hover:bg-white transition-all duration-300"
                    onClick={handleAddMatch}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Match
                  </Button>
                )}
              </div>
              <CardDescription className="text-slate-600">
                {selectedDate
                  ? `${new Date(selectedDate).toLocaleDateString()} - ${selectedMatches.length} match${selectedMatches.length !== 1 ? "es" : ""}`
                  : "Select a date to view matches"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedMatches.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMatches.map((match, index) => (
                      <Card
                        key={match.id}
                        className="border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group rounded-xl bg-gradient-to-br from-slate-50 to-slate-100"
                      >
                        <div className={cn("h-2 bg-gradient-to-r", {
                          "from-purple-500 to-pink-500": match.winningTeam === "A",
                          "from-blue-500 to-cyan-500": match.winningTeam === "B", 
                          "from-yellow-500 to-orange-500": match.winningTeam === "C",
                          "from-green-500 to-emerald-500": match.winningTeam === "D",
                          "from-pink-500 to-rose-500": match.winningTeam === "E"
                        })} />
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", {
                                "bg-gradient-to-br from-purple-500 to-pink-500": match.winningTeam === "A",
                                "bg-gradient-to-br from-blue-500 to-cyan-500": match.winningTeam === "B", 
                                "bg-gradient-to-br from-yellow-500 to-orange-500": match.winningTeam === "C",
                                "bg-gradient-to-br from-green-500 to-emerald-500": match.winningTeam === "D",
                                "bg-gradient-to-br from-pink-500 to-rose-500": match.winningTeam === "E"
                              })}>
                                <Trophy className="w-4 h-4 text-white" />
                              </div>
                              <Badge className="bg-slate-100 text-slate-800 font-bold px-3 py-1 hover:bg-slate-200 transition-colors">
                              Match {index + 1}
                            </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                                onClick={() => handleEditMatch(match)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors"
                                onClick={() => handleDeleteMatch(selectedDate, match.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-center">
                              <span className="font-bold text-lg text-primary">
                                🏆 {getTeamDisplay(match.winningTeam)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium mb-1">No matches on this date</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 rounded-xl shadow-md hover:shadow-lg"
                      onClick={handleAddMatch}
                    >
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
