'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input } from '@/components'
import { useCreateMoodboard } from '@/hooks/use-moodboards'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (moodboardId: string) => void
}

export function CreateMoodboardDialog({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const { mutate: createMoodboard, isPending } = useCreateMoodboard()

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    createMoodboard(trimmed, {
      onSuccess: (res) => {
        setTitle('')
        onOpenChange(false)
        onCreated?.(res.data.id)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add New Collection</DialogTitle>
        </DialogHeader>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Living Room Designs"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} isLoading={isPending} disabled={!title.trim()} leftIcon='/icon/plus-white-bg.svg'>
            Create Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
