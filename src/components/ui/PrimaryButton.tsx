import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'solid' | 'ghost'
  tone?: 'brand' | 'success' | 'neutral'
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  'aria-label'?: string
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  brand: 'bg-gradient-to-l from-fuchsia-500 to-violet-600 shadow-fuchsia-900/40',
  success: 'bg-gradient-to-l from-emerald-400 to-teal-500 shadow-emerald-900/40',
  neutral: 'bg-gradient-to-l from-slate-600 to-slate-700 shadow-slate-950/40',
}

export function PrimaryButton({
  children,
  variant = 'solid',
  tone = 'brand',
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...rest
}: Props) {
  const base =
    'w-full rounded-3xl px-6 py-5 text-lg font-extrabold tracking-tight shadow-lg transition-opacity active:brightness-95 disabled:opacity-40 disabled:shadow-none'
  const skin =
    variant === 'solid'
      ? `text-white ${toneClasses[tone]}`
      : 'border-2 border-white/15 text-white/90 bg-white/5'

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.15 }}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`${base} ${skin} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
