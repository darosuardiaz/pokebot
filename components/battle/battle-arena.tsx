"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sword, Trophy, Zap, Shield } from "lucide-react"
import { simulatePokemonBattle, simulateTeamBattle, type TeamBattleResult } from "@/lib/tools/battle-simulator"
import { useAppSelector } from "@/lib/hooks"
import type { PokemonData } from "@/lib/tools/pokemon-api"
import { typeColors } from "@/lib/constants"

interface BattleResult {
  winner: string
  loser: string
  winnerStats: PokemonData
  loserStats: PokemonData
  battleAnalysis: string
  typeAdvantage: string | null
}

export function BattleArena() {
  const { battleTeam } = useAppSelector((state) => state.pokemon)
  const [selectedPokemon1, setSelectedPokemon1] = useState<PokemonData | null>(null)
  const [selectedPokemon2, setSelectedPokemon2] = useState<PokemonData | null>(null)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [teamBattleResult, setTeamBattleResult] = useState<TeamBattleResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [battleMode, setBattleMode] = useState<"single" | "team">("single")

  const handleSingleBattle = async () => {
    if (!selectedPokemon1 || !selectedPokemon2) return

    setIsLoading(true)
    try {
      const result = await simulatePokemonBattle(selectedPokemon1.name, selectedPokemon2.name)
      setBattleResult(result)
      setTeamBattleResult(null)
    } catch (_error) {
      // Handle battle error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamBattle = async () => {
    if (battleTeam.length < 2) return

    setIsLoading(true)
    try {
      const team1 = battleTeam.slice(0, Math.ceil(battleTeam.length / 2))
      const team2 = battleTeam.slice(Math.ceil(battleTeam.length / 2))
      const result = await simulateTeamBattle(team1 as unknown as PokemonData[], team2 as unknown as PokemonData[])
      setTeamBattleResult(result)
      setBattleResult(null)
    } catch (_error) {
      // Handle team battle error
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Battle Arena
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={battleMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setBattleMode("single")}
            >
              Single Battle
            </Button>
            <Button
              variant={battleMode === "team" ? "default" : "outline"}
              size="sm"
              onClick={() => setBattleMode("team")}
              disabled={battleTeam.length < 2}
            >
              Team Battle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {battleMode === "single" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Fighter 1</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {battleTeam.map((pokemon) => (
                      <Button
                        key={pokemon.id}
                        variant={selectedPokemon1?.id === pokemon.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPokemon1(pokemon as unknown as PokemonData)}
                        className="justify-start"
                      >
                        <img
                          src={pokemon.sprites.front_default || "/placeholder.svg"}
                          alt={pokemon.name}
                          className="w-6 h-6 mr-2"
                        />
                        {pokemon.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Fighter 2</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {battleTeam.map((pokemon) => (
                      <Button
                        key={pokemon.id}
                        variant={selectedPokemon2?.id === pokemon.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPokemon2(pokemon as unknown as PokemonData)}
                        disabled={selectedPokemon1?.id === pokemon.id}
                        className="justify-start"
                      >
                        <img
                          src={pokemon.sprites.front_default || "/placeholder.svg"}
                          alt={pokemon.name}
                          className="w-6 h-6 mr-2"
                        />
                        {pokemon.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSingleBattle}
                disabled={!selectedPokemon1 || !selectedPokemon2 || isLoading}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? "Battling..." : "Start Battle!"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Team battle will split your current battle team into two teams and simulate a battle between them.
              </p>
              <Button onClick={handleTeamBattle} disabled={battleTeam.length < 2 || isLoading} className="w-full">
                <Trophy className="h-4 w-4 mr-2" />
                {isLoading ? "Battling..." : "Start Team Battle!"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {battleResult && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Battle Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center space-y-2">
                <Badge className="bg-green-500 text-white mb-2">Winner</Badge>
                <img
                  src={battleResult.winnerStats.sprites.front_default || "/placeholder.svg"}
                  alt={battleResult.winner}
                  className="w-24 h-24 mx-auto"
                />
                <h3 className="text-xl font-bold capitalize">{battleResult.winner}</h3>
                <div className="flex gap-1 justify-center">
                  {battleResult.winnerStats.types.map((type) => (
                    <Badge key={type.type.name} className={`${typeColors[type.type.name]} text-white`}>
                      {type.type.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-center space-y-2">
                <Badge variant="secondary" className="mb-2">
                  Defeated
                </Badge>
                <img
                  src={battleResult.loserStats.sprites.front_default || "/placeholder.svg"}
                  alt={battleResult.loser}
                  className="w-24 h-24 mx-auto opacity-50"
                />
                <h3 className="text-xl font-bold capitalize opacity-50">{battleResult.loser}</h3>
                <div className="flex gap-1 justify-center">
                  {battleResult.loserStats.types.map((type) => (
                    <Badge key={type.type.name} variant="outline" className="opacity-50">
                      {type.type.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{battleResult.battleAnalysis}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {teamBattleResult && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Team Battle Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <Badge className="bg-green-500 text-white mb-2">Winning Team</Badge>
                  <div className="flex gap-2">
                    {teamBattleResult.winningTeam.map((pokemon) => (
                      <img
                        key={pokemon.id}
                        src={pokemon.sprites.front_default || "/placeholder.svg"}
                        alt={pokemon.name}
                        className="w-12 h-12"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    Losing Team
                  </Badge>
                  <div className="flex gap-2">
                    {teamBattleResult.losingTeam.map((pokemon) => (
                      <img
                        key={pokemon.id}
                        src={pokemon.sprites.front_default || "/placeholder.svg"}
                        alt={pokemon.name}
                        className="w-12 h-12 opacity-50"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Badge className="bg-yellow-500 text-white">
                  <Trophy className="h-3 w-3 mr-1" />
                  MVP: {teamBattleResult.mvp.name.toUpperCase()}
                </Badge>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  {teamBattleResult.battleLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {battleTeam.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Add some Pokémon to your battle team to start battling!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
