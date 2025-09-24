"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Match } from "@/lib/types"
import { getAllPlayers, type Player } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"
import { Trophy, Users, Clock, Edit3, Trash2, Calendar, Zap, Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { logMatch, getPlayerRankings, getUpcomingMatches, getMatchesByDate, updateMatch, deleteMatch, type Match as SupabaseMatch } from "@/lib/supabaseClient"

// Mock data for today's matches (will be replaced by real data)
const mockTodayMatches: Match[] = []

export function MatchLogging() {
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | "C" | "D" | "E" | null>(null)
  const [todayMatches, setTodayMatches] = useState<Match[]>([])
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [players, setPlayers] = useState<Player[]>([])
  const [teamCombinations, setTeamCombinations] = useState<any>({})
  
  // New state for Supabase integration
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Edit/Delete state
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage(null)
      setErrorMessage(null)
    }, 5000)
  }

  // Fetch matches for the selected date
  const fetchMatchesForDate = async (date: string) => {
    try {
      setIsLoading(true)
      
      // Check if team combinations are loaded
      if (!teamCombinations.A || !teamCombinations.B || !teamCombinations.C || !teamCombinations.D || !teamCombinations.E) {
        console.log("Team combinations not loaded yet, skipping match fetch")
        setTodayMatches([])
        return
      }
      
      const matches = await getMatchesByDate(date)
      
      // Convert Supabase matches to our Match format
      const convertedMatches: Match[] = matches.map((match: SupabaseMatch) => {
        // Determine which team won based on player IDs
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
        
        return {
          id: match.id?.toString() || "",
          date: match.date,
          winningTeam,
          players: {
            teamA: teamA,
            teamB: teamB
          }
        }
      })
      
      setTodayMatches(convertedMatches)
    } catch (error) {
      console.error("Error fetching matches:", error)
      setErrorMessage("Failed to load matches")
    } finally {
      setIsLoading(false)
    }
  }

  // Load players and create team combinations
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
        setErrorMessage("Failed to load players")
      }
    }
    
    fetchPlayers()
  }, [])

  // Load matches when date changes or team combinations are loaded
  useEffect(() => {
    if (Object.keys(teamCombinations).length > 0) {
      fetchMatchesForDate(matchDate)
    }
  }, [matchDate, teamCombinations])

  const handleSaveResult = async () => {
    if (!selectedTeam) {
      setErrorMessage("Please select a winning team")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Get player IDs based on selected team
      const teamPlayers = teamCombinations[selectedTeam].players
      const player1Id = teamPlayers[0].id
      const player2Id = teamPlayers[1].id

      // Prepare match data for Supabase (simplified - no score needed)
      const matchData = {
        player1_id: player1Id,
        player2_id: player2Id,
        score: "Won", // Simple win indicator
        date: new Date(matchDate).toISOString()
      }

      // Save match to Supabase
      const savedMatch = await logMatch(matchData)
      
      // Show success message
      setSuccessMessage(`Match saved successfully! Team ${selectedTeam} won!`)
      clearMessages()
      
      // Clear form
      setSelectedTeam(null)
      
      // Refresh matches for the current date
      await fetchMatchesForDate(matchDate)
      
      // Optionally refresh rankings and upcoming matches
      try {
        await Promise.all([
          getPlayerRankings(),
          getUpcomingMatches()
        ])
        // You could update parent component state here if needed
      } catch (refreshError) {
        console.warn("Failed to refresh data:", refreshError)
        // Don't show error to user as the main operation succeeded
      }

    } catch (error) {
      console.error("Error saving match:", error)
      
      // Better error handling for network issues
      let errorMessage = "Failed to save match. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error: Please check your internet connection and Supabase configuration."
        } else if (error.message.includes("supabaseUrl is required")) {
          errorMessage = "Supabase configuration missing. Please check your .env.local file."
        } else {
          errorMessage = error.message
        }
      }
      
      setErrorMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    try {
      setIsLoading(true)
      await deleteMatch(parseInt(matchId))
      setSuccessMessage("Match deleted successfully!")
      clearMessages()
      
      // Refresh matches
      await fetchMatchesForDate(matchDate)
    } catch (error) {
      console.error("Error deleting match:", error)
      
      let errorMessage = "Failed to delete match"
      if (error instanceof Error) {
        if (error.message.includes("Database permission error")) {
          errorMessage = "Database permissions issue. Please check FIX_DATABASE_PERMISSIONS.md for the solution."
        } else {
          errorMessage = `Failed to delete match: ${error.message}`
        }
      }
      
      setErrorMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match)
    setIsEditing(true)
    setSelectedTeam(match.winningTeam)
  }

  const handleUpdateMatch = async () => {
    if (!editingMatch || !selectedTeam) return

    try {
      setIsLoading(true)
      setErrorMessage(null)
      
      // Get player IDs for the selected team
      const teamPlayers = teamCombinations[selectedTeam].players
      const player1Id = teamPlayers[0].id
      const player2Id = teamPlayers[1].id

      console.log('Updating match:', {
        matchId: editingMatch.id,
        player1Id,
        player2Id,
        date: new Date(matchDate).toISOString()
      })

      const updateData = {
        player1_id: player1Id,
        player2_id: player2Id,
        score: "Won",
        date: new Date(matchDate).toISOString()
      }
      
      console.log('Update data being sent:', updateData)

      const updatedMatch = await updateMatch(parseInt(editingMatch.id), updateData)

      console.log('Match updated successfully:', updatedMatch)
      setSuccessMessage("Match updated successfully!")
      clearMessages()
      
      // Reset edit state
      setEditingMatch(null)
      setIsEditing(false)
      setSelectedTeam(null)
      
      // Refresh matches
      await fetchMatchesForDate(matchDate)
    } catch (error) {
      console.error("Error updating match:", error)
      
      let errorMessage = "Failed to update match"
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          errorMessage = "Match not found. It may have been deleted."
        } else if (error.message.includes("Cannot coerce")) {
          errorMessage = "Database error. Please try again."
        } else if (error.message.includes("Database permission error")) {
          errorMessage = "Database permissions issue. Please check FIX_DATABASE_PERMISSIONS.md for the solution."
        } else {
          errorMessage = `Failed to update match: ${error.message}`
        }
      }
      
      setErrorMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingMatch(null)
    setIsEditing(false)
    setSelectedTeam(null)
  }

  const getTeamDisplay = (team: "A" | "B" | "C" | "D" | "E") => {
    const combination = teamCombinations[team]
    return combination?.label || `Team ${team}`
  }

  const getTeamIcon = (team: "A" | "B" | "C" | "D" | "E") => {
    const icons = { A: Trophy, B: Star, C: Zap, D: Users, E: Clock }
    return icons[team]
  }

  const getTeamGradient = (team: "A" | "B" | "C" | "D" | "E") => {
    const gradients = {
      A: "gradient-purple",
      B: "gradient-pink",
      C: "gradient-yellow",
      D: "gradient-blue",
      E: "gradient-green",
    }
    return gradients[team]
  }

  return (
    <div className="space-y-8">
      {/* Match Logging Section */}
      <div className="grid gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Match Results
          </h1>
          <p className="text-muted-foreground">Every Point Matters</p>
        </div>

        <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent font-bold">
                  Log Match Result
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Select the winning team and date
                </CardDescription>
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


            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {(Object.keys(teamCombinations) as Array<"A" | "B" | "C" | "D" | "E">).map((team) => {
                const TeamIcon = getTeamIcon(team)
                const isSelected = selectedTeam === team
                return (
                  <Card
                    key={team}
                    className={cn(
                      "cursor-pointer transition-all duration-500 border-0 overflow-hidden group rounded-2xl backdrop-blur-sm",
                      isSelected
                        ? "ring-2 ring-violet-400 shadow-2xl scale-105 bg-gradient-to-br from-violet-50/80 to-purple-50/80"
                        : "hover:scale-105 shadow-lg hover:shadow-2xl bg-gradient-to-br from-white/90 to-slate-50/90",
                    )}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className={cn("h-2 bg-gradient-to-r", {
                      "from-rose-400 via-pink-400 to-purple-400": team === "A",
                      "from-blue-400 via-cyan-400 to-teal-400": team === "B", 
                      "from-amber-400 via-orange-400 to-red-400": team === "C",
                      "from-emerald-400 via-green-400 to-teal-400": team === "D",
                      "from-pink-400 via-rose-400 to-red-400": team === "E"
                    })} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center mb-5">
                        <div
                          className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110", {
                            "bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500": team === "A",
                            "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500": team === "B",
                            "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500": team === "C", 
                            "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500": team === "D",
                            "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500": team === "E"
                          })}
                        >
                          <TeamIcon className="w-8 h-8 text-white drop-shadow-sm" />
                        </div>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="font-bold text-slate-800 text-lg leading-tight">{teamCombinations[team]?.label || `Team ${team}`}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50/80 text-green-800 rounded-xl">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleUpdateMatch}
                    disabled={!selectedTeam || isLoading}
                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 mr-2" />
                        Update Match
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-2"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleSaveResult}
                  disabled={!selectedTeam || isLoading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving Match...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Save Match Result
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches Display Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent" />
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary/60" />
              </div>
              <p className="text-lg font-semibold mb-2 text-foreground">No matches logged yet</p>
              <p className="text-sm text-muted-foreground">Start by logging your first match above</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayMatches.map((match, index) => {
                const TeamIcon = getTeamIcon(match.winningTeam)
                const isWinningTeam = true // This match shows the winning team
                return (
                  <Card
                    key={match.id}
                    className={cn(
                      "border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group rounded-xl",
                      isWinningTeam && "ring-2 ring-primary/20"
                    )}
                  >
                    <div className={cn("h-2 bg-gradient-to-r", {
                      "from-purple-500 to-pink-500": match.winningTeam === "A",
                      "from-blue-500 to-cyan-500": match.winningTeam === "B", 
                      "from-yellow-500 to-orange-500": match.winningTeam === "C",
                      "from-green-500 to-emerald-500": match.winningTeam === "D",
                      "from-pink-500 to-rose-500": match.winningTeam === "E"
                    })} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-medium mb-2 rounded-lg">
                            Match {index + 1}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                            onClick={() => handleEditMatch(match)}
                            disabled={isLoading}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors"
                            onClick={() => handleDeleteMatch(match.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-primary">
                          🏆 {getTeamDisplay(match.winningTeam)}
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
