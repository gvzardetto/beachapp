"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import { PLAYERS, type PlayerStats } from "@/lib/types"

// Mock player statistics
const mockPlayerStats: PlayerStats[] = [
  {
    player: PLAYERS[0],
    matchesPlayed: 24,
    wins: 18,
    winPercentage: 75,
    ranking: 1,
  },
  {
    player: PLAYERS[1],
    matchesPlayed: 22,
    wins: 14,
    winPercentage: 63.6,
    ranking: 2,
  },
  {
    player: PLAYERS[2],
    matchesPlayed: 20,
    wins: 11,
    winPercentage: 55,
    ranking: 3,
  },
  {
    player: PLAYERS[3],
    matchesPlayed: 18,
    wins: 7,
    winPercentage: 38.9,
    ranking: 4,
  },
]

export function RankingsTable() {
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
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
                {mockPlayerStats.map((stats) => (
                  <tr key={stats.player.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {getRankingIcon(stats.ranking)}
                        {getRankingBadge(stats.ranking)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{stats.player.name}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline">{stats.matchesPlayed}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="secondary">{stats.wins}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-primary">{stats.winPercentage.toFixed(1)}%</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${stats.winPercentage}%` }}
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
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Current Champion</h3>
              <p className="text-muted-foreground">
                <span className="font-medium text-primary">{mockPlayerStats[0].player.name}</span> leads with{" "}
                {mockPlayerStats[0].winPercentage.toFixed(1)}% win rate ({mockPlayerStats[0].wins} wins out of{" "}
                {mockPlayerStats[0].matchesPlayed} matches)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
