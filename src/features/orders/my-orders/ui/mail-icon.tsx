interface Props {
  className?: string
}

/** Solid envelope used by the "message the artist" button (20 × 16). */
export function MailIcon({ className }: Props) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="20" height="16" rx="4" fill="currentColor" />
      <path d="M3.4 3.6L9.9 8.3L16.5 3.6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
