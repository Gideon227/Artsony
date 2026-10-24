'use client'

import { motion, useReducedMotion } from 'framer-motion'

const GLYPH_ROTATIONS = [0, 90, 180, 270]

// Four-piece mark from the Figma processing screen, drawn as two arcs per glyph
// (dark outer, orange inner). Swap for the exported asset if pixel accuracy matters.
function Glyph({ rotation }: { rotation: number }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}>
      <circle cx="36" cy="36" r="30" stroke="#02272F" strokeWidth="4" strokeDasharray="118 71" strokeLinecap="round" />
      <circle cx="36" cy="36" r="22" stroke="#F25B38" strokeWidth="4" strokeDasharray="62 76" strokeDashoffset="-128" strokeLinecap="round" />
    </svg>
  )
}

export function BrandLoader() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex items-center gap-x-4" aria-hidden="true">
      {GLYPH_ROTATIONS.map((rotation, i) => (
        <motion.div
          key={rotation}
          animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.9, 1, 0.9] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        >
          <Glyph rotation={rotation} />
        </motion.div>
      ))}
    </div>
  )
}