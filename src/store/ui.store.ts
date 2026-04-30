import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

export type ModalId = 'auth' | 'upload' | 'confirm-delete' | 'image-preview' | string

type UIState = {
  toasts: Toast[]
  openModals: ModalId[]
  modalData: Record<ModalId, unknown>
}

type UIActions = {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  openModal: (id: ModalId, data?: unknown) => void
  closeModal: (id: ModalId) => void
  closeAllModals: () => void
  getModalData: <T>(id: ModalId) => T | undefined
}

let toastCounter = 0

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    immer((set, get) => ({
      toasts: [],
      openModals: [],
      modalData: {},

      addToast: (toast) => {
        const id = `toast-${++toastCounter}`
        set((state) => {
          state.toasts.push({ ...toast, id })
        })
        const duration = toast.duration ?? 4000
        setTimeout(() => get().removeToast(id), duration)
      },

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id)
        }),

      openModal: (id, data) =>
        set((state) => {
          if (!state.openModals.includes(id)) state.openModals.push(id)
          if (data !== undefined) state.modalData[id] = data
        }),

      closeModal: (id) =>
        set((state) => {
          state.openModals = state.openModals.filter((m) => m !== id)
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete state.modalData[id]
        }),

      closeAllModals: () =>
        set((state) => {
          state.openModals = []
          state.modalData = {}
        }),

      getModalData: <T>(id: ModalId) => get().modalData[id] as T | undefined,
    })),
    { name: 'UIStore', enabled: process.env.NODE_ENV === 'development' }
  )
)

// Selectors
export const selectToasts = (state: UIState) => state.toasts
export const selectIsModalOpen = (id: ModalId) => (state: UIState) =>
  state.openModals.includes(id)
