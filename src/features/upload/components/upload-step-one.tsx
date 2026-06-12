'use client'
import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button, Input, Textarea } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { useArtworkStore } from '@/store/artwork.store'
import { INTERESTS } from '@/features/onboarding/data/interests'
import Router from 'next/router'
import UploadHeader from './upload-header'

interface UploadStepOneProps {
  id?: string; // no longer used for store lookup, keep for layout key if needed
  onNext: () => void;
  onSaveAndExit: () => void;
  steps: string;
  number: string
}

const UploadStepOne = ({ onNext, onSaveAndExit, steps, number }: UploadStepOneProps) => {
  const draft = useArtworkStore((state) => state.draft)
  const setDraftField = useArtworkStore((state) => state.setDraftField)
  const setDraftStep  = useArtworkStore((state) => state.setDraftStep)

  const [keywordInput, setKeywordInput] = useState('')

  // --- Dynamic Option Mapping ---
  const availableDropdownOptions = useMemo((): DropdownOption[] => {
    const currentCategories = draft.categories ?? []

    const remaining = INTERESTS.filter(
      (interest) => !currentCategories.includes(interest.label)
    )

    if (remaining.length === 0) {
      return [{
        id: 'no-match',
        label: 'All categories selected',
        disabled: true,
        icon: '/icons/info-circle.svg',
      }]
    }

    return remaining.map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.image,
    }))
  }, [draft.categories])

  // --- Handlers ---
  const handleSelectCategory = (option: DropdownOption) => {
    if (option.id === 'no-match') return
    const current = draft.categories ?? []
    if (current.length >= 10) return
    setDraftField('categories', [...current, option.label])
  }

  const handleRemoveCategory = (catLabel: string) => {
    const current = draft.categories ?? []
    setDraftField('categories', current.filter((c) => c !== catLabel))
  }

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const current   = draft.keywords ?? []
    const cleaned   = keywordInput.trim().replace(/#/g, '')

    if (cleaned && !current.includes(cleaned) && current.length < 3) {
      setDraftField('keywords', [...current, cleaned])
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (kw: string) => {
    const current = draft.keywords ?? []
    setDraftField('keywords', current.filter((k) => k !== kw))
  }

  const handleNextStep = () => {
    setDraftStep(2)
    onNext()
  }

  // --- Validation ---
  const categories = draft.categories ?? []
  const keywords   = draft.keywords   ?? []

  const isFormValid =
    (draft.title ?? '').trim().length > 0 &&
    (draft.description ?? '').trim().length > 0 &&
    categories.length >= 1 &&
    categories.length <= 10 &&
    keywords.length >= 1 &&
    keywords.length <= 3

  return (
    <div className='border border-gray-50 rounded-2xl flex flex-col justify-between bg-white'>
      <div>
        {/* TOP CONTROLS */}
        <UploadHeader
          number={number}
          steps={steps}
          onSaveAndExit={onSaveAndExit}
        />

        {/* FORM FIELDS */}
        <div className='p-6 gap-6 flex flex-col justify-between'>

          {/* Artwork Name */}
          <div className='flex flex-col gap-2 relative'>
            <label className='font-poppins font-medium text-black text-[14px] leading-6 tracking-wide'>
              Artwork name
            </label>
            <Input
              value={draft?.title ?? ''}
              onChange={(e) => setDraftField('title', e.target.value)}
              placeholder='What do you want to call this piece?'
            />
            <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
          </div>

          {/* Artwork Description */}
          <div className='flex flex-col gap-2 relative'>
            <label className='font-poppins font-medium text-black text-body-s leading-6 tracking-wide'>
              Artwork description
            </label>
            <Textarea
              value={draft.description ?? ''}
              onChange={(e) => setDraftField('description', e.target.value)}
              placeholder='Tell the story behind this piece'
              maxLength={2500}
            />
            <p className='font-poppins text-gray-200 text-body-xxs tracking-wide text-start'>
              500 words maximum
            </p>
            <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
          </div>

          {/* Categories */}
          <div className='flex flex-col gap-2 relative'>
            <label className='font-poppins font-medium text-black text-body-s leading-6 tracking-wide'>
              Categories / Interests
            </label>

            {categories.length > 0 && (
              <div className='flex flex-wrap items-center gap-2 mb-1'>
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className='border border-gray-50 bg-[#F15A2B] rounded-full py-1.5 px-3 flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-150'
                  >
                    <p className='font-poppins font-medium text-white text-body-xs leading-none tracking-wide'>
                      {cat}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className='hover:opacity-80 transition-opacity'
                    >
                      <Image src="/icons/cancel-close.svg" width={16} height={16} alt='remove' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Dropdown
              options={availableDropdownOptions}
              onChange={handleSelectCategory}
              placeholder="Select structural interests..."
              disabled={categories.length >= 10}
              variant="default"
              leftIcon="/home/magnifier.svg"
            />
            <p className='font-poppins text-gray-200 text-body-xxs tracking-wide text-start'>
              Minimum 1, Maximum 10
            </p>
            <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
          </div>

          {/* Keywords */}
          <div className='flex flex-col gap-2 relative'>
            <label className='font-poppins font-medium flex text-black text-body-s leading-6 tracking-wide gap-1 items-center'>
              Keywords
              <button type="button">
                <Image src='/icons/question-circle.svg' width={20} height={20} alt='help' />
              </button>
            </label>

            {keywords.length > 0 && (
              <div className='flex flex-wrap items-center gap-2 mb-1'>
                {keywords.map((kw) => (
                  <div key={kw} className='py-1.5 px-3 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150'>
                    <p className='font-poppins text-gray-400 text-body-xs leading-6 tracking-wide'>#{kw}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className='bg-primary-500 border border-primary-500 cursor-pointer rounded-full flex items-center justify-center p-1 hover:bg-[#d44e24] transition-colors'
                    >
                      <X size={10} color='#fff' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Input
              placeholder='Enter keyword and press enter'
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              disabled={keywords.length >= 3}
            />
            <p className='font-poppins text-gray-200 text-[10px] tracking-wide text-start'>
              Minimum 1, Maximum 3
            </p>
            <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className='py-4 px-6 items-center border-t border-gray-50'>
        <Button
          rightIcon='/icons/alt-arrow-right-double.svg'
          fullWidth
          onClick={onNext}
          disabled={!isFormValid}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default UploadStepOne