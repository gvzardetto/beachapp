"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Loader2 } from "lucide-react"
import { PLAYERS, type PlayerStats } from "@/lib/types"
import { getPlayerRankings, type PlayerRanking } from "@/lib/supabaseClient"

export function RankingsTable() {
  const [rankings, setRankings] = useState<PlayerRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const playerRankings = await getPlayerRankings()
        setRankings(playerRankings)
      } catch (err) {
        console.error("Error fetching rankings:", err)
        setError("Failed to load rankings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRankings()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Player Rankings</h1>
          <p className="text-muted-foreground">Current standings based on win percentage and matches played</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading rankings...</span>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Player Rankings</h1>
          <p className="text-muted-foreground">Current standings based on win percentage and matches played</p>
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

  if (rankings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Player Rankings</h1>
          <p className="text-muted-foreground">Current standings based on win percentage and matches played</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">No matches played yet. Start logging matches to see rankings!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Trophy className="w-5 h-5 text-accent" />
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />
      case 3:
        return <Award className="w-5 h-5 text-muted-foreground" />
      default:
        return <div className="w-5 h-5" />
    }
  }

  const getRankingBadge = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Badge className="bg-accent text-accent-foreground">#{ranking}</Badge>
      case 2:
        return <Badge variant="secondary">#{ranking}</Badge>
      case 3:
        return <Badge variant="outline">#{ranking}</Badge>
      default:
        return <Badge variant="outline">#{ranking}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Player Rankings</h1>
        <p className="text-muted-foreground">Current standings based on win percentage and matches played</p>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            Leaderboard
          </CardTitle>
          <CardDescription>Rankings updated after each match</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Player</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Matches</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Wins</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Win %</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((player) => (
                  <tr key={player.id} className="border-b border-border/50 hover:bg-muted/30 transition-all duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {getRankingIcon(player.rank)}
                        {getRankingBadge(player.rank)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{player.name}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline" className="rounded-lg">{player.total_matches}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="secondary" className="rounded-lg">{player.wins}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-primary">{player.win_percentage.toFixed(1)}%</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                            style={{ width: `${player.win_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Player Highlight */}
      {rankings.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-sm">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Current Champion</h3>
                <p className="text-muted-foreground">
                  <span className="font-medium text-primary">{rankings[0].name}</span> leads with{" "}
                  {rankings[0].win_percentage.toFixed(1)}% win rate ({rankings[0].wins} wins out of{" "}
                  {rankings[0].total_matches} matches)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
