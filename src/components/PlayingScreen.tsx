import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { teamColor, teamGradient } from '../game/palette'
import { PauseButton } from './ui/PauseButton'

const SKIP_COOLDOWN = 3

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Evenly places `total` seats around a circle, starting from the top.
function seatStyle(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const r = 42
  const left = 50 + r * Math.cos(angle)
  const top = 50 + r * Math.sin(angle)
  return { left: `${left}%`, top: `${top}%` }
}

export function PlayingScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const [cooldown, setCooldown] = useState(0)
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [dispatch])

  useEffect(() => () => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current)
  }, [])

  const activeIndex = state.round?.activeTeamIndex ?? 0
  const activeTeam = state.teams[activeIndex]
  const low = (activeTeam?.clockSeconds ?? 0) <= 10
  const accent = activeTeam ? teamColor(activeTeam.colorIndex) : { from: '#e879f9', to: '#c026d3' }

  const seats = state.teams.flatMap((t, ti) => [
    { team: t, teamIndex: ti, isPlayer1: true, name: t.player1 },
    { team: t, teamIndex: ti, isPlayer1: false, name: t.player2 },
  ])

  function handleSkip() {
    dispatch({ type: 'SKIP' })
    if (cooldownTimer.current) clearInterval(cooldownTimer.current)
    setCooldown(SKIP_COOLDOWN)
    cooldownTimer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex min-h-dvh w-full flex-col items-center gap-5 px-5 pb-8 pt-10"
      style={{ background: `radial-gradient(circle at 50% 0%, ${accent.from}22, transparent 60%)` }}
    >
      <PauseButton dispatch={dispatch} />

      {/* round table: players seated around it, word on top */}
      <div className="relative aspect-square w-full max-w-sm">
        <div className="absolute inset-[14%] rounded-full bg-gradient-to-br from-amber-900/40 to-amber-950/60 shadow-2xl ring-4 ring-amber-950/30" />

        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-1 px-6 text-center">
            <motion.span
              animate={
                low ? { scale: [1, 1.08, 1], color: ['#f87171', '#ef4444', '#f87171'] } : { scale: 1, color: '#fde68a' }
              }
              transition={{ duration: 0.8, repeat: low ? Infinity : 0 }}
              className="text-2xl font-black tabular-nums"
            >
              {formatTime(activeTeam?.clockSeconds ?? 0)}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.span
                key={state.currentWord}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="text-2xl font-black text-white sm:text-3xl"
              >
                {state.currentWord}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {seats.map((seat, i) => {
          const isActive = seat.teamIndex === activeIndex
          const isDescriber = isActive && seat.isPlayer1 === seat.team.describerIsPlayer1
          const isGuesser = isActive && !isDescriber
          return (
            <motion.div
              key={`${seat.team.id}-${seat.isPlayer1}`}
              animate={{ scale: isDescriber ? 1.18 : 1, opacity: isActive ? 1 : 0.55 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={seatStyle(i, seats.length)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full text-sm font-black text-white shadow-lg ${
                  isDescriber ? 'ring-4 ring-white/80' : isGuesser ? 'ring-2 ring-white/40' : ''
                }`}
                style={{ backgroundImage: teamGradient(seat.teamIndex) }}
              >
                {seat.name.trim().charAt(0) || '?'}
              </span>
              <span className="max-w-16 truncate text-[11px] font-bold text-white/80">{seat.name}</span>
              {isDescriber && <span className="text-[10px] font-bold text-white/60">داره می‌گه</span>}
            </motion.div>
          )
        })}
      </div>

      {/* mini scoreboard */}
      <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
        {state.teams.map((t, i) => (
          <span
            key={t.id}
            className={`rounded-full px-3 py-1.5 text-xs font-bold tabular-nums ${
              i === activeIndex ? 'text-white shadow-md' : 'bg-white/5 text-white/50'
            }`}
            style={i === activeIndex ? { backgroundImage: teamGradient(t.colorIndex) } : undefined}
          >
            {t.name} · {formatTime(t.clockSeconds)}
          </span>
        ))}
      </div>

      <div className="mt-auto grid w-full max-w-md grid-cols-2 gap-4">
        <motion.button
          type="button"
          whileTap={cooldown === 0 ? { scale: 0.94 } : undefined}
          disabled={cooldown > 0}
          onClick={handleSkip}
          className="rounded-3xl bg-white/10 py-6 text-xl font-black text-white/80 shadow-lg disabled:opacity-30"
        >
          {cooldown > 0 ? `⏳ ${cooldown}` : '🔁 عوض کن'}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => dispatch({ type: 'CORRECT' })}
          className="rounded-3xl bg-gradient-to-l from-emerald-400 to-teal-500 py-6 text-2xl font-black text-white shadow-lg shadow-emerald-900/40"
        >
          ✅ درسته
        </motion.button>
      </div>
    </motion.div>
  )
}
