"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Trophy, Edit3, Trash2, Plus, Loader2, Users, Clock, Zap, Star } from "lucide-react"
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
          <Button variant="outline" onClick={handleCancelAdd}>
            Cancel
          </Button>
        </div>
        
        <Card>
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
                            "cursor-pointer transition-all duration-200 hover:shadow-md",
                            isSelected
                              ? "ring-2 ring-primary bg-primary/5 border-primary"
                              : "hover:border-primary/50"
                          )}
                          onClick={() => setNewMatchTeam(team)}
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
                <Button onClick={handleCancelAdd} variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNewMatch} disabled={!newMatchTeam || isSaving}>
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="hover:bg-success/20 bg-transparent"
                    onClick={handleAddMatch}
                  >
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-accent/20"
                                onClick={() => handleEditMatch(match)}
                              >
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 hover:bg-success/20 bg-transparent"
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
