'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, CircleHelp, UserPlus } from 'lucide-react'
import { Button, Input } from '@/components'
import { useArtworkStore } from '@/store/artwork.store'
import UploadHeader from './upload-header'

interface UploadStepThreeProps {
  id?: string;
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  steps: string;
  number: string;
}

// Mock DB — replace with real API lookup later
// Only ids are persisted to the store; display info is derived here
const MOCK_USERS_DB = [
  { id: '1', name: 'Gabriel Banega', username: 'gabriel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: '2', name: 'Oche Thomson', username: 'oche', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: '3', name: 'Hannah Branden', username: 'hannah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: '4', name: 'Christina Boluwatife', username: 'christina', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80' },
]

const UploadArtCollaborators = ({ onNext, onBack, onSaveAndExit, number, steps }: UploadStepThreeProps) => {
  const draft = useArtworkStore((state) => state.draft)
  const setDraftField = useArtworkStore((state) => state.setDraftField)
  const setDraftStep  = useArtworkStore((state) => state.setDraftStep)

  const [isSearchingUser, setIsSearchingUser] = useState(false)
  const [userSearchQuery, setUserSearchQuery]  = useState('')
  const [toolInput, setToolInput]              = useState('')

  // collaborator_ids is string[] in the store — derive display info from mock DB
  const collaboratorIds  = draft.collaborator_ids ?? []
  const toolsUsed        = draft.tools_used       ?? []

  // Collaborator display objects derived from stored IDs
  const addedCollaborators = useMemo(
    () => MOCK_USERS_DB.filter((u) => collaboratorIds.includes(u.id)),
    [collaboratorIds]
  )

  // Filter search results — exclude already-added collaborators
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return []
    return MOCK_USERS_DB.filter((user) => {
      const matchesQuery =
        user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase())
      const alreadyAdded = collaboratorIds.includes(user.id)
      return matchesQuery && !alreadyAdded
    })
  }, [userSearchQuery, collaboratorIds])

  // --- Collaborator handlers — only persist the ID ---
  const handleAddCollaborator = (user: typeof MOCK_USERS_DB[0]) => {
    setDraftField('collaborator_ids', [...collaboratorIds, user.id])
    setUserSearchQuery('')
    setIsSearchingUser(false)
  }

  const handleRemoveCollaborator = (userId: string) => {
    setDraftField('collaborator_ids', collaboratorIds.filter((id) => id !== userId))
  }

  // --- Tools handlers ---
  const handleAddTool = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const cleaned = toolInput.trim()
    if (cleaned && !toolsUsed.includes(cleaned) && toolsUsed.length < 10) {
      setDraftField('tools_used', [...toolsUsed, cleaned])
      setToolInput('')
    }
  }

  const handleRemoveTool = (tool: string) => {
    setDraftField('tools_used', toolsUsed.filter((t) => t !== tool))
  }

  // --- Navigation ---
  const handleNextStep = () => {
    setDraftStep(4)
    onNext()
  }

  const handleBackStep = () => {
    setDraftStep(2)
    onBack()
  }

  return (
    <div className="border border-gray-50 rounded-[40px] flex flex-col justify-between bg-white overflow-hidden w-full max-w-2xl mx-auto shadow-sm">
      <div>
        {/* HEADER */}
        <UploadHeader
          number={number}
          steps={steps}
          onSaveAndExit={onSaveAndExit}
        />

        {/* CONTENT */}
        <div className="p-6 md:p-8 flex flex-col gap-8">

          {/* COLLABORATION SEARCH */}
          <section className="flex flex-col gap-4">
            <div>
              <h3 className="font-poppins font-semibold text-black text-base md:text-lg flex items-center gap-2">
                Is this a collaboration? <span className="text-gray-300 font-normal text-sm">( Optional )</span>
              </h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mt-2 max-w-md">
                Tag other Artsony users who contributed to this work. They'll appear as co-creators and the artwork will show up on their profile too.
              </p>
            </div>

            {!isSearchingUser ? (
              <button
                type="button"
                onClick={() => setIsSearchingUser(true)}
                className="w-full border-2 border-dashed border-gray-100 rounded-[32px] py-6 flex items-center justify-center gap-2 group hover:border-primary-200 transition-colors bg-white"
              >
                <div className="bg-primary-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Plus size={16} color="white" />
                </div>
                <span className="font-poppins font-medium text-primary-500 text-sm md:text-base">Add Collaborator</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full border border-gray-100 rounded-[24px] p-4 bg-gray-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative flex items-center gap-2">
                  <Input
                    placeholder="Search by username (e.g. oche, hannah, gabriel)..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-full border border-gray-100 text-sm focus:ring-primary-500 bg-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setIsSearchingUser(false); setUserSearchQuery('') }}
                    className="absolute right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <AnimatePresence>
                  {filteredUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-white border border-gray-50 rounded-2xl max-h-48 overflow-y-auto mt-1 divide-y divide-gray-50 shadow-inner"
                    >
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleAddCollaborator(user)}
                          className="flex items-center justify-between p-3 hover:bg-primary-50/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" alt={user.name} />
                            <div className="flex flex-col">
                              <span className="font-poppins text-xs font-semibold text-gray-700">{user.name}</span>
                              <span className="font-poppins text-[10px] text-gray-400">@{user.username}</span>
                            </div>
                          </div>
                          <UserPlus size={16} className="text-primary-500 mr-2" />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* CO-OWNERS LIST — derived from collaborator_ids + mock DB */}
          <div className="flex flex-col gap-3">
            <h4 className="font-poppins font-medium text-gray-500 text-sm">Co-Owners</h4>
            <div className="border border-gray-100 rounded-[24px] bg-white overflow-hidden">
              <AnimatePresence initial={false}>
                {addedCollaborators.length > 0 ? (
                  addedCollaborators.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`flex items-center justify-between p-4 ${
                        index !== addedCollaborators.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-50">
                          <Image src={item.avatar} fill alt={item.name} className="object-cover" sizes="40px" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-poppins font-medium text-gray-700 text-sm">{item.name}</span>
                          <span className="font-poppins text-[10px] text-gray-400">@{item.username}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(item.id)}
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

          {/* MATERIALS / TOOLS — maps to draft.tools_used: string[] */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-semibold text-black text-base">Materials / Tools Used</h3>
              <CircleHelp size={18} className="text-primary-500 cursor-help" />
              <span className="text-gray-300 text-sm">( Optional )</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {toolsUsed.map((tool) => (
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
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
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
                placeholder="Type a tool and press Enter"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={handleAddTool}
                disabled={toolsUsed.length >= 10}
                className="pl-12 rounded-full py-4 text-sm focus:ring-primary-500"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <p className="text-gray-300 text-[10px] md:text-xs">Maximum 10</p>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 px-6 flex gap-4 border-t border-gray-50 bg-white sticky bottom-0">
        <Button
          variant="outline"
          fullWidth
          onClick={handleBackStep}
          className="rounded-full py-4 border-primary-500 text-primary-500 flex items-center justify-center gap-2 hover:bg-primary-50"
        >
          <Image src="/icons/alt-arrow-left-double-red.svg" width={18} height={18} alt="back icon" />
          Back
        </Button>
        <Button
          fullWidth
          onClick={handleNextStep}
          className="rounded-full py-4 bg-primary-500 text-white flex items-center justify-center gap-2 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
        >
          Next
          <Image src="/icons/alt-arrow-right-double.svg" width={18} height={18} alt="next icon" />
        </Button>
      </div>
    </div>
  )
}

export default UploadArtCollaborators