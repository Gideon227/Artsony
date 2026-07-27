import { X } from 'lucide-react'

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className="absolute top-3 left-3 w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center"
    >
      <span className="bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center">
        <X color="white" size={16} />
      </span>
    </button>
  )
}