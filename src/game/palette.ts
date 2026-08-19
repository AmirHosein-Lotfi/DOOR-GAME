// Vivid accent palette cycled by team index. Each entry is a from/to pair
// used for gradients (chips, full-bleed backgrounds, buttons).
export const TEAM_COLORS = [
  { from: '#fb7185', to: '#e11d48' }, // rose
  { from: '#fb923c', to: '#ea580c' }, // orange
  { from: '#fbbf24', to: '#d97706' }, // amber
  { from: '#a3e635', to: '#65a30d' }, // lime
  { from: '#34d399', to: '#059669' }, // emerald
  { from: '#22d3ee', to: '#0891b2' }, // cyan
  { from: '#60a5fa', to: '#2563eb' }, // blue
  { from: '#a78bfa', to: '#7c3aed' }, // violet
  { from: '#e879f9', to: '#c026d3' }, // fuchsia
  { from: '#f472b6', to: '#db2777' }, // pink
]

export function teamColor(index: number) {
  return TEAM_COLORS[index % TEAM_COLORS.length]
}

export function teamGradient(index: number) {
  const c = teamColor(index)
  return `linear-gradient(135deg, ${c.from}, ${c.to})`
}
