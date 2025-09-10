"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sword, Shield } from "lucide-react"
import type { TeamBattleResult } from "@/lib/tools/battle-simulator"
import { useAppSelector } from "@/lib/hooks"
import type { PokemonData } from "@/lib/services/pokeapi"
import { SingleBattle } from "./single-battle"
import { TeamBattle } from "./team-battle"
import { BattleResult as BattleResultComponent } from "./battle-result"

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
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [teamBattleResult, setTeamBattleResult] = useState<TeamBattleResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [battleMode, setBattleMode] = useState<"single" | "team">("single")

  const handleSingleBattleResult = (result: BattleResult) => {
    setBattleResult(result)
    setTeamBattleResult(null)
  }

  const handleTeamBattleResult = (result: TeamBattleResult) => {
    setTeamBattleResult(result)
    setBattleResult(null)
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
            <SingleBattle
              onBattleStart={handleSingleBattleResult}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <TeamBattle
              onBattleStart={handleTeamBattleResult}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </CardContent>
      </Card>

      <BattleResultComponent battleResult={battleResult} teamBattleResult={teamBattleResult} />

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
