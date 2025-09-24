"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Zap, Loader2 } from "lucide-react"
import { getPlayerRankings, getAllMatches, type PlayerRanking } from "@/lib/supabaseClient"

interface StatsData {
  totalMatches: number
  activePlayers: number
  avgMatchesPerWeek: number
  longestStreak: number
  playerWins: Array<{ player: string; wins: number; color: string }>
  winStreaks: Array<{ player: string; currentStreak: number; longestStreak: number }>
  headToHead: Array<{ matchup: string; p1Wins: number; p2Wins: number }>
}

export function StatsView() {
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get player rankings for basic stats
        const rankings = await getPlayerRankings()
        
        // Get all matches for additional calculations
        const allMatches = await getAllMatches()
        
        // Calculate total matches
        const totalMatches = allMatches.length
        
        // Calculate active players
        const activePlayers = rankings.length
        
        // Calculate longest streak (using max wins)
        const longestStreak = rankings.length > 0 ? Math.max(...rankings.map(r => r.wins)) : 0
        
        // Prepare player wins data with percentage
        const colors = ["bg-primary", "bg-accent", "bg-chart-3", "bg-chart-4"]
        const playerWins = rankings.map((player, index) => ({
          player: player.name,
          wins: player.wins,
          percentage: player.win_percentage,
          color: colors[index % colors.length]
        }))
        
        // Calculate actual win streaks for each player
        const winStreaks = rankings.map(player => {
          // Get ALL matches sorted chronologically
          const allMatchesSorted = allMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          
          let currentStreak = 0
          let longestStreak = 0
          let tempStreak = 0
          
          // Process each match chronologically to determine if player won or lost
          for (let i = 0; i < allMatchesSorted.length; i++) {
            const match = allMatchesSorted[i]
            const isPlayerInMatch = match.player1_id === player.id || match.player2_id === player.id
            const didPlayerWin = isPlayerInMatch && match.score === "Won"
            const didPlayerLose = isPlayerInMatch && match.score !== "Won"
            const playerNotInMatch = !isPlayerInMatch
            
            if (didPlayerWin) {
              // Player was in the match and won
              tempStreak++
              longestStreak = Math.max(longestStreak, tempStreak)
            } else if (didPlayerLose || playerNotInMatch) {
              // Player was in the match and lost, OR player was not in the match (gap = loss)
              tempStreak = 0
            }
            // If player was not in the match, we don't increment tempStreak (it stays 0)
          }
          
          // Calculate current streak: count consecutive wins from most recent match backwards
          for (let i = allMatchesSorted.length - 1; i >= 0; i--) {
            const match = allMatchesSorted[i]
            const isPlayerInMatch = match.player1_id === player.id || match.player2_id === player.id
            const didPlayerWin = isPlayerInMatch && match.score === "Won"
            const didPlayerLose = isPlayerInMatch && match.score !== "Won"
            const playerNotInMatch = !isPlayerInMatch
            
            if (didPlayerWin) {
              currentStreak++
            } else if (didPlayerLose || playerNotInMatch) {
              break // Stop counting when we hit a loss or gap
            }
          }
          
          return {
            player: player.name,
            currentStreak,
            longestStreak
          }
        })
        
        // Calculate head-to-head records for specific team combinations
        const headToHead = []
        
        // Get player names for team combinations
        const playerNames = rankings.reduce((acc, player) => {
          acc[player.id] = player.name
          return acc
        }, {} as Record<number, string>)
        
        // Define the specific team combinations with actual player names
        const teamCombinations = [
          { 
            team1: [1, 2], 
            team2: [3, 4], 
            name: `${playerNames[1] || 'Player 1'} + ${playerNames[2] || 'Player 2'} vs ${playerNames[3] || 'Player 3'} + ${playerNames[4] || 'Player 4'}` 
          },
          { 
            team1: [1, 3], 
            team2: [2, 4], 
            name: `${playerNames[1] || 'Player 1'} + ${playerNames[3] || 'Player 3'} vs ${playerNames[2] || 'Player 2'} + ${playerNames[4] || 'Player 4'}` 
          },
          { 
            team1: [1, 4], 
            team2: [2, 3], 
            name: `${playerNames[1] || 'Player 1'} + ${playerNames[4] || 'Player 4'} vs ${playerNames[2] || 'Player 2'} + ${playerNames[3] || 'Player 3'}` 
          }
        ]
        
        teamCombinations.forEach(combo => {
          let team1Wins = 0
          let team2Wins = 0
          
          allMatches.forEach(match => {
            const matchTeam = [match.player1_id, match.player2_id].sort()
            
            // Check if this match involves these specific teams
            const isTeam1 = (matchTeam[0] === combo.team1[0] && matchTeam[1] === combo.team1[1]) ||
                           (matchTeam[0] === combo.team1[1] && matchTeam[1] === combo.team1[0])
            const isTeam2 = (matchTeam[0] === combo.team2[0] && matchTeam[1] === combo.team2[1]) ||
                           (matchTeam[0] === combo.team2[1] && matchTeam[1] === combo.team2[0])
            
            if (isTeam1 || isTeam2) {
              if (match.score === "Won") {
                if (isTeam1) team1Wins++
                else team2Wins++
              } else {
                if (isTeam1) team2Wins++
                else team1Wins++
              }
            }
          })
          
          // Only add if there are actual matches between these teams
          if (team1Wins > 0 || team2Wins > 0) {
            headToHead.push({
              matchup: combo.name,
              p1Wins: team1Wins,
              p2Wins: team2Wins
            })
          }
        })
        
        setStatsData({
          totalMatches,
          activePlayers,
          avgMatchesPerWeek: 0, // Removed this metric
          longestStreak,
          playerWins,
          winStreaks,
          headToHead
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Failed to load statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Statistics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading statistics...</span>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Statistics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
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

  if (!statsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Statistics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">No data available. Start logging matches to see statistics!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const maxPercentage = Math.max(...statsData.playerWins.map((p) => p.percentage))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Statistics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold text-foreground">{statsData.totalMatches}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold text-foreground">{statsData.activePlayers}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-foreground">{statsData.longestStreak}</p>
              </div>
              <Zap className="w-8 h-8 text-chart-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Total Wins Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Total Wins by Player</CardTitle>
            <CardDescription>Cumulative wins across all matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsData.playerWins.map((player) => (
                <div key={player.player} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{player.player}</span>
                    <div className="flex items-center gap-2">
                    <Badge variant="secondary">{player.wins} wins</Badge>
                      <span className="text-sm font-semibold text-primary">{player.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${player.color} transition-all duration-500`}
                      style={{ width: `${player.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Win Streaks */}
        <Card>
          <CardHeader>
            <CardTitle>Win Streaks</CardTitle>
            <CardDescription>Current and longest winning streaks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsData.winStreaks.map((streak) => (
                <div key={streak.player} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{streak.player}</p>
                    <p className="text-xs text-muted-foreground">Current: {streak.currentStreak} wins</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Best: {streak.longestStreak}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Head-to-Head */}
      <Card>
        <CardHeader>
          <CardTitle>Head-to-Head Records</CardTitle>
          <CardDescription>Win-loss records between players</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statsData.headToHead.map((h2h) => (
              <div key={h2h.matchup} className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-3">{h2h.matchup}</h4>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{h2h.p1Wins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">vs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-accent">{h2h.p2Wins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
