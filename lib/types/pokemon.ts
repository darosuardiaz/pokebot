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

export function isPokemonData(result: unknown): result is PokemonData {
  return result !== null && typeof result === "object" && "id" in result && "name" in result && "sprites" in result
}