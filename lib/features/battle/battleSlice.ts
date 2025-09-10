
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { PokemonData } from "@/lib/types"
import type { TeamBattleResult } from "@/lib/tools/battle-simulator"

export interface SingleBattleResult {
  winner: string
  loser: string
  winnerStats: PokemonData
  loserStats: PokemonData
  battleAnalysis: string
  typeAdvantage: string | null
}

interface BattleState {
  selectedPokemon1: PokemonData | null
  selectedPokemon2: PokemonData | null
  battleResult: SingleBattleResult | null
  teamBattleResult: TeamBattleResult | null
  isLoading: boolean
  battleMode: "single" | "team"
}

const initialState: BattleState = {
  selectedPokemon1: null,
  selectedPokemon2: null,
  battleResult: null,
  teamBattleResult: null,
  isLoading: false,
  battleMode: "single",
}

const battleSlice = createSlice({
  name: "battle",
  initialState,
  reducers: {
    setSelectedPokemon1: (state, action: PayloadAction<PokemonData | null>) => {
      state.selectedPokemon1 = action.payload
    },
    setSelectedPokemon2: (state, action: PayloadAction<PokemonData | null>) => {
      state.selectedPokemon2 = action.payload
    },
    setBattleResult: (state, action: PayloadAction<SingleBattleResult | null>) => {
      state.battleResult = action.payload
      state.teamBattleResult = null
    },
    setTeamBattleResult: (state, action: PayloadAction<TeamBattleResult | null>) => {
      state.teamBattleResult = action.payload
      state.battleResult = null
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setBattleMode: (state, action: PayloadAction<"single" | "team">) => {
      state.battleMode = action.payload
    },
    resetBattle: (state) => {
      state.selectedPokemon1 = null
      state.selectedPokemon2 = null
      state.battleResult = null
      state.teamBattleResult = null
      state.isLoading = false
    },
  },
})

export const {
  setSelectedPokemon1,
  setSelectedPokemon2,
  setBattleResult,
  setTeamBattleResult,
  setIsLoading,
  setBattleMode,
  resetBattle,
} = battleSlice.actions

export default battleSlice.reducer