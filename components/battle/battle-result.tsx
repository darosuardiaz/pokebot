"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { typeColors } from "@/lib/constants"
import { useAppSelector } from "@/lib/hooks"

export function BattleResult() {
  const { battleResult, teamBattleResult } = useAppSelector((state) => state.battle)

  if (!battleResult && !teamBattleResult) {
    return null
  }

  return (
    <>
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
    </>
  )
}