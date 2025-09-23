"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Zap } from "lucide-react"

// Mock statistics data
const playerWins = [
  { player: "Player 1", wins: 18, color: "bg-primary" },
  { player: "Player 2", wins: 14, color: "bg-accent" },
  { player: "Player 3", wins: 11, color: "bg-chart-3" },
  { player: "Player 4", wins: 7, color: "bg-chart-4" },
]

const winStreaks = [
  { player: "Player 1", currentStreak: 5, longestStreak: 8 },
  { player: "Player 2", currentStreak: 2, longestStreak: 6 },
  { player: "Player 3", currentStreak: 0, longestStreak: 4 },
  { player: "Player 4", currentStreak: 1, longestStreak: 3 },
]

const headToHead = [
  { matchup: "Player 1 vs Player 2", p1Wins: 8, p2Wins: 6 },
  { matchup: "Player 1 vs Player 3", p1Wins: 7, p2Wins: 4 },
  { matchup: "Player 1 vs Player 4", p1Wins: 9, p2Wins: 2 },
  { matchup: "Player 2 vs Player 3", p1Wins: 5, p2Wins: 5 },
  { matchup: "Player 2 vs Player 4", p1Wins: 6, p2Wins: 3 },
  { matchup: "Player 3 vs Player 4", p1Wins: 4, p2Wins: 4 },
]

export function StatsView() {
  const maxWins = Math.max(...playerWins.map((p) => p.wins))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Statistics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold text-foreground">84</p>
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
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Matches/Week</p>
                <p className="text-2xl font-bold text-foreground">3.2</p>
              </div>
              <TrendingUp className="w-8 h-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-foreground">8</p>
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
              {playerWins.map((player) => (
                <div key={player.player} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{player.player}</span>
                    <Badge variant="secondary">{player.wins} wins</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${player.color} transition-all duration-500`}
                      style={{ width: `${(player.wins / maxWins) * 100}%` }}
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
              {winStreaks.map((streak) => (
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
            {headToHead.map((h2h) => (
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
