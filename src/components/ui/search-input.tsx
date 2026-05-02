'use client'

import React, { InputHTMLAttributes, forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  leftIconPath?: string;   // Path to svg, e.g., '/home/magnifier.svg'
  rightIconPath?: string;  // Path to svg, e.g., '/home/clear.svg'
  placeholder?: string;
  onSearch?: (value: string) => void;  /** Fires when the user presses the 'Enter' key */
  onChange?: (value: string) => void;  /** Fires on every keystroke for real-time filtering */
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ leftIconPath, rightIconPath, placeholder = "Search...", onSearch, onChange, className, ...props }, ref) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(e.currentTarget.value)
      }
      props.onKeyDown?.(e)
    }

    return (
      <div
        className={cn(
          "relative flex items-center gap-4 w-full h-12 py-3 px-6 bg-white border border-gray-50 rounded-4xl transition-all focus-within:border-gray-50 focus-within:ring-1 focus-within:ring-primary-500",
          className
        )}
      >
        {/* Left Image Icon */}
        {leftIconPath && (
          <div className="flex shrink-0">
            <Image 
              src={leftIconPath} 
              alt="Search Icon" 
              width={20} 
              height={20} 
              priority 
            />
          </div>
        )}

        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={cn(
            "flex-1 h-full bg-transparent outline-none font-poppins text-[16px] text-gray-500 placeholder:text-gray-300",
            // !leftIconPath && "pl-5",
            !rightIconPath && "pr-5"
          )}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
        />

        {/* Right Image Icon */}
        {rightIconPath && (
          <div className="flex shrink-0 cursor-pointer">
            <Image 
              src={rightIconPath} 
              alt="Action Icon" 
              width={20} 
              height={20} 
            />
          </div>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }