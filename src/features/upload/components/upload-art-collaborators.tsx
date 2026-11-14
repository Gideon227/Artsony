'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, Minus, Loader2, UserPlus } from 'lucide-react'
import { Button, Input } from '@/components'
import { Avatar } from '@/components/ui/avatar'
import { useArtworkStore } from '@/store/artwork.store'
import { useAuthStore, selectUser } from '@/store'
import { useUsersByIds, useUserSearch } from '@/hooks/use-user'
import type { PublicProfileSummary } from '@/services/user.service'
import UploadHeader from './upload-header'

interface UploadStepThreeProps {
  id?: string;
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  steps: string;
  number: string;
}

// Matches the backend's `at most 10 collaborators allowed` validation.
const MAX_COLLABORATORS = 10
const MAX_TOOLS = 10

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const displayNameOf = (u: PublicProfileSummary) => u.profile?.display_name?.trim() || u.username

const UploadArtCollaborators = ({ onNext, onBack, onSaveAndExit, number, steps }: UploadStepThreeProps) => {
  const owner = useAuthStore(selectUser)

  const draft = useArtworkStore((state) => state.draft)
  const setDraftField = useArtworkStore((state) => state.setDraftField)
  const setDraftStep  = useArtworkStore((state) => state.setDraftStep)

  const [isSearchingUser, setIsSearchingUser] = useState(false)
  const [userSearchQuery, setUserSearchQuery]  = useState('')
  const [toolInput, setToolInput]              = useState('')
  // Users picked this session — lets a new co-owner render instantly instead
  // of waiting on the by-ids lookup that backs the persisted id list.
  const [picked, setPicked] = useState<Record<string, PublicProfileSummary>>({})

  const storedIds = draft.collaborator_ids
  const toolsUsed = draft.tools_used ?? []

  // Only real user UUIDs can be saved/resolved. Drafts created before this
  // component hit the API hold placeholder ids ('1', '2', …) that the backend
  // would reject — drop them rather than letting them break save.
  const collaboratorIds = useMemo(() => (storedIds ?? []).filter((id) => UUID_RE.test(id)), [storedIds])

  useEffect(() => {
    if ((storedIds ?? []).length !== collaboratorIds.length) {
      setDraftField('collaborator_ids', collaboratorIds)
    }
  }, [storedIds, collaboratorIds, setDraftField])

  const { data: resolvedUsers, isLoading: isResolving } = useUsersByIds(collaboratorIds)

  const collaborators = useMemo(() => {
    const byId = new Map((resolvedUsers ?? []).map((u) => [u.id, u]))
    return collaboratorIds.map((id) => ({ id, user: byId.get(id) ?? picked[id] ?? null }))
  }, [collaboratorIds, resolvedUsers, picked])

  const { results, isSearching, isError, hasMinLength } = useUserSearch(userSearchQuery)

  // Hide people who are already added (the API already excludes the owner).
  const searchResults = useMemo(
    () => results.filter((u) => !collaboratorIds.includes(u.id) && u.id !== owner?.id),
    [results, collaboratorIds, owner?.id],
  )

  const atMaxCollaborators = collaboratorIds.length >= MAX_COLLABORATORS

  // --- Collaborator handlers — only the id is persisted to the draft ---
  const closeSearch = () => {
    setIsSearchingUser(false)
    setUserSearchQuery('')
  }

  const handleAddCollaborator = (user: PublicProfileSummary) => {
    if (atMaxCollaborators || collaboratorIds.includes(user.id)) return
    setPicked((prev) => ({ ...prev, [user.id]: user }))
    setDraftField('collaborator_ids', [...collaboratorIds, user.id])
    closeSearch()
  }

  const handleRemoveCollaborator = (userId: string) => {
    setDraftField('collaborator_ids', collaboratorIds.filter((id) => id !== userId))
  }

  // --- Tools handlers ---
  const handleAddTool = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const cleaned = toolInput.trim()
    if (cleaned && !toolsUsed.includes(cleaned) && toolsUsed.length < MAX_TOOLS) {
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

  const ownerName = owner?.displayName?.trim() || owner?.username || 'You'

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
                disabled={atMaxCollaborators}
                className="w-full cursor-pointer border-2 border-dashed border-gray-100 rounded-[32px] py-6 flex items-center justify-center gap-2 group hover:border-primary-200 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="bg-primary-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Plus size={16} color="white" />
                </div>
                <span className="font-poppins font-medium text-primary-500 text-sm md:text-base">
                  {atMaxCollaborators ? `Maximum of ${MAX_COLLABORATORS} collaborators reached` : 'Add Collaborator'}
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full border border-gray-100 rounded-[24px] p-4 bg-gray-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative flex items-center gap-2">
                  <Input
                    placeholder="Search by name or username..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') closeSearch() }}
                    className="w-full pr-10 pl-4 py-3 rounded-full border border-gray-100 text-sm focus:ring-primary-500 bg-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    aria-label="Close search"
                    className="absolute right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                {!hasMinLength && (
                  <p className="px-2 py-1 font-poppins text-xs text-gray-300">
                    Type at least 2 characters to search
                  </p>
                )}

                {hasMinLength && isSearching && searchResults.length === 0 && (
                  <div className="flex items-center gap-2 px-2 py-3 font-poppins text-xs text-gray-400">
                    <Loader2 size={14} className="animate-spin" /> Searching...
                  </div>
                )}

                {hasMinLength && !isSearching && isError && (
                  <p className="px-2 py-3 font-poppins text-xs text-error-500">
                    Couldn't search right now. Please try again.
                  </p>
                )}

                {hasMinLength && !isSearching && !isError && searchResults.length === 0 && (
                  <p className="px-2 py-3 font-poppins text-xs text-gray-400">
                    No users found for "{userSearchQuery.trim()}"
                  </p>
                )}

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-white border border-gray-50 rounded-2xl max-h-56 overflow-y-auto mt-1 divide-y divide-gray-50 shadow-inner"
                    >
                      {searchResults.map((user) => (
                        <button
                          type="button"
                          key={user.id}
                          onClick={() => handleAddCollaborator(user)}
                          className="w-full cursor-pointer flex items-center justify-between p-3 text-left hover:bg-primary-50/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={user.profile?.avatar_url} name={displayNameOf(user)} size="sm" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-poppins text-xs font-semibold text-gray-700 truncate">{displayNameOf(user)}</span>
                              <span className="font-poppins text-[10px] text-gray-400 truncate">@{user.username}</span>
                            </div>
                          </div>
                          <UserPlus size={16} className="text-primary-500 mr-2 shrink-0" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* OWNER — the signed-in user, who is always the artwork's owner */}
          <div className="flex flex-col gap-3">
            <h4 className="font-poppins font-medium text-gray-500 text-sm">Owner</h4>
            <div className="flex items-center gap-4">
              <Avatar src={owner?.avatar_url} name={ownerName} size="lg" />
              <span className="font-poppins font-medium text-gray-700 text-sm md:text-base">{ownerName}</span>
            </div>
          </div>

          {/* CO-OWNERS — persisted ids, resolved to real profiles */}
          {collaborators.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="font-poppins font-medium text-gray-500 text-sm">Co-Owners</h4>
              <div className="border border-gray-100 rounded-[24px] bg-white overflow-hidden">
                <AnimatePresence initial={false}>
                  {collaborators.map(({ id, user }, index) => (
                    <motion.div
                      key={id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`flex items-center justify-between px-4 py-3 ${
                        index !== collaborators.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {user ? (
                          <>
                            <Avatar src={user.profile?.avatar_url} name={displayNameOf(user)} size="md" />
                            <span className="font-poppins font-medium text-gray-700 text-sm truncate">{displayNameOf(user)}</span>
                          </>
                        ) : isResolving ? (
                          <>
                            <div className="h-10 w-10 rounded-full bg-gray-50 animate-pulse" />
                            <div className="h-3 w-28 rounded bg-gray-50 animate-pulse" />
                          </>
                        ) : (
                          <>
                            <Avatar name="?" size="md" />
                            <span className="font-poppins text-sm text-gray-300 italic">User unavailable</span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(id)}
                        aria-label={`Remove ${user ? displayNameOf(user) : 'collaborator'}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gray-50 hover:border-gray-100 transition-colors"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4B5563]">
                          <Minus size={12} color="#fff" strokeWidth={3} />
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* MATERIALS / TOOLS — maps to draft.tools_used: string[] */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-semibold text-black text-base">Materials / Tools Used</h3>
              <span
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2D9CDB] text-[12px] font-bold leading-none text-white"
              >
                ?
              </span>
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
                    className="bg-primary-500 text-white rounded-full py-2 pl-4 pr-2 flex items-center gap-2"
                  >
                    <span className="text-xs md:text-sm font-medium">{tool}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      aria-label={`Remove ${tool}`}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-500 hover:bg-white/90 transition-colors"
                    >
                      <X size={12} strokeWidth={3} />
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
                disabled={toolsUsed.length >= MAX_TOOLS}
                className="pl-12 rounded-full py-4 text-sm focus:ring-primary-500"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
            <p className="text-gray-300 text-[10px] md:text-xs">Maximum {MAX_TOOLS}</p>
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
