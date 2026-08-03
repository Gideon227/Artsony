'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { Image as ImageIcon, User, LayoutTemplate, Store, FileText } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '@/components'

export interface TabItem {
  id: string
  label: string
  icon: string
  content: React.ReactNode
}

interface ProfileTabsProps {
  tabs: TabItem[]
  defaultTab?: string
  className?: string
}

export function ProfileTabs({ tabs, defaultTab, className }: ProfileTabsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(defaultTab as string || tabs[0]?.id as string)

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <div className={cn("w-full flex flex-col bg-white", className)}>
      <div className="w-full relative flex-1 border-b border-gray-50 bg-white">
        <div 
          className="flex justify-between items-center gap-4 overflow-x-auto py-6 px-8 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id

            return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  leftIcon={tab.icon}
                  className={`shrink-0 whitespace-nowrap flex-1 hover:bg-action-hover text-body h-12 ${isActive && 'bg-primary-50 border-primary-500'}`}
                  variant='outline'
                >
                  {tab.label}
                </Button>
            )
          })}
        </div>
      </div>

      {/* --- Tab Content Area with Animation --- */}
      <div className="w-full mt-4 border-none">
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeTab.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}