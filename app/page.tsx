"use client"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Search, Sword, Trophy } from "lucide-react"
import { BattleTeam } from "@/components/pokemon/battle-team"
import { BattleArena } from "@/components/battle/battle-arena"
import { TypeEffectivenessChart } from "@/components/battle/type-effectiveness-chart"
import { useState } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("pokedex")

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-600 to-red-700 p-4">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500 rounded-3xl p-6 border-4 border-red-800 relative">
            <div className="absolute top-4 left-4 w-16 h-16 bg-blue-400 rounded-full border-4 border-blue-600 shadow-inner flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-300 rounded-full shadow-inner"></div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full border border-green-600"></div>
              <div className="w-3 h-3 bg-red-400 rounded-full border border-red-600"></div>
            </div>

            <div className="mt-16 text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Pokédex AI</h1>
              <p className="text-red-100">Digital Encyclopedia & Battle Simulator</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("pokedex")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === "pokedex"
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-red-700 text-red-100 hover:bg-red-600"
                }`}
              >
                <Search className="h-4 w-4" />
                Pokédex
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === "team"
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-red-700 text-red-100 hover:bg-red-600"
                }`}
              >
                <Sword className="h-4 w-4" />
                Team
              </button>
              <button
                onClick={() => setActiveTab("battle")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === "battle"
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-red-700 text-red-100 hover:bg-red-600"
                }`}
              >
                <Trophy className="h-4 w-4" />
                Battle
              </button>
            </div>

            <div className="w-full">
              {activeTab === "pokedex" && (
                <div className="space-y-6">
                  <ChatInterface />
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-6 bg-cyan-100 rounded-2xl p-6">
                  <BattleTeam />
                </div>
              )}

              {activeTab === "battle" && (
                <div className="space-y-6 bg-cyan-100 rounded-2xl p-6">
                  <div className="space-y-4">
                    <BattleArena />
                    <TypeEffectivenessChart />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
