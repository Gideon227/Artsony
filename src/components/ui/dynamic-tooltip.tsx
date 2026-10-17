'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils'

type DynamicTooltipProps = {
  title?: string
  content: string | ReactNode
  className?: string
  iconSize?: number
  placement?: 'auto' | 'top' | 'bottom'
}

const VIEWPORT_MARGIN = 16
// The card's left edge sits 40% of its width before the trigger's centre.
const ANCHOR_RATIO = 0.4

/**
 * Horizontal nudge (px) that keeps the card inside the viewport. 0 when it
 * already fits, so wide screens are unaffected.
 */
export function clampTooltipShift(
  triggerCenterX: number,
  tooltipWidth: number,
  viewportWidth: number,
  margin = VIEWPORT_MARGIN,
): number {
  const left = triggerCenterX - tooltipWidth * ANCHOR_RATIO
  const right = left + tooltipWidth
  if (left < margin) return margin - left
  if (right > viewportWidth - margin) return viewportWidth - margin - right
  return 0
}

export function DynamicTooltip({ title, content, className, iconSize = 16, placement = 'auto' }: DynamicTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const [shift, setShift] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const isVisible = isHovered || isPinned

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setPosition(placement === 'auto' ? (rect.top < 150 ? 'bottom' : 'top') : placement)
    const card = cardRef.current
    if (card) setShift(clampTooltipShift(rect.left + rect.width / 2, card.offsetWidth, window.innerWidth))
  }, [placement])

  // Listens to scroll and resize events globally when the tooltip is open
  useEffect(() => {
    if (!isVisible) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible, updatePosition])

  // A pinned tooltip (opened by tap / click / keyboard) closes on an outside
  // press or Escape. Hover alone never pins, so mouse behaviour is unchanged.
  useEffect(() => {
    if (!isPinned) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsPinned(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPinned(false)
        setIsHovered(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isPinned])

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex items-center"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setIsHovered(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setIsHovered(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsPinned((pinned) => !pinned)}
        aria-label={title ? `About ${title}` : 'More information'}
        aria-expanded={isVisible}
        aria-describedby={id}
        className="flex cursor-help items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-500"
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 7.75C11.3787 7.75 10.875 8.25368 10.875 8.875C10.875 9.28921 10.5392 9.625 10.125 9.625C9.71079 9.625 9.375 9.28921 9.375 8.875C9.375 7.42525 10.5503 6.25 12 6.25C13.4497 6.25 14.625 7.42525 14.625 8.875C14.625 9.58584 14.3415 10.232 13.883 10.704C13.7907 10.7989 13.7027 10.8869 13.6187 10.9708C13.4029 11.1864 13.2138 11.3753 13.0479 11.5885C12.8289 11.8699 12.75 12.0768 12.75 12.25V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13V12.25C11.25 11.5948 11.555 11.0644 11.8642 10.6672C12.0929 10.3733 12.3804 10.0863 12.6138 9.85346C12.6842 9.78321 12.7496 9.71789 12.807 9.65877C13.0046 9.45543 13.125 9.18004 13.125 8.875C13.125 8.25368 12.6213 7.75 12 7.75ZM12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" fill="#2D9CDB"/>
        </svg>
      </button>

      <div
        ref={cardRef}
        id={id}
        role="tooltip"
        style={{ marginLeft: shift }}
        className={cn(
          'absolute z-50 w-[229px] rounded-xl border border-gray-50 bg-white p-4 shadow-sm transition-all duration-300 ease-out',
          position === 'top'
            ? 'bottom-full mb-2 left-1/2 -translate-x-2/5 origin-bottom'
            : 'top-full mt-2 left-1/2 -translate-x-2/5 origin-top',
          isVisible ? 'visible scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0',
          className,
        )}
      >
        {title && (
          <h4 className="mb-1.5 font-poppins text-body-xxs font-medium leading-4 text-info-500">{title}</h4>
        )}

        <div className="font-poppins text-body-xxs font-normal leading-4 tracking-wide text-body">{content}</div>
      </div>
    </div>
  )
}
