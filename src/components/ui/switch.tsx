'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export const Switch = ({ checked, onCheckedChange, disabled = false }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-primary-500' : 'bg-gray-200'}
      `}
    >
      <motion.span
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0"
      />
    </button>
  )
}