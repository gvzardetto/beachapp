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
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${ranking}`
    }
  }

  const getRankingBadge = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold">#{ranking}</Badge>
      case 2:
        return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold">#{ranking}</Badge>
      case 3:
        return <Badge className="bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold">#{ranking}</Badge>
      default:
        return <Badge variant="outline" className="font-bold">#{ranking}</Badge>
    }
  }

  const getPlayerAvatar = (name: string, ranking: number) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
    return (
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg",
        ranking === 1 ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
        ranking === 2 ? "bg-gradient-to-br from-gray-400 to-gray-600" :
        ranking === 3 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
        "bg-gradient-to-br from-slate-400 to-slate-600"
      )}>
        {initials}
      </div>
    )
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
          <div className="space-y-4">
            {rankings.map((player, index) => (
              <Card
                key={player.id}
                className={cn(
                  "border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group rounded-xl",
                  index === 0 && "ring-2 ring-yellow-300 shadow-lg",
                  index === 1 && "ring-2 ring-gray-300 shadow-md",
                  index === 2 && "ring-2 ring-amber-300 shadow-md"
                )}
              >
                <div className={cn("h-3 bg-gradient-to-r", {
                  "from-yellow-400 to-amber-500": player.rank === 1,
                  "from-gray-400 to-gray-500": player.rank === 2,
                  "from-amber-400 to-orange-500": player.rank === 3,
                  "from-slate-400 to-slate-500": player.rank > 3
                })} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getRankingIcon(player.rank)}</div>
                        {getRankingBadge(player.rank)}
                      </div>
                      {getPlayerAvatar(player.name, player.rank)}
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{player.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{player.total_matches} matches</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            <span>{player.wins} wins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        {player.win_percentage.toFixed(1)}%
                      </div>
                      <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden mt-2">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            player.rank === 1 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                            player.rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                            player.rank === 3 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                            "bg-gradient-to-r from-primary to-primary/80"
                          )}
                          style={{ width: `${player.win_percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Player Highlight */}
      {rankings.length > 0 && (
        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-1">
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-t-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-800">🏆 Current Champion</h3>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold px-3 py-1">
                        #{rankings[0].rank}
                      </Badge>
                    </div>
                    <p className="text-lg text-slate-700 mb-2">
                      <span className="font-bold text-2xl bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                        {rankings[0].name}
                      </span> leads with{" "}
                      <span className="font-bold text-yellow-600">{rankings[0].win_percentage.toFixed(1)}%</span> win rate
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>{rankings[0].wins} wins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>{rankings[0].total_matches} matches</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
