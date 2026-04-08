export interface HSB {
  h: number // 0-360
  s: number // 0-100
  b: number // 0-100
}

export interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

export interface Lab {
  L: number // 0-100
  a: number // ~-128 to 128
  b: number // ~-128 to 128
}

export type GameScreen =
  | "intro"
  | "countdown"
  | "memorize"
  | "fade-to-black"
  | "picker"
  | "result"
  | "total"

export type GameMode = "easy" | "hard"

export interface RoundResult {
  targetHsb: HSB
  playerHsb: HSB
  score: number
}

export interface GameState {
  screen: GameScreen
  mode: GameMode
  round: number
  totalRounds: number
  targetHsb: HSB
  pickerHsb: HSB
  roundScores: RoundResult[]
  totalScore: number
  countdownStep: number // 0=ready, 1=set, 2=go
  memorizeTimeLeft: number
  isPlaying: boolean
}
