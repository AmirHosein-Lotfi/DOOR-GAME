import { useRef } from 'react'
import type { Dispatch } from 'react'
import { motion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { GameState } from '../game/types'
import type { Action } from '../game/useGameState'
import { teamGradient } from '../game/palette'
import { seatStyle } from '../game/seatLayout'

// Drag any seat onto another to swap their positions — snaps to whichever
// slot is nearest the drop point. Turn order always follows this circle
// clockwise starting from the top.
export function SeatArranger({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const total = state.seatOrder.length
  if (total === 0) return null

  function handleDragEnd(index: number, info: PanInfo) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let angle = Math.atan2(info.point.y - cy, info.point.x - cx) + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    const nearest = Math.round((angle / (2 * Math.PI)) * total) % total
    if (nearest === index) return
    const order = [...state.seatOrder]
    ;[order[index], order[nearest]] = [order[nearest], order[index]]
    dispatch({ type: 'SET_SEAT_ORDER', order })
  }

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[220px]">
      <div className="absolute inset-[10%] rounded-full bg-white/5 ring-1 ring-white/10" />
      {state.seatOrder.map((seat, i) => {
        const team = state.teams.find((t) => t.id === seat.teamId)
        if (!team) return null
        const name = seat.isPlayer1 ? team.player1 : team.player2
        return (
          <motion.div
            key={`${seat.teamId}-${seat.isPlayer1}`}
            layout
            drag
            dragMomentum={false}
            dragElastic={0.15}
            whileDrag={{ scale: 1.2, zIndex: 20 }}
            onDragEnd={(_e, info) => handleDragEnd(i, info)}
            style={seatStyle(i, total)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none flex-col items-center gap-1 active:cursor-grabbing"
          >
            <span
              className="grid h-11 w-11 place-items-center rounded-full text-xs font-black text-white shadow-lg"
              style={{ backgroundImage: teamGradient(team.colorIndex) }}
            >
              {name.trim().charAt(0) || '?'}
            </span>
            <span className="max-w-14 truncate text-[10px] font-bold text-white/70">{name}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
