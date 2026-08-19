export type Difficulty = 'easy' | 'medium' | 'hard'

export interface WordCategory {
  id: string
  name: string
  emoji?: string
  words: Record<Difficulty, string[]>
}
