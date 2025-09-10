export interface BattleResult {
  winner: string
  battleAnalysis: string
}

export function isBattleResult(result: unknown): result is BattleResult {
  return result !== null && typeof result === "object" && "winner" in result && "battleAnalysis" in result
}