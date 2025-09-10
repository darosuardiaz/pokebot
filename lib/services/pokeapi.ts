import type {
  EvolutionChain,
  PokemonData,
  PokemonMove,
  PokemonSpeciesData,
} from "@/lib/types"

export async function getPokemonData(pokemonName: string): Promise<PokemonData> {
  try {
    if (!pokemonName || typeof pokemonName !== "string") {
      throw new Error("Invalid Pokémon name provided.")
    }

    const cleanName = pokemonName.trim().toLowerCase()

    if (!cleanName) {
      throw new Error("Pokémon name cannot be empty.")
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`)

    if (!response.ok) {
      throw new Error(`Pokémon "${cleanName}" not found`)
    }

    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      base_experience: data.base_experience,
      sprites: {
        front_default: data.sprites.front_default,
        front_shiny: data.sprites.front_shiny,
        back_default: data.sprites.back_default,
        back_shiny: data.sprites.back_shiny,
      },
      types: data.types,
      stats: data.stats,
      abilities: data.abilities,
    }
  } catch (error) {
    throw new Error(`Failed to fetch Pokémon data: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getPokemonSpecies(pokemonId: number): Promise<PokemonSpeciesData> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)

    if (!response.ok) {
      throw new Error(`Pokémon species with ID ${pokemonId} not found`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to fetch Pokémon species data: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getEvolutionChain(evolutionChainUrl: string): Promise<EvolutionChain> {
  try {
    const response = await fetch(evolutionChainUrl)

    if (!response.ok) {
      throw new Error("Evolution chain not found")
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to fetch evolution chain: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getPokemonMove(moveName: string): Promise<PokemonMove> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`)

    if (!response.ok) {
      throw new Error(`Move "${moveName}" not found`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to fetch move data: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}