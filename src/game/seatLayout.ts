// Evenly places `total` seats around a circle, starting from the top and
// going clockwise as `index` increases.
export function seatStyle(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const r = 42
  const left = 50 + r * Math.cos(angle)
  const top = 50 + r * Math.sin(angle)
  return { left: `${left}%`, top: `${top}%` }
}
