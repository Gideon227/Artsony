'use client'

import { Button } from '@/components'
import { StepperInput } from '@/components/ui/quantity-input'
import { CartItemWithArtwork } from '@/types/cart'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'

const EditCartItem = ({ 
  item, 
  isOpen,
  isUpdating, 
  isDigital, 
  onClose,
  onSave, 
  maxQty 
}: { 
  item: CartItemWithArtwork, 
  isOpen: boolean,
  isUpdating: boolean, 
  isDigital: boolean, 
  onClose: () => void,
  onSave: (newQty: number) => void,
  maxQty: number 
}) => {
  // Use a local state for the modal's stepper so it only commits on Save
  const [modalQty, setModalQty] = useState(item.quantity)

  // Reset the modal quantity to match the item whenever it opens
  useEffect(() => {
    if (isOpen) {
      setModalQty(item.quantity)
    }
  }, [isOpen, item.quantity])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Black background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container: Animates from bottom */}
          <div className="fixed inset-0 z-[51] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="pointer-events-auto flex flex-col gap-y-12 p-6 lg:p-8 bg-white border border-gray-50 rounded-2xl w-[343px] lg:w-md shadow-xl"
            >
              <div className='flex flex-col gap-y-8'>
                <div className='flex flex-col gap-y-4'>
                  <div className="relative h-[263px] w-full lg:h-[304px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                    <Image
                      src={item.artwork.thumbnail_url || '/placeholder.png'}
                      alt={item.artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <p className='font-poppins font-medium text-heading text-body-s lg:text-body-m tracking-wide'>
                    {item.artwork.title}
                  </p>
                </div>

                <div className='flex flex-col gap-y-4'>
                    <div className='flex items-center justify-between'>
                        <p className='font-poppins font-medium text-body text-body-s tracking-wide'>
                        Price: {' '} 
                        <span className='text-primary-500'>
                            $ {item.price_at_add.toLocaleString('en-US')} {item.currency_at_add}
                        </span>
                        </p>
                        <p className='font-poppins font-light text-body text-body-xs tracking-wide'>
                        Available Quantity: {' '} <span className='text-primary-500'>{maxQty}</span>
                        </p>
                    </div>

                    {/* Stepper only updates modalQty here */}
                    <div className="flex flex-1 w-full items-center mx-auto">
                        <StepperInput
                            value={modalQty}
                            min={1}
                            max={maxQty}
                            disabled={isDigital || isUpdating}
                            onValueChange={setModalQty}
                            className='w-full flex-1'
                        />
                    </div>
                </div>
              </div>

              <div className='flex items-center justify-between gap-x-4'>
                <Button fullWidth variant='outline' onClick={onClose} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button fullWidth onClick={() => onSave(modalQty)} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default EditCartItem