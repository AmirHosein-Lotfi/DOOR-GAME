import { useEffect } from 'react'
import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { PauseButton } from './ui/PauseButton'

export function RoundIntro({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'ROUND_INTRO_DONE' }), 1800)
    return () => clearTimeout(t)
  }, [dispatch])

  return (
    <motion.button
      type="button"
      onClick={() => dispatch({ type: 'ROUND_INTRO_DONE' })}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="grid min-h-dvh w-full place-items-center bg-gradient-to-br from-violet-700 via-fuchsia-700 to-rose-600 px-6"
    >
      <PauseButton dispatch={dispatch} />
      <motion.div
        initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <span className="text-lg font-bold text-white/70">راند</span>
        <span className="text-8xl font-black text-white drop-shadow-lg">{state.currentRound}</span>
        <span className="text-xl font-bold text-white/70">از {state.config.rounds}</span>
        <span className="mt-6 text-sm font-medium text-white/50">برای ادامه ضربه بزن</span>
      </motion.div>
    </motion.button>
  )
}
