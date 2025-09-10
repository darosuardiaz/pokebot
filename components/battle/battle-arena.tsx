"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sword, Shield } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  setBattleMode,
  setBattleResult,
  setTeamBattleResult,
  setIsLoading,
} from "@/lib/features/battle/battleSlice"
import type { TeamBattleResult } from "@/lib/tools/battle-simulator"
import type { SingleBattleResult } from "@/lib/features/battle/battleSlice"
import { SingleBattle } from "./single-battle"
import { TeamBattle } from "./team-battle"
import { BattleResult as BattleResultComponent } from "./battle-result"

export function BattleArena() {
  const dispatch = useAppDispatch()
  const { battleTeam } = useAppSelector((state) => state.pokemon)
  const { battleResult, teamBattleResult, isLoading, battleMode } = useAppSelector((state) => state.battle)

  const handleSingleBattleResult = (result: SingleBattleResult) => {
    dispatch(setBattleResult(result))
  }

  const handleTeamBattleResult = (result: TeamBattleResult) => {
    dispatch(setTeamBattleResult(result))
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
              onClick={() => dispatch(setBattleMode("single"))}
            >
              Single Battle
            </Button>
            <Button
              variant={battleMode === "team" ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(setBattleMode("team"))}
              disabled={battleTeam.length < 2}
            >
              Team Battle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {battleMode === "single" ? (
            <SingleBattle onBattleStart={handleSingleBattleResult} />
          ) : (
            <TeamBattle onBattleStart={handleTeamBattleResult} />
          )}
        </CardContent>
      </Card>

      <BattleResultComponent />

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
