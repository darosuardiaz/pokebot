"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Heart, Sword } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addToFavorites, removeFromFavorites, addToBattleTeam } from "@/lib/features/pokemon/pokemonSlice"
import type { PokemonData } from "@/lib/tools/pokemon-api"
import { typeColors } from "@/lib/constants"

interface PokemonCardProps {
  pokemon: PokemonData
  showActions?: boolean
}


const statNames: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
}

export function PokemonCard({ pokemon, showActions = true }: PokemonCardProps) {
  const dispatch = useAppDispatch()
  const { favorites, battleTeam } = useAppSelector((state) => state.pokemon)

  const isFavorite = favorites.some((p) => p.id === pokemon.id)
  const isInBattleTeam = battleTeam.some((p) => p.id === pokemon.id)

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(pokemon.id))
    } else {
      dispatch(addToFavorites(pokemon))
    }
  }

  const handleAddToBattleTeam = () => {
    dispatch(addToBattleTeam(pokemon))
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="relative">
          <img
            src={pokemon.sprites.front_default || "/placeholder.svg"}
            alt={pokemon.name}
            className="w-32 h-32 mx-auto object-contain"
          />
          {showActions && (
            <Button variant="ghost" size="sm" className="absolute top-0 right-0" onClick={handleToggleFavorite}>
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          )}
        </div>
        <CardTitle className="capitalize text-2xl">{pokemon.name}</CardTitle>
        <div className="flex gap-2 justify-center">
          {pokemon.types.map((type) => (
            <Badge key={type.type.name} className={`${typeColors[type.type.name]} text-white`}>
              {type.type.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Height:</span> {pokemon.height / 10}m
          </div>
          <div>
            <span className="font-medium">Weight:</span> {pokemon.weight / 10}kg
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Base Stats</h4>
          {pokemon.stats.map((stat) => (
            <div key={stat.stat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{statNames[stat.stat.name]}</span>
                <span>{stat.base_stat}</span>
              </div>
              <Progress value={(stat.base_stat / 255) * 100} className="h-2" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Abilities</h4>
          <div className="flex flex-wrap gap-1">
            {pokemon.abilities.map((ability) => (
              <Badge key={ability.ability.name} variant="outline" className="text-xs">
                {ability.ability.name.replace("-", " ")}
                {ability.is_hidden && " (Hidden)"}
              </Badge>
            ))}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={handleAddToBattleTeam}
              disabled={isInBattleTeam || battleTeam.length >= 6}
            >
              <Sword className="h-4 w-4 mr-1" />
              {isInBattleTeam ? "In Team" : "Add to Team"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
