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
  describerIsPlayer1: boolean
  clockSeconds: number
  roundWins: number
  totalRemainingTime: number
  totalCorrect: number
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
  activeTeamIndex: number
  results: RoundResultEntry[]
}

export interface GameState {
  phase: Phase
  teams: Team[]
  config: Config
  currentRound: number
  round: RoundState | null
  currentWord: string
  deck: string[]
  discard: string[]
  pausedFrom: Phase | null
}
