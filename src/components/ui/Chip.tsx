import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  active: boolean
  onClick: () => void
  children: ReactNode
  danger?: boolean
}

export function Chip({ active, onClick, children, danger }: Props) {
  const activeClasses = danger
    ? 'bg-gradient-to-l from-rose-500 to-red-600 text-white shadow-md shadow-red-900/40'
    : 'bg-gradient-to-l from-fuchsia-500 to-violet-600 text-white shadow-md shadow-violet-900/40'
  const inactiveClasses = danger
    ? 'bg-red-500/10 text-red-300/80 ring-1 ring-inset ring-red-500/30'
    : 'bg-white/5 text-white/70 ring-1 ring-inset ring-white/10'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
        active ? activeClasses : inactiveClasses
      }`}
    >
      {children}
    </motion.button>
  )
}
