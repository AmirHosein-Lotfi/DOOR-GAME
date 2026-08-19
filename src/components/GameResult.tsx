import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { teamGradient, teamColor } from '../game/palette'
import { PrimaryButton } from './ui/PrimaryButton'

const CONFETTI_COLORS = ['#fb7185', '#fbbf24', '#34d399', '#22d3ee', '#a78bfa', '#f472b6']

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => i)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.4
        const duration = 1.4 + Math.random() * 1
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        return (
          <motion.span
            key={i}
            initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: 500, opacity: 0, rotate: 360 }}
            transition={{ delay, duration, ease: 'easeIn' }}
            style={{ left: `${left}%`, backgroundColor: color }}
            className="absolute top-0 h-2.5 w-2.5 rounded-sm"
          />
        )
      })}
    </div>
  )
}

export function GameResult({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const ranked = [...state.teams].sort(
    (a, b) => b.roundWins - a.roundWins || b.totalRemainingTime - a.totalRemainingTime,
  )
  const winner = ranked[0]
  const winners = ranked.filter(
    (t) => t.roundWins === winner?.roundWins && t.totalRemainingTime === winner?.totalRemainingTime,
  )
  const winnerIds = new Set(winners.map((t) => t.id))
  const accent = winner ? teamColor(winner.colorIndex) : { from: '#fbbf24', to: '#d97706' }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 overflow-hidden px-5 pb-10 pt-10"
      style={{ background: `radial-gradient(circle at 50% 0%, ${accent.from}33, transparent 55%)` }}
    >
      <Confetti />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.15 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <span className="text-6xl">🏆</span>
        <p className="text-sm font-bold text-white/60">برنده بازی</p>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">
          {winners.map((t) => t.name).join(' و ')}
        </h1>
      </motion.div>

      <ul className="mt-2 flex flex-col gap-3">
        {ranked.map((team, i) => (
          <motion.li
            key={team.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.06, duration: 0.2 }}
            className={`flex items-center gap-3 rounded-2xl p-4 ${
              winnerIds.has(team.id) ? 'bg-white/10 ring-2 ring-amber-400' : 'bg-white/5'
            }`}
          >
            <span className="w-6 text-center text-sm font-black text-white/50">{i + 1}</span>
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-black text-white"
              style={{ backgroundImage: teamGradient(team.colorIndex) }}
            >
              {team.name.trim().charAt(0) || '?'}
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-1 text-base font-bold text-white">
                {winnerIds.has(team.id) && <span>👑</span>}
                {team.name}
              </p>
              <p className="text-xs font-medium text-white/50">
                {team.roundWins} برد راند · {team.totalCorrect} کلمه درست
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto">
        <PrimaryButton onClick={() => dispatch({ type: 'RESTART' })}>بازی دوباره</PrimaryButton>
      </div>
    </motion.div>
  )
}
