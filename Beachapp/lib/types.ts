export interface Player {
  id: number
  name: string
}

export interface Match {
  id: string
  date: string
  winningTeam: "A" | "B" | "C" | "D" | "E"
  players: {
    teamA: [Player, Player]
    teamB: [Player, Player]
  }
}

export interface PlayerStats {
  player: Player
  matchesPlayed: number
  wins: number
  winPercentage: number
  ranking: number
}

export const PLAYERS: Player[] = [
  { id: 1, name: "Player 1" },
  { id: 2, name: "Player 2" },
  { id: 3, name: "Player 3" },
  { id: 4, name: "Player 4" },
]

// Team combinations for doubles
export const TEAM_COMBINATIONS = {
  A: { players: [PLAYERS[0], PLAYERS[1]], label: "Player 1 + Player 2" },
  B: { players: [PLAYERS[0], PLAYERS[2]], label: "Player 1 + Player 3" },
  C: { players: [PLAYERS[0], PLAYERS[3]], label: "Player 1 + Player 4" },
  D: { players: [PLAYERS[1], PLAYERS[2]], label: "Player 2 + Player 3" },
  E: { players: [PLAYERS[2], PLAYERS[3]], label: "Player 3 + Player 4" },
} as const
