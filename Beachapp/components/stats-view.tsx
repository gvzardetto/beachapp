"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Zap, Loader2, Trophy, Target, Activity } from "lucide-react"
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

// Circular Progress Component
const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "primary" }: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColorClass = (color: string) => {
    switch (color) {
      case "primary": return "stroke-primary"
      case "success": return "stroke-green-500"
      case "warning": return "stroke-yellow-500"
      case "danger": return "stroke-red-500"
      default: return "stroke-primary"
    }
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${getColorClass(color)} transition-all duration-1000 ease-in-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  )
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Total Matches</p>
                <p className="text-3xl font-bold text-slate-800">{statsData.totalMatches}</p>
                <p className="text-xs text-slate-600 mt-1">All time matches played</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <CircularProgress 
                percentage={Math.min((statsData.totalMatches / 50) * 100, 100)} 
                size={80} 
                strokeWidth={6}
                color="primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Active Players</p>
                <p className="text-3xl font-bold text-slate-800">{statsData.activePlayers}</p>
                <p className="text-xs text-slate-600 mt-1">Players in the league</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <CircularProgress 
                percentage={Math.min((statsData.activePlayers / 4) * 100, 100)} 
                size={80} 
                strokeWidth={6}
                color="success"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Longest Streak</p>
                <p className="text-3xl font-bold text-slate-800">{statsData.longestStreak}</p>
                <p className="text-xs text-slate-600 mt-1">Consecutive wins</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <CircularProgress 
                percentage={Math.min((statsData.longestStreak / 10) * 100, 100)} 
                size={80} 
                strokeWidth={6}
                color="warning"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Total Wins Chart */}
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="w-6 h-6 text-primary" />
              Total Wins by Player
            </CardTitle>
            <CardDescription>Cumulative wins across all matches</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {statsData.playerWins.map((player, index) => (
                <div key={player.player} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-lg font-semibold text-slate-800">{player.player}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/10 text-primary font-bold px-3 py-1">{player.wins} wins</Badge>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        {player.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-1000 ease-out ${player.color}`}
                      style={{ width: `${player.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Win Streaks */}
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-accent" />
              Win Streaks
            </CardTitle>
            <CardDescription>Current and longest winning streaks</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {statsData.winStreaks.map((streak, index) => (
                <Card key={streak.player} className="border-0 shadow-md rounded-xl bg-gradient-to-r from-slate-50 to-slate-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{streak.player}</p>
                          <p className="text-sm text-slate-600">Current: {streak.currentStreak} wins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white font-bold px-3 py-1">
                          Best: {streak.longestStreak}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center">
                      <CircularProgress 
                        percentage={Math.min((streak.currentStreak / Math.max(streak.longestStreak, 1)) * 100, 100)} 
                        size={60} 
                        strokeWidth={4}
                        color="primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Head-to-Head */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="w-6 h-6 text-primary" />
            Head-to-Head Records
          </CardTitle>
          <CardDescription>Team vs Team matchups and results</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statsData.headToHead.map((h2h) => (
              <Card key={h2h.matchup} className="border-0 shadow-md rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-slate-800 text-lg mb-2">{h2h.matchup}</h4>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                      <span className="font-semibold text-slate-700">Team 1</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">{h2h.p1Wins}</span>
                        <span className="text-sm text-slate-600">wins</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg">
                      <span className="font-semibold text-slate-700">Team 2</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-accent">{h2h.p2Wins}</span>
                        <span className="text-sm text-slate-600">wins</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <CircularProgress 
                      percentage={h2h.p1Wins > 0 ? (h2h.p1Wins / (h2h.p1Wins + h2h.p2Wins)) * 100 : 0} 
                      size={50} 
                      strokeWidth={3}
                      color="primary"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
