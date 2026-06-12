// upload-art/hooks/use-drag-over.ts
import { useState } from 'react'

export function useDragOver() {
  const [isDragging, setIsDragging] = useState(false)

  const handlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) },
  }

  return { isDragging, handlers }
}