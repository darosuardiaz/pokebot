"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { typeColors, typeChart } from "@/lib/constants"

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
