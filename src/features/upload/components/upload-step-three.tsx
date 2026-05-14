'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, CircleHelp } from 'lucide-react'
import { Button, Input } from '@/components'

// Enterprise-standard Interfaces
export interface Owner {
  name: string
  avatar: string
}

export interface Collaborator {
  id: string
  name: string
  avatar: string
}

interface UploadStepThreeProps {
  owner: Owner
  coOwners: Collaborator[]
  selectedTools: string[]
  onRemoveCoOwner: (id: string) => void
  onRemoveTool: (tool: string) => void
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onCancel: () => void
}

const UploadStepThree = ({
  owner,
  coOwners,
  selectedTools,
  onRemoveCoOwner,
  onRemoveTool,
  onBack,
  onNext,
  onSaveDraft,
  onCancel
}: UploadStepThreeProps) => {
  return (
    <div className="border border-gray-50 rounded-[40px] flex flex-col justify-between bg-white overflow-hidden w-full max-w-2xl mx-auto shadow-sm">
      <div>
        {/* --- HEADER (Frame 2291 (1).svg) --- */}
        <div className="flex justify-between px-6 py-5 items-center border-b border-gray-50/50">
          <div className="flex gap-4 items-center">
            <h6 className="font-raleway font-semibold text-primary-500 text-2xl tracking-wide">Step</h6>
            <h6 className="font-raleway font-semibold text-primary-500 text-2xl tracking-wide">
              3<span className="text-gray-400">/4</span>
            </h6>
          </div>

          <div className="flex gap-3 items-center">
            <Button 
              variant="outline" 
              onClick={onSaveDraft}
              className="py-2.5 px-6 rounded-full border-primary-500 text-primary-500 font-poppins font-medium hover:bg-primary-50 transition-colors"
            >
              Save Draft
            </Button>
            <button 
              onClick={onCancel}
              className="border border-gray-100 rounded-full p-2.5 hover:bg-gray-50 transition-all text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* COLLABORATION HEADER */}
          <section className="flex flex-col gap-4">
            <div>
              <h3 className="font-poppins font-semibold text-black text-base md:text-lg flex items-center gap-2">
                Is this a collaboration? <span className="text-gray-300 font-normal text-sm">( Optional )</span>
              </h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mt-2 max-w-md">
                Tag other Artsony users who contributed to this work. They'll appear as co-creators and the artwork will show up on their profile too.
              </p>
            </div>

            <button className="w-full border-2 border-dashed border-gray-100 rounded-[32px] py-6 flex items-center justify-center gap-2 group hover:border-primary-200 transition-colors bg-white">
              <div className="bg-primary-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                <Plus size={16} color="white" />
              </div>
              <span className="font-poppins font-medium text-primary-500 text-sm md:text-base">Add Collaborator</span>
            </button>
          </section>

          {/* DYNAMIC OWNER SECTION */}
          <div className="flex flex-col gap-3">
            <h4 className="font-poppins font-medium text-gray-500 text-sm">Owner</h4>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-gray-50">
                <Image 
                  src={owner.avatar} 
                  fill 
                  alt={owner.name} 
                  className="object-cover"
                  sizes="(max-width: 768px) 48px, 56px"
                />
              </div>
              <span className="font-poppins font-semibold text-gray-700 text-sm md:text-base">
                {owner.name}
              </span>
            </div>
          </div>

          {/* DYNAMIC CO-OWNERS LIST */}
          <div className="flex flex-col gap-3">
            <h4 className="font-poppins font-medium text-gray-500 text-sm">Co-Owners</h4>
            <div className="border border-gray-100 rounded-[24px] bg-white overflow-hidden">
              <AnimatePresence initial={false}>
                {coOwners.length > 0 ? (
                  coOwners.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`flex items-center justify-between p-4 ${index !== coOwners.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-50">
                          <Image 
                            src={item.avatar} 
                            fill 
                            alt={item.name} 
                            className="object-cover" 
                            sizes="40px"
                          />
                        </div>
                        <span className="font-poppins font-medium text-gray-700 text-sm">{item.name}</span>
                      </div>
                      <button 
                        onClick={() => onRemoveCoOwner(item.id)}
                        className="border border-gray-100 rounded-full p-1.5 text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-300 font-poppins text-sm italic">
                    No co-owners added yet
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DYNAMIC MATERIALS / TOOLS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-semibold text-black text-base">Materials / Tools Used</h3>
              <CircleHelp size={18} className="text-primary-500 cursor-help" />
              <span className="text-gray-300 text-sm">( Optional )</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedTools.map(tool => (
                  <motion.div 
                    key={tool} 
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-primary-500 text-white rounded-full py-2 px-4 flex items-center gap-2"
                  >
                    <span className="text-xs md:text-sm font-medium">{tool}</span>
                    <button 
                      onClick={() => onRemoveTool(tool)} 
                      className="bg-white/20 rounded-full p-0.5 hover:bg-white/40 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Input 
                placeholder="Search Tools" 
                className="pl-12 rounded-full py-4 text-sm focus:ring-primary-500"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <p className="text-gray-300 text-[10px] md:text-xs">Maximum 10</p>
          </section>
        </div>
      </div>

      {/* --- FOOTER BUTTONS --- */}
      <div className="py-6 px-6 flex gap-4 border-t border-gray-50 bg-white sticky bottom-0">
        <Button
          variant="outline"
          fullWidth
          onClick={onBack}
          className="rounded-full py-4 border-primary-500 text-primary-500 flex items-center justify-center gap-2 hover:bg-primary-50"
        >
          <Image src="/icons/alt-arrow-left-double-red.svg" width={18} height={18} alt="back icon" />
          Back
        </Button>

        <Button
          fullWidth
          onClick={onNext}
          className="rounded-full py-4 bg-primary-500 text-white flex items-center justify-center gap-2 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
        >
          Next
          <Image src="/icons/alt-arrow-right-double.svg" width={18} height={18} alt="next icon" />
        </Button>
      </div>
    </div>
  )
}

export default UploadStepThree