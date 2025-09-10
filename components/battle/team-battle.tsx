"use client"

import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import type { PokemonData } from "@/lib/services/pokeapi"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setIsLoading } from "@/lib/features/battle/battleSlice"
import { simulateTeamBattle } from "@/lib/tools/battle-simulator"

interface TeamBattleProps {
  onBattleStart: (result: any) => void
}

export function TeamBattle({ onBattleStart }: TeamBattleProps) {
  const dispatch = useAppDispatch()
  const { battleTeam } = useAppSelector((state) => state.pokemon)
  const { isLoading } = useAppSelector((state) => state.battle)

  const handleTeamBattle = async () => {
    if (battleTeam.length < 2) return

    dispatch(setIsLoading(true))
    try {
      const team1 = battleTeam.slice(0, Math.ceil(battleTeam.length / 2))
      const team2 = battleTeam.slice(Math.ceil(battleTeam.length / 2))
      const result = await simulateTeamBattle(team1 as unknown as PokemonData[], team2 as unknown as PokemonData[])
      onBattleStart(result)
    } catch (_error) {
      // Handle team battle error
    } finally {
      dispatch(setIsLoading(false))
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