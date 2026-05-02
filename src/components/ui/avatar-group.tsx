'use client'

import Image from 'next/image'
import { cn } from '@/utils' // Assuming you have a standard Tailwind class merger

interface AvatarGroupProps {
  images: string[]
  width?: number | string
  height?: number | string
  fill?: boolean
  borderColor?: string
  className?: string
}

export function AvatarGroup({
  images,
  width = 32,
  height = 32,
  fill = false,
  borderColor,
  className,
}: AvatarGroupProps) {
  
  // Logic to determine sizing styles
  const sizeStyles = fill 
    ? { width: '100%', height: '100%' } 
    : { width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height }

  return (
    <div className={cn("flex items-center -space-x-4", className)}>
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className='relative '
          style={sizeStyles}
        >
          <Image
            src={src}
            alt={`Avatar ${index + 1}`}
            fill
            className={cn(
                `rounded-full object-contain ${borderColor && 'border-2'}`,
                borderColor
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            
          />
        </div>
      ))}
    </div>
  )
}