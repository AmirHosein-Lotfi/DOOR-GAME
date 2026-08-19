import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number
  min: number
  max: number
  suffix?: string
  onChange: (v: number) => void
}

export function Stepper({ label, value, min, max, suffix, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl font-bold text-white disabled:opacity-30"
          aria-label={`کم کردن ${label}`}
        >
          −
        </motion.button>
        <span className="w-14 text-center text-xl font-black tabular-nums text-white">
          {value}
          {suffix ? <span className="mr-1 text-xs font-medium text-white/50">{suffix}</span> : null}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl font-bold text-white disabled:opacity-30"
          aria-label={`زیاد کردن ${label}`}
        >
          +
        </motion.button>
      </div>
    </div>
  )
}
