export interface EmptySlot {
  id: string
  at: number
}

export type StripItem =
  | { kind: 'asset'; index: number }
  | { kind: 'empty'; slot: EmptySlot }

export type GallerySelection =
  | { kind: 'asset'; index: number }
  | { kind: 'empty'; id: string }
  | { kind: 'add' }

/**
 * An empty slot is a UI-only placeholder left behind when media is deleted.
 * `at` is the asset index the slot sits in front of, so `at === assetCount`
 * means after the last asset. Slots are kept sorted by `at`; equal values keep
 * their array order. Assets stay the single source of truth in the draft store.
 */

export function clampSlots(slots: EmptySlot[], assetCount: number): EmptySlot[] {
  if (slots.every((slot) => slot.at <= assetCount)) return slots
  return slots.map((slot) => (slot.at > assetCount ? { ...slot, at: assetCount } : slot))
}

export function buildStrip(assetCount: number, slots: EmptySlot[]): StripItem[] {
  const byPosition = new Map<number, EmptySlot[]>()
  for (const slot of slots) {
    const group = byPosition.get(slot.at)
    if (group) group.push(slot)
    else byPosition.set(slot.at, [slot])
  }

  const items: StripItem[] = []
  for (let index = 0; index <= assetCount; index += 1) {
    for (const slot of byPosition.get(index) ?? []) items.push({ kind: 'empty', slot })
    if (index < assetCount) items.push({ kind: 'asset', index })
  }
  return items
}

export function slotsAfterDelete(slots: EmptySlot[], deletedIndex: number, id: string): EmptySlot[] {
  const insertAt = slots.findIndex((slot) => slot.at > deletedIndex)
  const shifted = slots.map((slot) => (slot.at > deletedIndex ? { ...slot, at: slot.at - 1 } : slot))
  const created: EmptySlot = { id, at: deletedIndex }

  if (insertAt === -1) return [...shifted, created]
  return [...shifted.slice(0, insertAt), created, ...shifted.slice(insertAt)]
}

export function slotsAfterFill(slots: EmptySlot[], id: string, insertedCount: number): EmptySlot[] {
  const position = slots.findIndex((slot) => slot.id === id)
  if (position === -1) return slots

  return slots
    .filter((slot) => slot.id !== id)
    .map((slot, index) => (index >= position ? { ...slot, at: slot.at + insertedCount } : slot))
}

export function slotsAfterDismiss(slots: EmptySlot[], id: string): EmptySlot[] {
  return slots.filter((slot) => slot.id !== id)
}

export function resolveSelection(
  selection: GallerySelection,
  assetCount: number,
  slots: EmptySlot[],
): GallerySelection {
  const fallback: GallerySelection =
    assetCount > 0 ? { kind: 'asset', index: assetCount - 1 } : { kind: 'add' }

  if (selection.kind === 'asset') return selection.index < assetCount ? selection : fallback
  if (selection.kind === 'empty') {
    return slots.some((slot) => slot.id === selection.id) ? selection : fallback
  }
  return selection
}
