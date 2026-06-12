// features/upload/components/upload-step-two.tsx
'use client'

import { Button, Switch } from "@/components"
import { Dropdown, DropdownOption } from "@/components/ui/dropdown"
import React, { useMemo } from 'react'
import { useArtworkStore, selectDraft } from '@/store/artwork.store'
import type { ArtworkVisibility } from '@/types/artwork'
import UploadHeader from "./upload-header"

interface UploadStepTwoProps {
  id?: string; 
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  steps: string;
  number: string;
}

const UploadStepTwo = ({ onNext, onBack, onSaveAndExit, steps, number }: UploadStepTwoProps) => {
  const draft = useArtworkStore(selectDraft)
  const setDraftField = useArtworkStore((state) => state.setDraftField)
  const setDraftStep  = useArtworkStore((state) => state.setDraftStep)

  const licenseOptions: DropdownOption[] = useMemo(() => [
    { id: 'attribution', rightIcon: true , label: 'Attribution (CC BY)', description: 'This license lets others remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation' },
    { id: 'attribution-sharealike', rightIcon: true , label: 'Attribution-ShareAlike (CC BY-SA)', description: 'This license lets others remix, adapt, and build upon your work, even for commercial purposes, as long as they credit you and license their new creations under identical terms.' },
    { id: 'attribution-derivs', rightIcon: true , label: 'Attribution Derivs (CC BY-ND)', description: 'This license lets others reuse the work for any purpose, including commercially; however, it cannot be shared with others in adapted form, and credit must be provided to you.' },
    { id: 'attribution-non-commercial', rightIcon: true , label: 'Attribution-Non-commercial (CC BY-NC)', description: 'This license lets others remix, adapt, and build upon your work non-commercially, and although their new work must also acknowledge you and be non-commercial, they dont have to license their derivative works on the same terms.' },
  ], [])

  const visibilityOptions: DropdownOption[] = useMemo(() => [
    { id: 'PUBLIC', rightIcon: true, label: 'Everyone' },
    { id: 'PRIVATE', rightIcon: true, label: 'Only Me' },
  ], [])

  // Hooked up to draft state. Defaults to first option if no draft value exists yet.
  const selectedLicense = licenseOptions.find((o) => o.id === (draft as any).license) ?? licenseOptions[0]
  
  const selectedVisibility = visibilityOptions.find((o) => o.id === draft.visibility) ?? visibilityOptions[0]

  // const handleNextStep = () => {
  //   setDraftStep(2)
  //   onNext()
  // }

  const handleBackStep = () => {
    setDraftStep(0)
    onBack()
  }

  return (
    <div className='border border-gray-50 rounded-2xl flex flex-col justify-between bg-white overflow-hidden'>
      <div>
        <UploadHeader 
          number={number}
          steps={steps}
          onSaveAndExit={onSaveAndExit}
        />

        <div className="p-6 flex flex-col gap-8">
          {/* LICENSING */}
          <div className="flex flex-col gap-3 relative">
            <label className='font-poppins font-medium text-black text-body-s leading-6 tracking-wide flex items-start'>
              <span className='text-primary-500 mr-1'>*</span> Licensing & Usage Rights
            </label>
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 text-body-xs leading-5">
                Decide how others can use or share this artwork, if at all. You're in full control — choose a license that reflects your intent.
              </p>
              <p className="text-gray-300 text-[11px]">
                Not sure what each option means? Hover over a license
              </p>
            </div>
            <Dropdown
              options={licenseOptions}
              value={selectedLicense}
              onChange={(option) => {
                // WIRED UP: Saves selected license to the payload
                setDraftField('license' as any, option.id)
              }}
              placeholder="All rights reserved"
              className="font-poppins text-gray-700 text-sm"
            />
          </div>

          {/* VISIBILITY */}
          <div className="flex flex-col gap-3 relative">
            <label className='font-poppins font-medium text-black text-body-s leading-6 tracking-wide flex items-start'>
              <span className='text-primary-500 mr-1'>*</span> Who can see this artwork?
            </label>
            <Dropdown
              options={visibilityOptions}
              value={selectedVisibility}
              onChange={(option) => setDraftField('visibility', option.id as ArtworkVisibility)}
              placeholder="Select Visibility"
              className="font-poppins text-gray-700 text-sm"
            />
          </div>

          {/* TOGGLES */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-poppins font-medium text-black text-body-s">Enable Moodboard Save</h3>
                <p className="text-gray-400 text-body-xs leading-5">
                  Let other users collect and save your work into personal moodboards
                </p>
              </div>
              <Switch
                checked={draft.allow_moodboard_save ?? true}
                onCheckedChange={(checked) => setDraftField('allow_moodboard_save', checked)}
              />
            </div>

            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-poppins font-medium text-black text-body-s">Allow comments on this artwork?</h3>
                <p className="text-gray-400 text-body-xs leading-5">
                  Turn on comments to receive feedback, love, or questions from the Artsony community.
                </p>
              </div>
              <Switch
                checked={draft.allow_comments ?? true}
                onCheckedChange={(checked) => setDraftField('allow_comments', checked)}
              />
            </div>

            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-poppins font-medium text-black text-body-s">Allow Likes & Stats</h3>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400 text-body-xs leading-5">
                    Enable this to let viewers appreciate your work and help the algorithm learn what inspires others.
                  </p>
                  <p className="text-gray-400 text-body-xs leading-5">
                    Hiding stats can be useful if you want a quieter, less metric-driven space.
                  </p>
                </div>
              </div>
              <Switch
                checked={draft.allow_likes ?? true}
                onCheckedChange={(checked) => setDraftField('allow_likes', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className='py-6 px-6 items-center flex gap-4 border-t border-gray-50'>
        <Button
          leftIcon='/icons/alt-arrow-left-double-red.svg'
          fullWidth
          variant='outline'
          className="border-primary-500 text-primary-500 hover:bg-primary-50"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          rightIcon='/icons/alt-arrow-right-double.svg'
          fullWidth
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default UploadStepTwo