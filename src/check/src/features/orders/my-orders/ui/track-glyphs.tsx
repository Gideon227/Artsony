/** White check used inside the filled "delivered" end node (8 × 6). */
export function CheckGlyph() {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
      <path d="M1 3.1L2.9 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** White cross used inside the filled "canceled" end node (6 × 6). */
export function CrossGlyph() {
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
      <path d="M.75.75l4.5 4.5M5.25.75L.75 5.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
