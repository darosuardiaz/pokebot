export interface PokemonData {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: {
    front_default: string
    front_shiny?: string
    back_default?: string
    back_shiny?: string
  }
  types: Array<{
    slot: number
    type: {
      name: string
      url: string
    }
  }>
  stats: Array<{
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }>
}

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

export interface EvolutionChain {
  id: number
  chain: {
    species: {
      name: string
      url: string
    }
    evolves_to: Array<{
      species: {
        name: string
        url: string
      }
      evolution_details: Array<{
        min_level?: number
        trigger: {
          name: string
        }
        item?: {
          name: string
        }
      }>
      evolves_to: EvolutionChain["chain"]["evolves_to"]
    }>
  }
}

export interface PokemonMove {
  name: string
  accuracy: number | null
  power: number | null
  pp: number
  type: {
    name: string
  }
  damage_class: {
    name: string
  }
  effect_entries: Array<{
    effect: string
    language: {
      name: string
    }
  }>
}

export interface PokemonSpeciesData {
  id: number
  name: string
  flavor_text_entries: Array<{
    flavor_text: string
    language: {
      name: string
    }
    version: {
      name: string
    }
  }>
  evolution_chain: {
    url: string
  }
  genera: Array<{
    genus: string
    language: {
      name: string
    }
  }>
  habitat?: {
    name: string
  }
  color: {
    name: string
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