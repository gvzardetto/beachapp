"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Loader2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
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
        return <span className="text-2xl">🥇</span>
      case 2:
        return <span className="text-2xl">🥈</span>
      case 3:
        return <span className="text-2xl">🥉</span>
      default:
        return <Trophy className="w-5 h-5 text-muted-foreground" />
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

      <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-4 text-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent font-bold">
              Leaderboard
            </span>
          </CardTitle>
          <CardDescription className="text-slate-600 text-base mt-1">
            Rankings updated after each match
          </CardDescription>
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
        <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl">
                <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    🏆 Current Champion
                  </h3>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                    #{rankings[0].rank}
                  </Badge>
                </div>
                <p className="text-lg text-slate-700 mb-2">
                  <span className="font-bold text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {rankings[0].name}
                  </span>
                  <span className="mx-2 text-slate-500">leads with</span>
                  <span className="font-bold text-xl text-amber-600">{rankings[0].win_percentage.toFixed(1)}%</span>
                  <span className="text-slate-500 ml-1">win rate</span>
                </p>
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">{rankings[0].wins} wins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">{rankings[0].total_matches} matches</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
