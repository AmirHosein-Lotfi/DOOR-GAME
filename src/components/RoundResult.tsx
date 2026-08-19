import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { teamGradient } from '../game/palette'
import { PrimaryButton } from './ui/PrimaryButton'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RoundResult({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const round = state.round
  if (!round) return null

  const ranked = [...round.results].sort((a, b) => b.remainingSeconds - a.remainingSeconds)
  const topRemaining = ranked[0]?.remainingSeconds ?? 0
  const isLastRound = state.currentRound >= state.config.rounds

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-10 pt-10"
    >
      <header className="text-center">
        <h1 className="text-3xl font-black text-white">نتیجه راند {round.roundNumber}</h1>
      </header>

      <ul className="flex flex-col gap-3">
        {ranked.map((r, i) => {
          const team = state.teams.find((t) => t.id === r.teamId)
          if (!team) return null
          const isWinner = r.remainingSeconds === topRemaining
          return (
            <motion.li
              key={team.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.2 }}
              className={`flex items-center gap-3 rounded-2xl p-4 ${
                isWinner ? 'bg-white/10 ring-2 ring-amber-400' : 'bg-white/5'
              }`}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-black text-white"
                style={{ backgroundImage: teamGradient(team.colorIndex) }}
              >
                {team.player1.trim().charAt(0) || '?'}
              </span>
              <div className="flex-1">
                <p className="flex items-center gap-1 text-base font-bold text-white">
                  {isWinner && <span>👑</span>}
                  {team.name}
                </p>
                <p className="text-xs font-medium text-white/50">{team.roundWins} برد راند تا الان</p>
              </div>
              <span className="text-lg font-black tabular-nums text-white/90">
                {r.remainingSeconds > 0 ? formatTime(r.remainingSeconds) : '۰:۰۰'}
              </span>
            </motion.li>
          )
        })}
      </ul>

      <div className="mt-auto">
        <PrimaryButton onClick={() => dispatch({ type: 'NEXT_ROUND' })}>
          {isLastRound ? 'نتیجه نهایی' : 'راند بعدی'}
        </PrimaryButton>
      </div>
    </motion.div>
  )
}
