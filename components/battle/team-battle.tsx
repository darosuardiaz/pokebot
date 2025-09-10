"use client"

import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import type { PokemonData } from "@/lib/services/pokeapi"
import { useAppSelector } from "@/lib/hooks"
import { simulateTeamBattle } from "@/lib/tools/battle-simulator"

interface TeamBattleProps {
  onBattleStart: (result: any) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export function TeamBattle({ onBattleStart, isLoading, setIsLoading }: TeamBattleProps) {
  const { battleTeam } = useAppSelector((state) => state.pokemon)

  const handleTeamBattle = async () => {
    if (battleTeam.length < 2) return

    setIsLoading(true)
    try {
      const team1 = battleTeam.slice(0, Math.ceil(battleTeam.length / 2))
      const team2 = battleTeam.slice(Math.ceil(battleTeam.length / 2))
      const result = await simulateTeamBattle(team1 as unknown as PokemonData[], team2 as unknown as PokemonData[])
      onBattleStart(result)
    } catch (_error) {
      // Handle team battle error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Team battle will split your current battle team into two teams and simulate a battle between them.
      </p>
      <Button onClick={handleTeamBattle} disabled={battleTeam.length < 2 || isLoading} className="w-full">
        <Trophy className="h-4 w-4 mr-2" />
        {isLoading ? "Battling..." : "Start Team Battle!"}
      </Button>
    </div>
  )
}