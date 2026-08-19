import { useReducer } from 'react'
import { WORD_CATEGORIES } from '../data/words'
import type { Difficulty } from '../types'
import type { GameState, Phase, Team, WordEntry } from './types'

const PROVERB_CATEGORY_ID = 'proverbs'
const PROVERB_BONUS_SECONDS = 10

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool(config: GameState['config']): WordEntry[] {
  const pool: WordEntry[] = []
  for (const cat of WORD_CATEGORIES) {
    if (!config.categoryIds.includes(cat.id)) continue
    for (const diff of config.difficulties) {
      for (const word of cat.words[diff]) pool.push({ word, categoryId: cat.id })
    }
  }
  // Shuffle twice — cheap insurance against any single-pass shuffle bias.
  return shuffle(shuffle(pool))
}

// Draws one word without repeating until the whole pool has been used once.
// When the deck runs dry, the discard pile (already-used words) is
// reshuffled back into a fresh deck.
function drawWord(
  deck: WordEntry[],
  discard: WordEntry[],
): { entry: WordEntry; deck: WordEntry[]; discard: WordEntry[] } {
  let d = [...deck]
  let used = [...discard]
  if (d.length === 0) {
    if (used.length === 0) return { entry: { word: '', categoryId: '' }, deck: d, discard: used }
    d = shuffle(used)
    used = []
  }
  const entry = d.shift() as WordEntry
  return { entry, deck: d, discard: [...used, entry] }
}

function defaultConfig(): GameState['config'] {
  return {
    rounds: 3,
    roundSeconds: 3 * 60,
    categoryIds: WORD_CATEGORIES.filter((c) => c.id !== 'curses').map((c) => c.id),
    difficulties: ['easy', 'medium', 'hard'] as Difficulty[],
  }
}

const initialState: GameState = {
  phase: 'setup',
  teams: [],
  config: defaultConfig(),
  currentRound: 0,
  round: null,
  currentWord: '',
  currentCategoryId: '',
  deck: [],
  discard: [],
  pausedFrom: null,
}

export type Action =
  | { type: 'ADD_TEAM'; player1: string; player2: string }
  | { type: 'REMOVE_TEAM'; id: string }
  | { type: 'SET_ROUNDS'; value: number }
  | { type: 'SET_ROUND_MINUTES'; value: number }
  | { type: 'TOGGLE_CATEGORY'; id: string }
  | { type: 'TOGGLE_DIFFICULTY'; d: Difficulty }
  | { type: 'START_GAME' }
  | { type: 'ROUND_INTRO_DONE' }
  | { type: 'CORRECT' }
  | { type: 'SKIP' }
  | { type: 'TICK' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }

function endRound(state: GameState): GameState {
  if (!state.round) return state
  const results = state.teams.map((t) => ({ teamId: t.id, remainingSeconds: t.clockSeconds }))
  const topRemaining = Math.max(...results.map((r) => r.remainingSeconds))
  const winnerIds = new Set(results.filter((r) => r.remainingSeconds === topRemaining).map((r) => r.teamId))
  const teams = state.teams.map((t) => ({
    ...t,
    roundWins: winnerIds.has(t.id) ? t.roundWins + 1 : t.roundWins,
    totalRemainingTime: t.totalRemainingTime + t.clockSeconds,
  }))
  return { ...state, teams, round: { ...state.round, results }, phase: 'round-result' }
}

// Correct: score the word, flip that team's describer, hand the phone to
// the next team, and — if it was a proverb — add a time bonus first.
function passTurn(state: GameState): GameState {
  if (!state.round) return state
  const activeIndex = state.round.activeTeamIndex
  const bonus = state.currentCategoryId === PROVERB_CATEGORY_ID ? PROVERB_BONUS_SECONDS : 0
  const teams = state.teams.map((t, i) =>
    i === activeIndex
      ? {
          ...t,
          describerIsPlayer1: !t.describerIsPlayer1,
          totalCorrect: t.totalCorrect + 1,
          clockSeconds: t.clockSeconds + bonus,
        }
      : t,
  )
  const nextTeamIndex = (activeIndex + 1) % teams.length
  const { entry, deck, discard } = drawWord(state.deck, state.discard)
  return {
    ...state,
    teams,
    round: { ...state.round, activeTeamIndex: nextTeamIndex },
    currentWord: entry.word,
    currentCategoryId: entry.categoryId,
    deck,
    discard,
    phase: 'playing',
  }
}

// Skip: same describer keeps their turn, just gets a different word.
// (Proverb-skip being penalty-free is enforced in the UI — this just swaps
// the word either way.)
function skipWord(state: GameState): GameState {
  if (!state.round) return state
  const { entry, deck, discard } = drawWord(state.deck, state.discard)
  return { ...state, currentWord: entry.word, currentCategoryId: entry.categoryId, deck, discard }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TEAM': {
      const player1 = action.player1.trim()
      const player2 = action.player2.trim()
      if (!player1 || !player2) return state
      const team: Team = {
        id: crypto.randomUUID(),
        name: `${player1} و ${player2}`,
        player1,
        player2,
        colorIndex: state.teams.length,
        describerIsPlayer1: true,
        clockSeconds: state.config.roundSeconds,
        roundWins: 0,
        totalRemainingTime: 0,
        totalCorrect: 0,
      }
      return { ...state, teams: [...state.teams, team] }
    }
    case 'REMOVE_TEAM':
      return { ...state, teams: state.teams.filter((t) => t.id !== action.id) }
    case 'SET_ROUNDS':
      return { ...state, config: { ...state.config, rounds: clamp(action.value, 1, 10) } }
    case 'SET_ROUND_MINUTES':
      return { ...state, config: { ...state.config, roundSeconds: clamp(action.value, 1, 10) * 60 } }
    case 'TOGGLE_CATEGORY': {
      const has = state.config.categoryIds.includes(action.id)
      return {
        ...state,
        config: {
          ...state.config,
          categoryIds: has
            ? state.config.categoryIds.filter((id) => id !== action.id)
            : [...state.config.categoryIds, action.id],
        },
      }
    }
    case 'TOGGLE_DIFFICULTY': {
      const has = state.config.difficulties.includes(action.d)
      return {
        ...state,
        config: {
          ...state.config,
          difficulties: has
            ? state.config.difficulties.filter((d) => d !== action.d)
            : [...state.config.difficulties, action.d],
        },
      }
    }
    case 'START_GAME':
      return {
        ...state,
        teams: state.teams.map((t) => ({ ...t, roundWins: 0, totalRemainingTime: 0, totalCorrect: 0 })),
        currentRound: 1,
        round: null,
        deck: buildPool(state.config),
        discard: [],
        phase: 'round-intro',
      }
    case 'ROUND_INTRO_DONE': {
      const teams = state.teams.map((t) => ({ ...t, clockSeconds: state.config.roundSeconds }))
      const { entry, deck, discard } = drawWord(state.deck, state.discard)
      return {
        ...state,
        teams,
        round: { roundNumber: state.currentRound, activeTeamIndex: 0, results: [] },
        currentWord: entry.word,
        currentCategoryId: entry.categoryId,
        deck,
        discard,
        phase: 'playing',
      }
    }
    case 'CORRECT':
      return passTurn(state)
    case 'SKIP':
      return skipWord(state)
    case 'TICK': {
      if (state.phase !== 'playing' || !state.round) return state
      const activeIndex = state.round.activeTeamIndex
      const active = state.teams[activeIndex]
      if (active.clockSeconds <= 1) {
        const teams = state.teams.map((t, i) => (i === activeIndex ? { ...t, clockSeconds: 0 } : t))
        return endRound({ ...state, teams })
      }
      const teams = state.teams.map((t, i) =>
        i === activeIndex ? { ...t, clockSeconds: t.clockSeconds - 1 } : t,
      )
      return { ...state, teams }
    }
    case 'NEXT_ROUND': {
      if (state.currentRound < state.config.rounds) {
        return { ...state, currentRound: state.currentRound + 1, round: null, phase: 'round-intro' }
      }
      return { ...state, phase: 'game-result' }
    }
    case 'RESTART':
      return {
        ...state,
        teams: state.teams.map((t) => ({
          ...t,
          roundWins: 0,
          totalRemainingTime: 0,
          totalCorrect: 0,
          clockSeconds: state.config.roundSeconds,
          describerIsPlayer1: true,
        })),
        currentRound: 0,
        round: null,
        deck: [],
        discard: [],
        pausedFrom: null,
        phase: 'setup',
      }
    case 'PAUSE':
      if (state.phase === 'paused' || state.phase === 'setup') return state
      return { ...state, pausedFrom: state.phase, phase: 'paused' }
    case 'RESUME':
      return { ...state, phase: (state.pausedFrom ?? 'setup') as Phase, pausedFrom: null }
    default:
      return state
  }
}

export function useGameState() {
  return useReducer(reducer, initialState)
}
