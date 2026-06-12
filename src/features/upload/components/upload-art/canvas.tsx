'use client'

import React from 'react'
import Image from 'next/image'
import type { LocalAsset, ModalType } from './types'

// ── Asset thumbnail strip ──────────────────────────────────────────────────────

interface AssetStripProps {
  assets:   LocalAsset[]
  onRemove: (idx: number) => void
}

export function AssetStrip({ assets, onRemove }: AssetStripProps) {
  if (assets.length === 0) return null
  return (
    <div className="flex gap-2 flex-wrap mt-3">
      {assets.map((a, i) => (
        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 group">
          {a.type === 'IMAGE' ? (
            // eslint-next-line @next/next/no-img-element
            <Image src={a.url} alt={a.name} fill className="w-full h-full object-cover" />
          ) : a.type === 'VIDEO' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 6L15 10L7 14V6Z" fill="white" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H11" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
          <button
            onClick={() => onRemove(i)}
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Upload type buttons config ─────────────────────────────────────────────────

const UPLOAD_BUTTONS: { imgSrc: string; text: string; modal: Exclude<ModalType, null> }[] = [
  { imgSrc: '/icons/image.svg',       text: 'Image',      modal: 'image' },
  { imgSrc: '/icons/code-square.svg', text: 'Embed',      modal: 'embed' },
  { imgSrc: '/icons/video.svg',       text: 'Video/Audio', modal: 'video' },
  { imgSrc: '/icons/box.svg',         text: '3D',         modal: '3d'    },
]

// ── Canvas ─────────────────────────────────────────────────────────────────────

interface UploadArtCanvasProps {
  localAssets:   LocalAsset[]
  onOpenModal:   (type: Exclude<ModalType, null>) => void
  onRemoveAsset: (idx: number) => void
}

export function UploadArtCanvas({ localAssets, onOpenModal, onRemoveAsset }: UploadArtCanvasProps) {
  const hasAssets    = localAssets.length > 0
  const primaryAsset = localAssets[0]

  return (
    /* FIXED: Replaced flex-1 and max-h with a solid height, and dropped global centering alignment */
    <div className="relative w-full h-[550px] bg-[url('/images/upload-bg.png')] bg-repeat bg-white border border-gray-50 rounded-2xl flex flex-col overflow-hidden shadow-sm">

      {hasAssets && primaryAsset ? (
        <div className="w-full h-full flex flex-col p-6 relative">
          
          {/* FIXED: Gave the wrapper definitive flex-1 weight and absolute layout targeting for the raw img */}
          <div className="flex-1 w-full relative overflow-hidden rounded-xl">
            {primaryAsset.type === 'IMAGE' ? (
              <img 
                src={primaryAsset.url} 
                alt="Primary artwork" 
                className="absolute inset-0 w-full h-full object-contain" 
              />
            ) : primaryAsset.type === 'VIDEO' ? (
              <video src={primaryAsset.url} controls className="absolute inset-0 w-full h-full object-contain bg-gray-900" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M6 10H34M6 20H34M6 30H22" stroke="#A5ABB6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-[#A5ABB6] max-w-xs text-center truncate px-4">{primaryAsset.name}</p>
              </div>
            )}
          </div>

          {/* Secondary thumbnail strip - shows if you have at least 1 asset */}
          {localAssets.length > 0 && (
            <div className="mt-4 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl p-3 z-20">
              <AssetStrip assets={localAssets} onRemove={onRemoveAsset} />
            </div>
          )}
        </div>
      ) : (
        /* Empty state — Center alignment is applied isolated here so it doesn't break the asset view */
        <div className="w-full h-full flex flex-wrap items-center justify-center gap-8 md:gap-12 p-4">
          {UPLOAD_BUTTONS.map((item) => (
            <button
              key={item.modal}
              onClick={() => onOpenModal(item.modal)}
              className="cursor-pointer group flex flex-col items-center justify-center gap-y-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-[88px] h-[88px] bg-gray-800 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                <Image src={item.imgSrc} width={32} height={32} alt={`${item.text} icon`} />
              </div>
              <h5 className="font-poppins text-base font-medium leading-6 text-center tracking-wide text-black">
                {item.text}
              </h5>
            </button>
          ))}
        </div>
      )}

      {/* Top-left canvas controls */}
      <div className="absolute top-6 left-6 p-2 flex flex-col gap-3 bg-gray-300/60 rounded-2xl backdrop-blur-sm z-10">
        {[
          { src: '/icons/pen.svg',              alt: 'pencil icon'     },
          { src: '/icons/arrow-up-round.svg',  alt: 'Arrow up icon'   },
          { src: '/icons/arrow-down-round.svg', alt: 'Arrow down icon' },
        ].map((btn) => (
          <button
            key={btn.src}
            className="flex items-center justify-center w-10 h-10 border-2 border-white rounded-full hover:bg-white/20 transition-colors"
          >
            <Image src={btn.src} width={20} height={20} alt={btn.alt} />
          </button>
        ))}
      </div>
    </div>
  )
}