import { motion } from 'framer-motion'
import type { Dispatch } from 'react'
import type { Action } from '../../game/useGameState'

export function PauseButton({ dispatch }: { dispatch: Dispatch<Action> }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation()
        dispatch({ type: 'PAUSE' })
      }}
      aria-label="توقف بازی"
      className="fixed left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-lg text-white/80 backdrop-blur"
    >
      ⏸
    </motion.button>
  )
}
