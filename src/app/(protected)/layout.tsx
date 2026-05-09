import { type ReactNode } from 'react'

// All routes inside (protected) require auth.
// The middleware handles redirecting unauthenticated users — this layout
// just provides any shared UI wrappers (navbar, sidebar etc.) for the app shell.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}