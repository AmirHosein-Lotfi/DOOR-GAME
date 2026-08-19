import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { PrimaryButton } from './ui/PrimaryButton'

export function PausedOverlay({ dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-8 bg-slate-950/95 px-6 text-center"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">⏸</span>
        <h1 className="text-2xl font-black text-white">بازی متوقف شد</h1>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <PrimaryButton tone="success" onClick={() => dispatch({ type: 'RESUME' })}>
          ادامه بازی
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={() => dispatch({ type: 'RESTART' })}>
          پایان بازی و بازگشت به منو
        </PrimaryButton>
      </div>
    </motion.div>
  )
}
