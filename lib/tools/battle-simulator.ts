import { getPokemonData, type PokemonData } from "./pokemon-api"

interface BattleResult {
  winner: string
  loser: string
  winnerStats: PokemonData
  loserStats: PokemonData
  battleAnalysis: string
  typeAdvantage: string | null
}

const typeChart: Record<string, { strong: string[]; weak: string[]; immune?: string[] }> = {
  fire: { strong: ["grass", "ice", "bug", "steel"], weak: ["water", "ground", "rock"] },
  water: { strong: ["fire", "ground", "rock"], weak: ["grass", "electric"] },
  grass: { strong: ["water", "ground", "rock"], weak: ["fire", "ice", "poison", "flying", "bug"] },
  electric: { strong: ["water", "flying"], weak: ["ground"], immune: ["ground"] },
  psychic: { strong: ["fighting", "poison"], weak: ["bug", "ghost", "dark"], immune: ["dark"] },
  ice: { strong: ["grass", "ground", "flying", "dragon"], weak: ["fire", "fighting", "rock", "steel"] },
  dragon: { strong: ["dragon"], weak: ["ice", "dragon", "fairy"], immune: ["fairy"] },
  dark: { strong: ["psychic", "ghost"], weak: ["fighting", "bug", "fairy"] },
  fairy: { strong: ["fighting", "dragon", "dark"], weak: ["poison", "steel"] },
  fighting: {
    strong: ["normal", "ice", "rock", "dark", "steel"],
    weak: ["flying", "psychic", "fairy"],
    immune: ["ghost"],
  },
  poison: { strong: ["grass", "fairy"], weak: ["ground", "psychic"] },
  ground: {
    strong: ["fire", "electric", "poison", "rock", "steel"],
    weak: ["water", "grass", "ice"],
    immune: ["flying"],
  },
  flying: { strong: ["grass", "fighting", "bug"], weak: ["electric", "ice", "rock"] },
  bug: { strong: ["grass", "psychic", "dark"], weak: ["fire", "flying", "rock"] },
  rock: { strong: ["fire", "ice", "flying", "bug"], weak: ["water", "grass", "fighting", "ground", "steel"] },
  ghost: { strong: ["psychic", "ghost"], weak: ["ghost", "dark"], immune: ["normal", "fighting"] },
  steel: { strong: ["ice", "rock", "fairy"], weak: ["fire", "fighting", "ground"] },
  normal: { strong: [], weak: ["fighting"], immune: ["ghost"] },
}

function calculateTypeAdvantage(attacker: string[], defender: string[]): number {
  let multiplier = 1

  for (const attackType of attacker) {
    for (const defenseType of defender) {
      if (typeChart[attackType]?.immune?.includes(defenseType)) {
        multiplier *= 0
      } else if (typeChart[attackType]?.strong.includes(defenseType)) {
        multiplier *= 2
      } else if (typeChart[attackType]?.weak.includes(defenseType)) {
        multiplier *= 0.5
      }
    }
  }

  return multiplier
}

function calculateBattleScore(pokemon: PokemonData, typeMultiplier: number): number {
  const stats = pokemon.stats
  const hp = stats.find((s) => s.stat.name === "hp")?.base_stat || 0
  const attack = stats.find((s) => s.stat.name === "attack")?.base_stat || 0
  const defense = stats.find((s) => s.stat.name === "defense")?.base_stat || 0
  const spAttack = stats.find((s) => s.stat.name === "special-attack")?.base_stat || 0
  const spDefense = stats.find((s) => s.stat.name === "special-defense")?.base_stat || 0
  const speed = stats.find((s) => s.stat.name === "speed")?.base_stat || 0

  // Calculate overall battle power
  const offensivePower = (attack + spAttack) / 2
  const defensivePower = (defense + spDefense) / 2
  const battleScore = (hp + offensivePower + defensivePower + speed) * typeMultiplier

  return battleScore
}

export async function simulatePokemonBattle(pokemon1Name: string, pokemon2Name: string): Promise<BattleResult> {
  try {
    if (!pokemon1Name || typeof pokemon1Name !== 'string') {
      throw new Error('Invalid first Pokémon name provided.');
    }
    if (!pokemon2Name || typeof pokemon2Name !== 'string') {
      throw new Error('Invalid second Pokémon name provided.');
    }
    
    const safePokemon1 = pokemon1Name.trim()
    const safePokemon2 = pokemon2Name.trim()
    
    if (!safePokemon1) {
      throw new Error('First Pokémon name cannot be empty.');
    }
    if (!safePokemon2) {
      throw new Error('Second Pokémon name cannot be empty.');
    }

    const [pokemon1, pokemon2] = await Promise.all([getPokemonData(safePokemon1), getPokemonData(safePokemon2)])

    const pokemon1Types = pokemon1.types.map((t) => t.type.name)
    const pokemon2Types = pokemon2.types.map((t) => t.type.name)

    const pokemon1Advantage = calculateTypeAdvantage(pokemon1Types, pokemon2Types)
    const pokemon2Advantage = calculateTypeAdvantage(pokemon2Types, pokemon1Types)

    const pokemon1Score = calculateBattleScore(pokemon1, pokemon1Advantage)
    const pokemon2Score = calculateBattleScore(pokemon2, pokemon2Advantage)

    const winner = pokemon1Score > pokemon2Score ? pokemon1 : pokemon2
    const loser = pokemon1Score > pokemon2Score ? pokemon2 : pokemon1
    const winnerName = winner.name.charAt(0).toUpperCase() + winner.name.slice(1)
    const loserName = loser.name.charAt(0).toUpperCase() + loser.name.slice(1)

    let typeAdvantage = null
    if (pokemon1Advantage > 1) {
      typeAdvantage = `${pokemon1.name} has type advantage over ${pokemon2.name}`
    } else if (pokemon2Advantage > 1) {
      typeAdvantage = `${pokemon2.name} has type advantage over ${pokemon1.name}`
    }

    const battleAnalysis = `
Battle Analysis:
- ${winnerName} wins with a battle score of ${Math.round(pokemon1Score > pokemon2Score ? pokemon1Score : pokemon2Score)}
- ${loserName} scores ${Math.round(pokemon1Score > pokemon2Score ? pokemon2Score : pokemon1Score)}
- Winner's types: ${winner.types.map((t) => t.type.name).join(", ")}
- Loser's types: ${loser.types.map((t) => t.type.name).join(", ")}
${typeAdvantage ? `- ${typeAdvantage}` : "- No significant type advantage"}
    `.trim()

    return {
      winner: winnerName,
      loser: loserName,
      winnerStats: winner,
      loserStats: loser,
      battleAnalysis,
      typeAdvantage,
    }
  } catch (error) {
    throw new Error(`Battle simulation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export interface TeamBattleResult {
  winningTeam: PokemonData[]
  losingTeam: PokemonData[]
  battleLog: string[]
  totalScore: { team1: number; team2: number }
  mvp: PokemonData
}

export async function simulateTeamBattle(team1: PokemonData[], team2: PokemonData[]): Promise<TeamBattleResult> {
  if (team1.length === 0 || team2.length === 0) {
    throw new Error("Both teams must have at least one Pokémon")
  }

  const battleLog: string[] = []
  let team1Score = 0
  let team2Score = 0
  let mvpScore = 0
  let mvp = team1[0]

  battleLog.push(`Team Battle: ${team1.length} vs ${team2.length} Pokémon`)
  battleLog.push("=".repeat(40))

  // Calculate individual matchups
  for (let i = 0; i < Math.max(team1.length, team2.length); i++) {
    const pokemon1 = team1[i % team1.length]
    const pokemon2 = team2[i % team2.length]

    const pokemon1Types = pokemon1.types.map((t) => t.type.name)
    const pokemon2Types = pokemon2.types.map((t) => t.type.name)

    const pokemon1Advantage = calculateTypeAdvantage(pokemon1Types, pokemon2Types)
    const pokemon2Advantage = calculateTypeAdvantage(pokemon2Types, pokemon1Types)

    const pokemon1BattleScore = calculateBattleScore(pokemon1, pokemon1Advantage)
    const pokemon2BattleScore = calculateBattleScore(pokemon2, pokemon2Advantage)

    team1Score += pokemon1BattleScore
    team2Score += pokemon2BattleScore

    // Track MVP
    if (pokemon1BattleScore > mvpScore) {
      mvpScore = pokemon1BattleScore
      mvp = pokemon1
    }
    if (pokemon2BattleScore > mvpScore) {
      mvpScore = pokemon2BattleScore
      mvp = pokemon2
    }

    const roundWinner = pokemon1BattleScore > pokemon2BattleScore ? pokemon1.name : pokemon2.name
    battleLog.push(
      `Round ${i + 1}: ${pokemon1.name.toUpperCase()} vs ${pokemon2.name.toUpperCase()} - Winner: ${roundWinner.toUpperCase()}`,
    )
  }

  battleLog.push("=".repeat(40))
  battleLog.push(`Final Scores - Team 1: ${Math.round(team1Score)} | Team 2: ${Math.round(team2Score)}`)
  battleLog.push(`MVP: ${mvp.name.toUpperCase()} (Score: ${Math.round(mvpScore)})`)

  return {
    winningTeam: team1Score > team2Score ? team1 : team2,
    losingTeam: team1Score > team2Score ? team2 : team1,
    battleLog,
    totalScore: { team1: Math.round(team1Score), team2: Math.round(team2Score) },
    mvp,
  }
}
