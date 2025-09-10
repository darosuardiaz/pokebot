import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { typeChart } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTypeAdvantage(attacker: string[], defender: string[]): number {
  let multiplier = 1

  for (const attackType of attacker) {
    for (const defenseType of defender) {
      if (typeChart[attackType]?.immune?.includes(defenseType)) {
        multiplier *= 0
      } else if (typeChart[attackType]?.strong.includes(defenseType)) {
        multiplier *= 2
      } else if (typeChart[attackType]?.weak.includes(defenseType)) {
        multiplier *= 0.5
      }
    }
  }

  return multiplier
}
