import { useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { teamGradient } from '../game/palette'
import { seatStyle } from '../game/seatLayout'

// Rearrange the table: drag a player onto someone else's spot to swap them,
// or just tap two players in a row. Turn order always follows this circle
// clockwise from the top.
export function SeatArranger({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggedRef = useRef(false)
  const [selected, setSelected] = useState<number | null>(null)
  const total = state.seatOrder.length
  if (total === 0) return null

  function swap(a: number, b: number) {
    if (a === b) return
    const order = [...state.seatOrder]
    ;[order[a], order[b]] = [order[b], order[a]]
    dispatch({ type: 'SET_SEAT_ORDER', order })
  }

  // Which seat slot is nearest the drop point. Uses viewport coordinates on
  // both sides — `info.point` is page-relative and would be off by the page
  // scroll, so the pointer event is the reliable source here.
  function slotAt(clientX: number, clientY: number) {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    let angle = Math.atan2(dy, dx) + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    return Math.round((angle / (2 * Math.PI)) * total) % total
  }

  function handleTap(index: number) {
    if (selected === null) {
      setSelected(index)
      return
    }
    swap(selected, index)
    setSelected(null)
  }

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[260px]">
      <div className="absolute inset-[16%] rounded-full bg-white/5 ring-1 ring-white/10" />
      {state.seatOrder.map((seat, i) => {
        const team = state.teams.find((t) => t.id === seat.teamId)
        if (!team) return null
        const name = seat.isPlayer1 ? team.player1 : team.player2
        const isSelected = selected === i
        return (
          // Outer wrapper owns the position + centering transform; the inner
          // motion element owns the drag transform, so the two never fight.
          <div
            key={`${seat.teamId}-${seat.isPlayer1}`}
            style={seatStyle(i, total)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <motion.button
              type="button"
              aria-label={`جابه‌جایی ${name}`}
              drag
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={0.2}
              whileDrag={{ scale: 1.25, zIndex: 30 }}
              onDragStart={() => {
                draggedRef.current = true
              }}
              onDragEnd={(event) => {
                const e = event as PointerEvent
                const target = slotAt(e.clientX, e.clientY)
                if (target !== null) swap(i, target)
                setSelected(null)
              }}
              onClick={() => {
                // A drag ends with a click too — ignore that one.
                if (draggedRef.current) {
                  draggedRef.current = false
                  return
                }
                handleTap(i)
              }}
              className="flex cursor-grab touch-none flex-col items-center gap-1 active:cursor-grabbing"
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full text-sm font-black text-white shadow-lg ${
                  isSelected ? 'ring-4 ring-white' : ''
                }`}
                style={{ backgroundImage: teamGradient(team.colorIndex) }}
              >
                {name.trim().charAt(0) || '?'}
              </span>
              <span className="max-w-16 truncate text-[10px] font-bold text-white/70">{name}</span>
            </motion.button>
          </div>
        )
      })}
    </div>
  )
}
