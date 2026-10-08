import Image from 'next/image'
import type { ModalKind } from './types'

export interface MediaOption {
  modal:    ModalKind
  label:    string
  iconSrc?: string
}

export const MEDIA_OPTIONS: MediaOption[] = [
  { modal: 'image', label: 'Image',       iconSrc: '/icons/image.svg' },
  { modal: 'embed', label: 'Embed',       iconSrc: '/icons/code-square.svg' },
  { modal: 'video', label: 'Video/Audio', iconSrc: '/icons/video.svg' },
  { modal: 'pdf',   label: 'PDF' },
  { modal: '3d',    label: '3D',          iconSrc: '/icons/box.svg' },
]

export function MediaIcon({ option, size }: { option: MediaOption; size: number }) {
  if (option.iconSrc) {
    return <Image src={option.iconSrc} width={size} height={size} alt="" aria-hidden />
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill="#525965"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13 3v4a1 1 0 0 0 1 1h4"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
