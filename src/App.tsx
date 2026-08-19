import { AnimatePresence } from 'framer-motion'
import { useGameState } from './game/useGameState'
import { SetupScreen } from './components/SetupScreen'
import { RoundIntro } from './components/RoundIntro'
import { PlayingScreen } from './components/PlayingScreen'
import { RoundResult } from './components/RoundResult'
import { GameResult } from './components/GameResult'
import { PausedOverlay } from './components/PausedOverlay'

function App() {
  const [state, dispatch] = useGameState()

  return (
    <div className="min-h-dvh w-full bg-slate-950">
      <AnimatePresence mode="wait">
        {state.phase === 'setup' && <SetupScreen key="setup" state={state} dispatch={dispatch} />}
        {state.phase === 'round-intro' && <RoundIntro key="round-intro" state={state} dispatch={dispatch} />}
        {state.phase === 'playing' && <PlayingScreen key="playing" state={state} dispatch={dispatch} />}
        {state.phase === 'round-result' && <RoundResult key="round-result" state={state} dispatch={dispatch} />}
        {state.phase === 'game-result' && <GameResult key="game-result" state={state} dispatch={dispatch} />}
        {state.phase === 'paused' && <PausedOverlay key="paused" state={state} dispatch={dispatch} />}
      </AnimatePresence>
    </div>
  )
}

export default App
