import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set')

if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL is required. Please add it to your .env.local file.\n' +
    'Example: NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please add it to your .env.local file.\n' +
    'Example: NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here'
  )
}

// Check for placeholder values
if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-key')) {
  throw new Error(
    'Please replace the placeholder values in your .env.local file with your actual Supabase credentials.\n' +
    'Go to your Supabase dashboard → Settings → API to get your real URL and key.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function to verify Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase
      .from('matches')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    console.log('Supabase connection successful!')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

/**
 * Updates an existing match in the database
 * @param matchId - The ID of the match to update
 * @param matchData - The updated match data
 * @returns Promise<Match> - The updated match record
 */
export async function updateMatch(matchId: number, matchData: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>): Promise<Match> {
  try {
    console.log('Updating match with ID:', matchId, 'Data:', matchData)
    
    // First, check if the match exists
    const { data: existingMatch, error: checkError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', matchId)
      .single()

    if (checkError) {
      throw new SupabaseError(`Match with ID ${matchId} not found: ${checkError.message}`, checkError)
    }

    // Update the match
    console.log('Supabase update query:', {
      table: 'matches',
      matchId,
      matchData
    })
    
    const { data, error } = await supabase
      .from('matches')
      .update(matchData)
      .eq('id', matchId)
      .select()

    console.log('Supabase update response:', { data, error })

    if (error) {
      // Check for common permission errors
      if (error.message.includes('permission denied') || error.message.includes('policy')) {
        throw new SupabaseError(
          `Database permission error: ${error.message}. Please run the SQL in FIX_DATABASE_PERMISSIONS.md to fix this issue.`,
          error
        )
      }
      throw new SupabaseError(`Failed to update match: ${error.message}`, error)
    }

    if (!data || data.length === 0) {
      // Try to fetch the updated match separately
      const { data: updatedMatch, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      
      if (fetchError || !updatedMatch) {
        throw new SupabaseError('No data returned from match update and failed to fetch updated match')
      }
      
      console.log('Match updated successfully (fetched separately):', updatedMatch)
      return updatedMatch
    }

    console.log('Match updated successfully:', data[0])
    return data[0]
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error updating match', error)
  }
}

/**
 * Deletes a match from the database
 * @param matchId - The ID of the match to delete
 * @returns Promise<boolean> - True if deletion was successful
 */
export async function deleteMatch(matchId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)

    if (error) {
      // Check for common permission errors
      if (error.message.includes('permission denied') || error.message.includes('policy')) {
        throw new SupabaseError(
          `Database permission error: ${error.message}. Please run the SQL in FIX_DATABASE_PERMISSIONS.md to fix this issue.`,
          error
        )
      }
      throw new SupabaseError(`Failed to delete match: ${error.message}`, error)
    }

    return true
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error deleting match', error)
  }
}

/**
 * Fetches all players from the database
 * @returns Promise<Player[]> - Array of all players
 */
export async function getAllPlayers(): Promise<Player[]> {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      throw new SupabaseError(`Failed to fetch players: ${error.message}`, error)
    }

    return players || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error fetching players', error)
  }
}

/**
 * Fetches all matches from the database
 * @returns Promise<Match[]> - Array of all matches
 */
export async function getAllMatches(): Promise<Match[]> {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      throw new SupabaseError(`Failed to fetch all matches: ${error.message}`, error)
    }

    return matches || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error fetching all matches', error)
  }
}

/**
 * Fetches matches for a specific date
 * @param date - The date to fetch matches for (ISO string)
 * @returns Promise<Match[]> - Array of matches for the specified date
 */
export async function getMatchesByDate(date: string): Promise<Match[]> {
  try {
    const startOfDay = new Date(date).toISOString().split('T')[0] + 'T00:00:00.000Z'
    const endOfDay = new Date(date).toISOString().split('T')[0] + 'T23:59:59.999Z'

    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .gte('date', startOfDay)
      .lte('date', endOfDay)
      .order('date', { ascending: true })

    if (error) {
      throw new SupabaseError(`Failed to fetch matches for date: ${error.message}`, error)
    }

    return matches || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error fetching matches by date', error)
  }
}

// TypeScript types
export interface Player {
  id: number
  name: string
}

export interface Match {
  id?: number
  player1_id: number
  player2_id: number
  score: string // e.g., "21-19, 21-17"
  date: string // ISO date string
  created_at?: string
  updated_at?: string
}

export interface PlayerStats {
  id: number
  name: string
  wins: number
  losses: number
  point_difference: number
  total_matches: number
  win_percentage: number
}

export interface PlayerRanking extends PlayerStats {
  rank: number
}

export interface UpcomingMatch {
  id: number
  player1_id: number
  player2_id: number
  player1_name: string
  player2_name: string
  date: string
}

// Error handling utility
class SupabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'SupabaseError'
  }
}

/**
 * Logs a match result to the database
 * @param matchData - The match data to insert
 * @returns Promise<Match> - The inserted match record
 */
export async function logMatch(matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<Match> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single()

    if (error) {
      throw new SupabaseError(`Failed to log match: ${error.message}`, error)
    }

    if (!data) {
      throw new SupabaseError('No data returned from match insertion')
    }

    return data
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error logging match', error)
  }
}

/**
 * Calculates and returns player rankings based on matches
 * Rankings are based on wins, then point difference
 * @returns Promise<PlayerRanking[]> - Array of players sorted by rank
 */
export async function getPlayerRankings(): Promise<PlayerRanking[]> {
  try {
    // First, get all matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')

    if (matchesError) {
      throw new SupabaseError(`Failed to fetch matches: ${matchesError.message}`, matchesError)
    }

    if (!matches || matches.length === 0) {
      return []
    }

    // Get all unique players
    const playerIds = new Set<number>()
    matches.forEach((match: any) => {
      playerIds.add(match.player1_id)
      playerIds.add(match.player2_id)
    })

    // Get player names from players table (if it exists)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name')
      .in('id', Array.from(playerIds))

    // Create player name mapping (handle case where players table doesn't exist)
    const playerMap = new Map<number, string>()
    if (!playersError && players) {
      players.forEach((player: any) => {
        playerMap.set(player.id, player.name)
      })
    }

    // Calculate stats for each player
    const playerStats = new Map<number, {
      name: string
      wins: number
      losses: number
      point_difference: number
      total_matches: number
    }>()

    // Initialize all players
    playerIds.forEach(id => {
      const name = playerMap.get(id) || `Player ${id}`
      playerStats.set(id, {
        name,
        wins: 0,
        losses: 0,
        point_difference: 0,
        total_matches: 0
      })
    })

    // Get total number of matches (count of all rows in matches table)
    const totalMatches = matches.length

    // Process each match - count wins/losses for each player
    matches.forEach((match: any) => {
      const player1Stats = playerStats.get(match.player1_id)!
      const player2Stats = playerStats.get(match.player2_id)!

      // In doubles, both players on the winning team get a win
      if (match.score === "Won") {
        // Player1 team won - both players get a win
        player1Stats.wins++
        player2Stats.wins++
        player1Stats.point_difference += 1
        player2Stats.point_difference += 1
      } else {
        // Player1 team lost - both players get a loss
        player1Stats.losses++
        player2Stats.losses++
        player1Stats.point_difference -= 1
        player2Stats.point_difference -= 1
      }
    })

    // Set total matches for all players (same for everyone - total rows in matches table)
    playerStats.forEach((stats) => {
      stats.total_matches = totalMatches
    })

    // Convert to rankings array and sort
    const rankings: PlayerRanking[] = Array.from(playerStats.entries()).map(([id, stats]) => ({
      id,
      ...stats,
      win_percentage: totalMatches > 0 ? (stats.wins / totalMatches) * 100 : 0,
      rank: 0 // Will be set after sorting
    }))

    // Sort by wins (descending), then by point difference (descending)
    rankings.sort((a, b) => {
      if (a.wins !== b.wins) {
        return b.wins - a.wins
      }
      return b.point_difference - a.point_difference
    })

    // Assign ranks
    rankings.forEach((player, index) => {
      player.rank = index + 1
    })

    return rankings
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error calculating rankings', error)
  }
}

/**
 * Fetches upcoming matches scheduled in the future
 * @returns Promise<UpcomingMatch[]> - Array of upcoming matches with player names
 */
export async function getUpcomingMatches(): Promise<UpcomingMatch[]> {
  try {
    const currentDate = new Date().toISOString()

    // First, get all upcoming matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, player1_id, player2_id, date')
      .gte('date', currentDate)
      .order('date', { ascending: true })

    if (matchesError) {
      throw new SupabaseError(`Failed to fetch upcoming matches: ${matchesError.message}`, matchesError)
    }

    if (!matches || matches.length === 0) {
      return []
    }

    // Get all unique player IDs from upcoming matches
    const playerIds = new Set<number>()
    matches.forEach((match: any) => {
      playerIds.add(match.player1_id)
      playerIds.add(match.player2_id)
    })

    // Fetch player names from players table
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name')
      .in('id', Array.from(playerIds))

    // Create player name mapping (handle case where players table doesn't exist)
    const playerMap = new Map<number, string>()
    if (!playersError && players) {
      players.forEach((player: any) => {
        playerMap.set(player.id, player.name)
      })
    }

    // Transform the data to match our interface
    const upcomingMatches: UpcomingMatch[] = matches.map((match: any) => ({
      id: match.id,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      player1_name: playerMap.get(match.player1_id) || `Player ${match.player1_id}`,
      player2_name: playerMap.get(match.player2_id) || `Player ${match.player2_id}`,
      date: match.date
    }))

    return upcomingMatches
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('Unexpected error fetching upcoming matches', error)
  }
}

// All functions and types are already exported above
