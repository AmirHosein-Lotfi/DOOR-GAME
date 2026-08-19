import { useState } from 'react'
import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import { WORD_CATEGORIES } from '../data/words'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { teamGradient } from '../game/palette'
import { PrimaryButton } from './ui/PrimaryButton'
import { Stepper } from './ui/Stepper'
import { Chip } from './ui/Chip'

const DIFFICULTIES: { id: 'easy' | 'medium' | 'hard'; label: string }[] = [
  { id: 'easy', label: 'آسون' },
  { id: 'medium', label: 'متوسط' },
  { id: 'hard', label: 'سخت' },
]

export function SetupScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')

  const canStart =
    state.teams.length >= 2 && state.config.categoryIds.length >= 1 && state.config.difficulties.length >= 1

  const reason =
    state.teams.length < 2
      ? 'حداقل ۲ تیم اضافه کن'
      : state.config.categoryIds.length < 1
        ? 'حداقل یک دسته‌بندی انتخاب کن'
        : state.config.difficulties.length < 1
          ? 'حداقل یک سطح سختی انتخاب کن'
          : ''

  function addTeam() {
    if (!player1.trim() || !player2.trim()) return
    dispatch({ type: 'ADD_TEAM', player1, player2 })
    setPlayer1('')
    setPlayer2('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-10 pt-8"
    >
      <header className="text-center">
        <h1 className="bg-gradient-to-l from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-5xl font-black text-transparent">
          دور
        </h1>
        <p className="mt-1 text-sm text-white/50">بازی حدس کلمه و اجرا، دور به دور</p>
      </header>

      {/* Teams */}
      <section className="flex flex-col gap-3 rounded-3xl bg-white/5 p-4">
        <h2 className="text-base font-bold text-white">تیم‌ها (دونفره)</h2>
        <div className="flex gap-2">
          <input
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            placeholder="اسم نفر اول"
            className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-fuchsia-400"
          />
          <input
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            placeholder="اسم نفر دوم"
            className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-fuchsia-400"
          />
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={addTeam}
          className="w-full rounded-2xl bg-gradient-to-l from-fuchsia-500 to-violet-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-violet-900/40"
        >
          + اضافه کردن تیم
        </motion.button>

        {state.teams.length > 0 && (
          <ul className="flex flex-col gap-2">
            {state.teams.map((team) => (
              <motion.li
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                key={team.id}
                className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                  style={{ backgroundImage: teamGradient(team.colorIndex) }}
                >
                  {team.player1.trim().charAt(0) || '?'}
                </span>
                <span className="flex-1 truncate text-base font-semibold text-white">
                  {team.player1} و {team.player2}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'REMOVE_TEAM', id: team.id })}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-lg text-white/60"
                  aria-label={`حذف ${team.name}`}
                >
                  ×
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      {/* Config */}
      <section className="flex flex-col gap-3 rounded-3xl bg-white/5 p-4">
        <h2 className="text-base font-bold text-white">تنظیمات بازی</h2>
        <Stepper
          label="تعداد راند"
          value={state.config.rounds}
          min={1}
          max={10}
          onChange={(v) => dispatch({ type: 'SET_ROUNDS', value: v })}
        />
        <Stepper
          label="مدت زمان هر تیم در هر راند"
          value={state.config.roundSeconds / 60}
          min={1}
          max={10}
          suffix="دقیقه"
          onChange={(v) => dispatch({ type: 'SET_ROUND_MINUTES', value: v })}
        />
        <p className="px-1 text-xs font-medium text-white/40">
          نوبت هر کلمه بین تیم‌ها می‌چرخه؛ ساعت هر تیم فقط توی نوبت خودش کم می‌شه — هر کی زمانش زودتر تموم بشه اون
          راند رو باخته.
        </p>
      </section>

      {/* Categories */}
      <section className="flex flex-col gap-3 rounded-3xl bg-white/5 p-4">
        <h2 className="text-base font-bold text-white">دسته‌بندی‌ها</h2>
        <div className="flex flex-wrap gap-2">
          {WORD_CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              active={state.config.categoryIds.includes(cat.id)}
              onClick={() => dispatch({ type: 'TOGGLE_CATEGORY', id: cat.id })}
              danger={cat.id === 'curses'}
            >
              {cat.id === 'curses' ? '🔞' : cat.emoji} {cat.name}
            </Chip>
          ))}
        </div>
        {state.config.categoryIds.includes('curses') && (
          <p className="text-xs font-medium text-red-300/80">
            فقط برای بزرگسالان — با احتیاط انتخاب کن
          </p>
        )}
      </section>

      {/* Difficulty */}
      <section className="flex flex-col gap-3 rounded-3xl bg-white/5 p-4">
        <h2 className="text-base font-bold text-white">سطح سختی</h2>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d.id}
              active={state.config.difficulties.includes(d.id)}
              onClick={() => dispatch({ type: 'TOGGLE_DIFFICULTY', d: d.id })}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </section>

      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton disabled={!canStart} onClick={() => dispatch({ type: 'START_GAME' })}>
          شروع بازی
        </PrimaryButton>
        {!canStart && <p className="text-center text-xs font-medium text-white/40">{reason}</p>}
      </div>
    </motion.div>
  )
}
