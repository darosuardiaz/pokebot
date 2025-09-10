"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { typeColors } from "@/lib/constants"

const typeChart = {
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

export function TypeEffectivenessChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Type Effectiveness Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(typeChart).map(([type, effectiveness]) => (
            <div key={type} className="space-y-2 p-3 border-2 border-gray-300 rounded-lg bg-white/50">
              <Badge className={`${typeColors[type]} text-white w-full justify-center`}>{type.toUpperCase()}</Badge>

              {effectiveness.strong.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-600 mb-1">Strong Against:</p>
                  <div className="flex flex-wrap gap-1">
                    {effectiveness.strong.map((strongType) => (
                      <Badge key={strongType} variant="outline" className="text-xs border-green-500 text-green-600">
                        {strongType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {effectiveness.weak.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">Weak Against:</p>
                  <div className="flex flex-wrap gap-1">
                    {effectiveness.weak.map((weakType) => (
                      <Badge key={weakType} variant="outline" className="text-xs border-red-500 text-red-600">
                        {weakType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {effectiveness.immune && effectiveness.immune.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Immune To:</p>
                  <div className="flex flex-wrap gap-1">
                    {effectiveness.immune.map((immuneType) => (
                      <Badge key={immuneType} variant="outline" className="text-xs border-gray-500 text-gray-600">
                        {immuneType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
