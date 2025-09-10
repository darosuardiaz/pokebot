import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string
    front_shiny?: string
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  height: number
  weight: number
  abilities: Array<{
    ability: {
      name: string
    }
  }>
}

interface PokemonState {
  currentPokemon: Pokemon | null
  favorites: Pokemon[]
  battleTeam: Pokemon[]
  isLoading: boolean
}

const initialState: PokemonState = {
  currentPokemon: null,
  favorites: [],
  battleTeam: [],
  isLoading: false,
}

const pokemonSlice = createSlice({
  name: "pokemon",
  initialState,
  reducers: {
    setCurrentPokemon: (state, action: PayloadAction<Pokemon>) => {
      state.currentPokemon = action.payload
    },
    addToFavorites: (state, action: PayloadAction<Pokemon>) => {
      if (!state.favorites.find((p) => p.id === action.payload.id)) {
        state.favorites.push(action.payload)
      }
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter((p) => p.id !== action.payload)
    },
    addToBattleTeam: (state, action: PayloadAction<Pokemon>) => {
      if (state.battleTeam.length < 6 && !state.battleTeam.find((p) => p.id === action.payload.id)) {
        state.battleTeam.push(action.payload)
      }
    },
    removeFromBattleTeam: (state, action: PayloadAction<number>) => {
      state.battleTeam = state.battleTeam.filter((p) => p.id !== action.payload)
    },
    clearBattleTeam: (state) => {
      state.battleTeam = []
    },
    setPokemonLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setCurrentPokemon,
  addToFavorites,
  removeFromFavorites,
  addToBattleTeam,
  removeFromBattleTeam,
  clearBattleTeam,
  setPokemonLoading,
} = pokemonSlice.actions

export default pokemonSlice.reducer
