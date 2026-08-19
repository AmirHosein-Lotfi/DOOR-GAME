import type { Difficulty } from '../types'

export type Phase =
  | 'setup'
  | 'round-intro'
  | 'playing'
  | 'round-result'
  | 'game-result'
  | 'paused'

export interface Team {
  id: string
  name: string
  player1: string
  player2: string
  colorIndex: number
  clockSeconds: number
  roundWins: number
  totalRemainingTime: number
  totalCorrect: number
}

export interface Seat {
  teamId: string
  isPlayer1: boolean
}

export interface RoundResultEntry {
  teamId: string
  remainingSeconds: number
}

export interface Config {
  rounds: number
  roundSeconds: number
  categoryIds: string[]
  difficulties: Difficulty[]
}

export interface RoundState {
  roundNumber: number
  activeSeatIndex: number
  results: RoundResultEntry[]
}

export interface WordEntry {
  word: string
  categoryId: string
}

export interface GameState {
  phase: Phase
  teams: Team[]
  config: Config
  currentRound: number
  round: RoundState | null
  currentWord: string
  currentCategoryId: string
  deck: WordEntry[]
  discard: WordEntry[]
  // Clockwise seating order around the table — editable by drag-and-drop so
  // it can match how the group is actually sitting; turn order follows it.
  seatOrder: Seat[]
  pausedFrom: Phase | null
}
