"use client"

import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import type { PokemonData } from "@/lib/services/pokeapi"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  setSelectedPokemon1,
  setSelectedPokemon2,
  setIsLoading,
} from "@/lib/features/battle/battleSlice"
import { simulatePokemonBattle } from "@/lib/tools/battle-simulator"

interface SingleBattleProps {
  onBattleStart: (result: any) => void
}

export function SingleBattle({ onBattleStart }: SingleBattleProps) {
  const dispatch = useAppDispatch()
  const { battleTeam } = useAppSelector((state) => state.pokemon)
  const { selectedPokemon1, selectedPokemon2, isLoading } = useAppSelector((state) => state.battle)

  const handleSingleBattle = async () => {
    if (!selectedPokemon1 || !selectedPokemon2) return

    dispatch(setIsLoading(true))
    try {
      const result = await simulatePokemonBattle(selectedPokemon1.name, selectedPokemon2.name)
      onBattleStart(result)
    } catch (_error) {
      // Handle battle error
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  return (
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
                onClick={() => dispatch(setSelectedPokemon1(pokemon as unknown as PokemonData))}
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
                onClick={() => dispatch(setSelectedPokemon2(pokemon as unknown as PokemonData))}
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
  )
}