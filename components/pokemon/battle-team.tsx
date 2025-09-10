"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Sword } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { removeFromBattleTeam, clearBattleTeam } from "@/lib/features/pokemon/pokemonSlice"
import { typeColors } from "@/lib/constants"

export function BattleTeam() {
  const dispatch = useAppDispatch()
  const { battleTeam } = useAppSelector((state) => state.pokemon)

  const handleRemovePokemon = (pokemonId: number) => {
    dispatch(removeFromBattleTeam(pokemonId))
  }

  const handleClearTeam = () => {
    dispatch(clearBattleTeam())
  }

  if (battleTeam.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Battle Team (0/6)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No Pokémon in your battle team yet. Add some from the search results!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sword className="h-5 w-5" />
          Battle Team ({battleTeam.length}/6)
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleClearTeam}>
          Clear Team
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {battleTeam.map((pokemon) => (
            <div key={pokemon.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={pokemon.sprites.front_default || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h4 className="font-medium capitalize">{pokemon.name}</h4>
                    <div className="flex gap-1">
                      {pokemon.types.map((type) => (
                        <Badge key={type.type.name} className={`${typeColors[type.type.name]} text-white text-xs`}>
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemovePokemon(pokemon.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
