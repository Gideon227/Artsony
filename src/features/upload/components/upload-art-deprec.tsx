// 'use client'

// import Image from 'next/image'
// import React, { useCallback, useRef, useState } from 'react'
// import { useArtworkStore } from '@/store/artwork.store'
// import { artworkService } from '@/services/artwork.service'
// import type { ArtworkMediaType } from '@/types/artwork'

// // ─── Types ────────────────────────────────────────────────────────────────────

// type ModalType = 'image' | 'video' | 'embed' | '3d' | null
// type ImageModalStep = 'drop' | 'success'
// type VideoModalStep = 'drop' | 'success'

// interface UploadedFile {
//   file: File
//   previewUrl: string
//   uploadedAsset?: {
//     original_url: string
//     optimized_url: string | null
//     thumbnail_url: string | null
//     mime_type: string
//     file_size_bytes: number
//     width: number | null
//     height: number | null
//   }
// }

// // ─── Accepted types ───────────────────────────────────────────────────────────

// const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff']
// const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.tiff,.tif'
// const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
// const ACCEPTED_VIDEO_EXTENSIONS = '.mp4,.mov,.avi,.mkv'
// const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024   // 50 MB
// const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024  // 500 MB

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatBytes(bytes: number): string {
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
// }

// function validateImageFile(file: File): string | null {
//   if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
//     return 'Invalid file type. Please upload JPG, PNG, or TIFF.'
//   }
//   if (file.size > MAX_IMAGE_SIZE_BYTES) {
//     return `File too large. Maximum size is 50 MB (your file: ${formatBytes(file.size)}).`
//   }
//   return null
// }

// function validateVideoFile(file: File): string | null {
//   if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
//     return 'Invalid file type. Please upload MP4, MOV, AVI, or MKV.'
//   }
//   if (file.size > MAX_VIDEO_SIZE_BYTES) {
//     return `File too large. Maximum size is 500 MB (your file: ${formatBytes(file.size)}).`
//   }
//   return null
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// // Close (X) button used in every modal
// function ModalCloseBtn({ onClose }: { onClose: () => void }) {
//   return (
//     <button
//       onClick={onClose}
//       className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
//       aria-label="Close"
//     >
//       <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//         <path d="M1 1L13 13M13 1L1 13" stroke="#525965" strokeWidth="1.8" strokeLinecap="round" />
//       </svg>
//     </button>
//   )
// }

// // Back arrow used inside modals
// function BackBtn({ onBack, label = 'Back' }: { onBack: () => void; label?: string }) {
//   return (
//     <button
//       onClick={onBack}
//       className="flex items-center gap-1.5 text-sm text-[#525965] hover:text-[#333333] transition-colors mb-4"
//     >
//       <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//         <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//       {label}
//     </button>
//   )
// }

// // Primary orange button
// function OrangeBtn({
//   children,
//   onClick,
//   disabled,
//   loading,
//   className = '',
// }: {
//   children: React.ReactNode
//   onClick?: () => void
//   disabled?: boolean
//   loading?: boolean
//   className?: string
// }) {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled || loading}
//       className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#F25B38] text-white text-sm font-semibold hover:bg-[#e04f2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
//     >
//       {loading && (
//         <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
//           <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//         </svg>
//       )}
//       {children}
//     </button>
//   )
// }

// // Outlined orange button
// function OutlineBtn({
//   children,
//   onClick,
//   disabled,
//   className = '',
// }: {
//   children: React.ReactNode
//   onClick?: () => void
//   disabled?: boolean
//   className?: string
// }) {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#F25B38] text-[#F25B38] text-sm font-semibold hover:bg-[#fff1ee] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
//     >
//       {children}
//     </button>
//   )
// }

// // Error message chip
// function ErrorMsg({ message }: { message: string }) {
//   return (
//     <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
//       <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
//         <path fillRule="evenodd" clipRule="evenodd"
//           d="M7 0.875C3.61 0.875 0.875 3.61 0.875 7C0.875 10.39 3.61 13.125 7 13.125C10.39 13.125 13.125 10.39 13.125 7C13.125 3.61 10.39 0.875 7 0.875ZM7.875 9.625H6.125V7.875H7.875V9.625ZM7.875 6.125H6.125V4.375H7.875V6.125Z"
//           fill="#E1350F" />
//       </svg>
//       <p className="text-xs text-[#E1350F] leading-relaxed">{message}</p>
//     </div>
//   )
// }

// // ─── Drag-over hook ───────────────────────────────────────────────────────────

// function useDragOver() {
//   const [isDragging, setIsDragging] = useState(false)
//   const handlers = {
//     onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) },
//     onDragLeave: () => setIsDragging(false),
//     onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) },
//   }
//   return { isDragging, handlers }
// }

// // ─── Image Modal ──────────────────────────────────────────────────────────────

// interface ImageModalProps {
//   onClose: () => void
//   onSaved: (files: UploadedFile[]) => void
// }

// function ImageModal({ onClose, onSaved }: ImageModalProps) {
//   const [step, setStep] = useState<ImageModalStep>('drop')
//   const [files, setFiles] = useState<UploadedFile[]>([])
//   const [error, setError] = useState<string | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({})
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const { isDragging, handlers } = useDragOver()

//   const processFiles = useCallback(async (rawFiles: FileList | File[]) => {
//     setError(null)
//     const arr = Array.from(rawFiles)
//     const newFiles: UploadedFile[] = []
//     for (const f of arr) {
//       const err = validateImageFile(f)
//       if (err) { setError(err); return }
//       newFiles.push({ file: f, previewUrl: URL.createObjectURL(f) })
//     }
//     if (newFiles.length === 0) return

//     setUploading(true)
//     try {
//       const uploaded: UploadedFile[] = []
//       for (const uf of newFiles) {
//         setUploadProgress(p => ({ ...p, [uf.file.name]: false }))
//         const asset = await artworkService.uploadAsset(uf.file)
//         setUploadProgress(p => ({ ...p, [uf.file.name]: true }))
//         uploaded.push({ ...uf, uploadedAsset: asset })
//       }
//       setFiles(prev => [...prev, ...uploaded])
//       setStep('success')
//     } catch {
//       setError('Upload failed. Please check your connection and try again.')
//     } finally {
//       setUploading(false)
//     }
//   }, [])

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     handlers.onDrop(e)
//     const dropped = e.dataTransfer.files
//     if (dropped.length) processFiles(dropped)
//   }, [handlers, processFiles])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.length) processFiles(e.target.files)
//   }

//   const handleRemove = (idx: number) => {
//     setFiles(prev => {
//       const next = [...prev]
//       URL.revokeObjectURL(next[idx]!.previewUrl)
//       next.splice(idx, 1)
//       return next
//     })
//     if (files.length <= 1) setStep('drop')
//   }

//   const handleSave = () => {
//     onSaved(files)
//     onClose()
//   }

//   // ── Drop step ──
//   if (step === 'drop') {
//     return (
//       <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
//         <ModalCloseBtn onClose={onClose} />

//         {/* Title */}
//         <h2 className="text-xl font-semibold text-[#333333] mb-1">Upload Image</h2>
//         <p className="text-xs text-[#525965] mb-6">
//           Formats: JPG, PNG, TIFF&nbsp;&nbsp;•&nbsp;&nbsp;Max size: 50 MB
//           <br />Min 1200 px&nbsp;&nbsp;•&nbsp;&nbsp;Recommended 3000–4096 px
//         </p>

//         {/* Drop zone */}
//         <div
//           {...handlers}
//           onDrop={handleDrop}
//           onClick={() => fileInputRef.current?.click()}
//           className={`relative flex flex-col items-center justify-center gap-3 w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
//             ${isDragging ? 'border-[#F25B38] bg-[#fff5f3]' : 'border-[#E6E8EB] bg-gray-50 hover:border-[#F25B38] hover:bg-[#fff5f3]'}
//           `}
//         >
//           {/* Upload icon */}
//           <div className="w-11 h-11 rounded-full bg-[#FFF0EE] flex items-center justify-center">
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5" stroke="#F25B38" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
//               <path d="M3 14V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V14" stroke="#F25B38" strokeWidth="1.6" strokeLinecap="round" />
//             </svg>
//           </div>
//           <p className="text-sm text-[#525965]">
//             <span className="text-[#F25B38] font-medium">Click to upload</span> or drag and drop
//           </p>
//           <p className="text-xs text-[#A5ABB6]">JPG, PNG or TIFF</p>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept={ACCEPTED_IMAGE_EXTENSIONS}
//             multiple
//             className="hidden"
//             onChange={handleInputChange}
//           />
//         </div>

//         {uploading && (
//           <div className="mt-4 flex items-center gap-2 text-sm text-[#525965]">
//             <svg className="animate-spin w-4 h-4 text-[#F25B38]" viewBox="0 0 24 24" fill="none">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//             </svg>
//             Uploading…
//           </div>
//         )}

//         {error && <ErrorMsg message={error} />}

//         {/* Buttons */}
//         <div className="flex items-center gap-3 mt-6">
//           <OrangeBtn onClick={() => fileInputRef.current?.click()} loading={uploading}>
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//               <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               <path d="M2 12V13.5C2 13.7761 2.22386 14 2.5 14H13.5C13.7761 14 14 13.7761 14 13.5V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//             </svg>
//             Upload Image
//           </OrangeBtn>
//           <OutlineBtn onClick={onClose}>Cancel</OutlineBtn>
//         </div>
//       </div>
//     )
//   }

//   // ── Success step ──
//   return (
//     <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
//       <ModalCloseBtn onClose={onClose} />
//       <BackBtn onBack={() => setStep('drop')} />

//       <h2 className="text-xl font-semibold text-[#333333] mb-1">
//         {files.length} image{files.length !== 1 ? 's' : ''} ready
//       </h2>
//       <p className="text-xs text-[#525965] mb-5">Review your uploads before saving.</p>

//       {/* Preview grid */}
//       <div className="grid grid-cols-3 gap-3 mb-5 max-h-56 overflow-y-auto pr-1">
//         {files.map((uf, i) => (
//           <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={uf.previewUrl}
//               alt={uf.file.name}
//               className="w-full h-full object-cover"
//             />
//             <button
//               onClick={() => handleRemove(i)}
//               className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//               aria-label="Remove"
//             >
//               <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
//                 <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//               </svg>
//             </button>
//           </div>
//         ))}
//         {/* Add more tile */}
//         <button
//           onClick={() => fileInputRef.current?.click()}
//           className="aspect-square rounded-xl border-2 border-dashed border-[#E6E8EB] flex items-center justify-center hover:border-[#F25B38] hover:bg-[#fff5f3] transition-colors"
//         >
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path d="M10 4V16M4 10H16" stroke="#F25B38" strokeWidth="1.5" strokeLinecap="round" />
//           </svg>
//         </button>
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept={ACCEPTED_IMAGE_EXTENSIONS}
//           multiple
//           className="hidden"
//           onChange={handleInputChange}
//         />
//       </div>

//       {error && <ErrorMsg message={error} />}

//       <div className="flex items-center gap-3 mt-2">
//         <OrangeBtn onClick={handleSave}>Save</OrangeBtn>
//         <OutlineBtn onClick={() => { setFiles([]); setStep('drop') }}>Re-upload</OutlineBtn>
//       </div>
//     </div>
//   )
// }

// // ─── Video Modal ──────────────────────────────────────────────────────────────

// interface VideoModalProps {
//   onClose: () => void
//   onSaved: (file: UploadedFile) => void
// }

// function VideoModal({ onClose, onSaved }: VideoModalProps) {
//   const [step, setStep] = useState<VideoModalStep>('drop')
//   const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const { isDragging, handlers } = useDragOver()

//   const processFile = useCallback(async (file: File) => {
//     setError(null)
//     const err = validateVideoFile(file)
//     if (err) { setError(err); return }

//     setUploading(true)
//     try {
//       const asset = await artworkService.uploadAsset(file)
//       setUploadedFile({ file, previewUrl: URL.createObjectURL(file), uploadedAsset: asset })
//       setStep('success')
//     } catch {
//       setError('Upload failed. Please check your connection and try again.')
//     } finally {
//       setUploading(false)
//     }
//   }, [])

//   const handleDrop = (e: React.DragEvent) => {
//     handlers.onDrop(e)
//     const f = e.dataTransfer.files[0]
//     if (f) processFile(f)
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0]
//     if (f) processFile(f)
//   }

//   // ── Drop step ──
//   if (step === 'drop') {
//     return (
//       <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
//         <ModalCloseBtn onClose={onClose} />

//         <h2 className="text-xl font-semibold text-[#333333] mb-1">Upload Video</h2>
//         <p className="text-xs text-[#525965] mb-6">
//           Formats: MP4, MOV, AVI, MKV&nbsp;&nbsp;•&nbsp;&nbsp;Max size: 500 MB
//           <br />Max duration: 10 minutes&nbsp;&nbsp;•&nbsp;&nbsp;Min resolution: 720p
//         </p>

//         {/* Drop zone */}
//         <div
//           {...handlers}
//           onDrop={handleDrop}
//           onClick={() => fileInputRef.current?.click()}
//           className={`relative flex flex-col items-center justify-center gap-3 w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
//             ${isDragging ? 'border-[#F25B38] bg-[#fff5f3]' : 'border-[#E6E8EB] bg-gray-50 hover:border-[#F25B38] hover:bg-[#fff5f3]'}
//           `}
//         >
//           <div className="w-11 h-11 rounded-full bg-[#FFF0EE] flex items-center justify-center">
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <rect x="2" y="5" width="12" height="10" rx="2" stroke="#F25B38" strokeWidth="1.5" />
//               <path d="M14 9L18 7V13L14 11V9Z" stroke="#F25B38" strokeWidth="1.5" strokeLinejoin="round" />
//             </svg>
//           </div>
//           <p className="text-sm text-[#525965]">
//             <span className="text-[#F25B38] font-medium">Click to upload</span> or drag and drop
//           </p>
//           <p className="text-xs text-[#A5ABB6]">MP4, MOV, AVI or MKV</p>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept={ACCEPTED_VIDEO_EXTENSIONS}
//             className="hidden"
//             onChange={handleInputChange}
//           />
//         </div>

//         {/* Navigation arrows (from SVG design) */}
//         <div className="flex justify-center items-center gap-3 mt-4">
//           <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//             <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//               <path d="M8 10L4 6L8 2" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </button>
//           <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//             <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//               <path d="M4 2L8 6L4 10" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </button>
//         </div>

//         {uploading && (
//           <div className="mt-4 flex items-center gap-2 text-sm text-[#525965]">
//             <svg className="animate-spin w-4 h-4 text-[#F25B38]" viewBox="0 0 24 24" fill="none">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//             </svg>
//             Uploading video…
//           </div>
//         )}

//         {error && <ErrorMsg message={error} />}

//         <div className="flex items-center gap-3 mt-6">
//           <OrangeBtn onClick={() => fileInputRef.current?.click()} loading={uploading}>
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//               <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               <path d="M2 12V13.5C2 13.7761 2.22386 14 2.5 14H13.5C13.7761 14 14 13.7761 14 13.5V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//             </svg>
//             Upload Video
//           </OrangeBtn>
//           <OutlineBtn onClick={onClose}>Cancel</OutlineBtn>
//         </div>
//       </div>
//     )
//   }

//   // ── Success step ──
//   return (
//     <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
//       <ModalCloseBtn onClose={onClose} />
//       <BackBtn onBack={() => { setUploadedFile(null); setStep('drop') }} />

//       <h2 className="text-xl font-semibold text-[#333333] mb-1">Video ready</h2>
//       <p className="text-xs text-[#525965] mb-5">Your video has been uploaded successfully.</p>

//       {/* Video preview */}
//       {uploadedFile && (
//         <div className="w-full rounded-xl overflow-hidden bg-gray-900 mb-5 aspect-video">
//           <video
//             src={uploadedFile.previewUrl}
//             controls
//             className="w-full h-full object-contain"
//           />
//         </div>
//       )}

//       {/* Success indicator + file info */}
//       {uploadedFile && (
//         <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 mb-5">
//           <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//               <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-[#333333] truncate">{uploadedFile.file.name}</p>
//             <p className="text-xs text-[#525965]">{formatBytes(uploadedFile.file.size)}</p>
//           </div>
//         </div>
//       )}

//       {/* Navigation arrows */}
//       <div className="flex justify-center items-center gap-3 mb-5">
//         <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//             <path d="M8 10L4 6L8 2" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//         <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//             <path d="M4 2L8 6L4 10" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//       </div>

//       <div className="flex items-center gap-3">
//         <OrangeBtn
//           onClick={() => {
//             if (uploadedFile) { onSaved(uploadedFile); onClose() }
//           }}
//         >
//           Save
//         </OrangeBtn>
//         <OutlineBtn onClick={() => { setUploadedFile(null); setStep('drop') }}>Re-upload</OutlineBtn>
//       </div>
//     </div>
//   )
// }

// // ─── Embed Modal ──────────────────────────────────────────────────────────────

// interface EmbedModalProps {
//   onClose: () => void
//   onSaved: (url: string) => void
// }

// function EmbedModal({ onClose, onSaved }: EmbedModalProps) {
//   const [url, setUrl] = useState('')
//   const [error, setError] = useState<string | null>(null)

//   const handleSave = () => {
//     if (!url.trim()) { setError('Please enter a URL.'); return }
//     try {
//       new URL(url.trim())
//       setError(null)
//       onSaved(url.trim())
//       onClose()
//     } catch {
//       setError('Please enter a valid URL (e.g. https://example.com).')
//     }
//   }

//   return (
//     <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
//       <ModalCloseBtn onClose={onClose} />

//       <h2 className="text-xl font-semibold text-[#333333] mb-1">Embed / External Link</h2>
//       <p className="text-xs text-[#525965] mb-6">
//         Paste a URL to embed external content (Sketchfab, YouTube, Vimeo, etc.)
//       </p>

//       {/* Inner card matching SVG design */}
//       <div className="w-full rounded-2xl border border-[#E6E8EB] bg-white p-6 mb-5">
//         <label className="block text-xs font-medium text-[#525965] mb-2 uppercase tracking-wide">
//           Link URL
//         </label>
//         {/* Orange underline accent from SVG */}
//         <div className="relative">
//           <input
//             type="url"
//             value={url}
//             onChange={e => { setUrl(e.target.value); setError(null) }}
//             onKeyDown={e => e.key === 'Enter' && handleSave()}
//             placeholder="https://sketchfab.com/models/…"
//             className="w-full px-0 py-2 text-sm text-[#333333] border-0 border-b border-[#E6E8EB] outline-none focus:border-[#F25B38] bg-transparent transition-colors placeholder:text-[#A5ABB6]"
//           />
//           {/* Orange underline accent (from SVG path at 426.4) */}
//           <div className="h-0.5 w-12 bg-[#F25B38] mt-0" />
//         </div>

//         <p className="mt-3 text-xs text-[#A5ABB6] leading-relaxed">
//           Supported: Sketchfab, YouTube, Vimeo, SoundCloud, CodePen, and any URL that supports embedding.
//         </p>
//       </div>

//       {/* Navigation arrows */}
//       <div className="flex justify-center items-center gap-3 mb-5">
//         <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//             <path d="M8 10L4 6L8 2" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//         <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//             <path d="M4 2L8 6L4 10" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//       </div>

//       {error && <ErrorMsg message={error} />}

//       <div className="flex items-center gap-3 mt-4">
//         <OrangeBtn onClick={handleSave}>Save</OrangeBtn>
//         <OutlineBtn onClick={onClose}>Cancel</OutlineBtn>
//       </div>
//     </div>
//   )
// }

// // ─── 3D Modal ─────────────────────────────────────────────────────────────────

// interface ThreeDModalProps {
//   onClose: () => void
//   onSaved: (url: string) => void
// }

// function ThreeDModal({ onClose, onSaved }: ThreeDModalProps) {
//   const [url, setUrl] = useState('')
//   const [error, setError] = useState<string | null>(null)

//   const handleSave = () => {
//     if (!url.trim()) { setError('Please enter a 3D model URL.'); return }
//     try {
//       new URL(url.trim())
//       setError(null)
//       onSaved(url.trim())
//       onClose()
//     } catch {
//       setError('Please enter a valid URL (e.g. https://sketchfab.com/…).')
//     }
//   }

//   return (
//     <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
//       <ModalCloseBtn onClose={onClose} />

//       <h2 className="text-xl font-semibold text-[#333333] mb-1">Upload 3D Model</h2>
//       <p className="text-xs text-[#525965] mb-6">
//         Link a 3D model hosted on Sketchfab or another 3D platform.
//       </p>

//       {/* Inner card matching SVG design */}
//       <div className="w-full rounded-2xl border border-[#E6E8EB] bg-white p-6 mb-5">
//         <label className="block text-xs font-medium text-[#525965] mb-2 uppercase tracking-wide">
//           3D Model URL
//         </label>
//         <div className="relative">
//           <input
//             type="url"
//             value={url}
//             onChange={e => { setUrl(e.target.value); setError(null) }}
//             onKeyDown={e => e.key === 'Enter' && handleSave()}
//             placeholder="https://sketchfab.com/3d-models/…"
//             className="w-full px-0 py-2 text-sm text-[#333333] border-0 border-b border-[#E6E8EB] outline-none focus:border-[#F25B38] bg-transparent transition-colors placeholder:text-[#A5ABB6]"
//           />
//           <div className="h-0.5 w-12 bg-[#F25B38] mt-0" />
//         </div>

//         <p className="mt-3 text-xs text-[#A5ABB6] leading-relaxed">
//           Supported platforms: Sketchfab, Model Viewer (GLB/GLTF), and any embeddable 3D viewer.
//         </p>
//       </div>

//       {/* Navigation arrows */}
//       <div className="flex justify-center items-center gap-3 mb-5">
//         <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//             <path d="M8 10L4 6L8 2" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//         <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E6E8EB] hover:border-[#F25B38] transition-colors">
//           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//             <path d="M4 2L8 6L4 10" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//       </div>

//       {error && <ErrorMsg message={error} />}

//       <div className="flex items-center gap-3 mt-4">
//         <OrangeBtn onClick={handleSave}>Save</OrangeBtn>
//         <OutlineBtn onClick={onClose}>Cancel</OutlineBtn>
//       </div>
//     </div>
//   )
// }

// // ─── Save Draft Modal ─────────────────────────────────────────────────────────

// interface SaveDraftModalProps {
//   onClose: () => void
//   onConfirm: () => void
//   loading: boolean
// }

// function SaveDraftModal({ onClose, onConfirm, loading }: SaveDraftModalProps) {
//   return (
//     <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[400px] p-8 text-center">
//       <ModalCloseBtn onClose={onClose} />

//       {/* Draft icon */}
//       <div className="w-14 h-14 rounded-full bg-[#FFF0EE] flex items-center justify-center mx-auto mb-4">
//         <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
//           <path d="M5 6H21M5 10H21M5 14H15M5 18H12" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" />
//           <path d="M18 16L20 18L24 14" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </div>

//       <h2 className="text-lg font-semibold text-[#333333] mb-2">Save as Draft?</h2>
//       <p className="text-sm text-[#525965] mb-6 leading-relaxed">
//         Your artwork will be saved privately. You can come back and publish it any time.
//       </p>

//       <div className="flex items-center gap-3 justify-center">
//         <OrangeBtn onClick={onConfirm} loading={loading}>
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path d="M3 8.5L6 11.5L13 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           Save Draft
//         </OrangeBtn>
//         <OutlineBtn onClick={onClose} disabled={loading}>Cancel</OutlineBtn>
//       </div>
//     </div>
//   )
// }

// // ─── Publish Modal ────────────────────────────────────────────────────────────

// interface PublishModalProps {
//   onClose: () => void
//   onConfirm: () => void
//   loading: boolean
// }

// function PublishModal({ onClose, onConfirm, loading }: PublishModalProps) {
//   return (
//     <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[400px] p-8 text-center">
//       <ModalCloseBtn onClose={onClose} />

//       {/* Publish icon */}
//       <div className="w-14 h-14 rounded-full bg-[#FFF0EE] flex items-center justify-center mx-auto mb-4">
//         <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
//           <path d="M13 17V6M13 6L8 11M13 6L18 11" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M4 19V21C4 21.5523 4.44772 22 5 22H21C21.5523 22 22 21.5523 22 21V19" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" />
//         </svg>
//       </div>

//       <h2 className="text-lg font-semibold text-[#333333] mb-2">Publish Artwork?</h2>
//       <p className="text-sm text-[#525965] mb-6 leading-relaxed">
//         Your artwork will be visible to the public. Make sure everything looks good before publishing.
//       </p>

//       <div className="flex items-center gap-3 justify-center">
//         <OrangeBtn onClick={onConfirm} loading={loading}>
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           Publish
//         </OrangeBtn>
//         <OutlineBtn onClick={onClose} disabled={loading}>Cancel</OutlineBtn>
//       </div>
//     </div>
//   )
// }

// // ─── Modal Backdrop ───────────────────────────────────────────────────────────

// function ModalBackdrop({
//   children,
//   onClose,
// }: {
//   children: React.ReactNode
//   onClose: () => void
// }) {
//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center p-4"
//       style={{ background: 'rgba(0,0,0,0.45)' }}
//     >
//       {/* Click outside to close */}
//       <div className="absolute inset-0" onClick={onClose} />
//       <div className="relative z-10 w-full flex items-center justify-center">
//         {children}
//       </div>
//     </div>
//   )
// }

// // ─── Asset thumbnail strip ────────────────────────────────────────────────────

// interface AssetStripProps {
//   assets: Array<{ url: string; type: ArtworkMediaType | 'embed' | '3d'; name: string }>
//   onRemove: (idx: number) => void
// }

// function AssetStrip({ assets, onRemove }: AssetStripProps) {
//   if (assets.length === 0) return null
//   return (
//     <div className="flex gap-2 flex-wrap mt-3">
//       {assets.map((a, i) => (
//         <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 group">
//           {a.type === 'IMAGE' ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
//           ) : a.type === 'VIDEO' ? (
//             <div className="w-full h-full flex items-center justify-center bg-gray-800">
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <path d="M7 6L15 10L7 14V6Z" fill="white" />
//               </svg>
//             </div>
//           ) : (
//             <div className="w-full h-full flex items-center justify-center bg-gray-100">
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <path d="M3 5H17M3 10H17M3 15H11" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" />
//               </svg>
//             </div>
//           )}
//           <button
//             onClick={() => onRemove(i)}
//             className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//             aria-label="Remove"
//           >
//             <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
//               <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
//             </svg>
//           </button>
//         </div>
//       ))}
//     </div>
//   )
// }

// // ─── Main UploadArt component ─────────────────────────────────────────────────

// interface UploadArtProps {
//   onPublished?: () => void
//   onDraftSaved?: () => void
// }

// const UploadArt = ({ onPublished, onDraftSaved }: UploadArtProps) => {
//   const {
//     draft,
//     addDraftAsset,
//     removeDraftAsset,
//   } = useArtworkStore()

//   // Which overlay is open
//   const [activeModal, setActiveModal] = useState<ModalType>(null)
//   // Confirmation modals
//   const [showDraftModal, setShowDraftModal] = useState(false)
//   const [showPublishModal, setShowPublishModal] = useState(false)
//   // API loading states
//   const [savingDraft, setSavingDraft] = useState(false)
//   const [publishing, setPublishing] = useState(false)
//   const [apiError, setApiError] = useState<string | null>(null)
//   const [apiSuccess, setApiSuccess] = useState<string | null>(null)

//   // Local preview list (mirrors draft.assets for display)
//   const [localAssets, setLocalAssets] = useState<Array<{
//     url: string
//     type: ArtworkMediaType | 'embed' | '3d'
//     name: string
//   }>>([])

//   // ── Asset handlers ──────────────────────────────────────────────────────────

//   const handleImagesSaved = (files: UploadedFile[]) => {
//     files.forEach(uf => {
//       if (!uf.uploadedAsset) return
//       addDraftAsset({
//         original_url:    uf.uploadedAsset.original_url,
//         optimized_url:   uf.uploadedAsset.optimized_url,
//         thumbnail_url:   uf.uploadedAsset.thumbnail_url,
//         media_type:      'IMAGE',
//         mime_type:       uf.uploadedAsset.mime_type,
//         file_size_bytes: uf.uploadedAsset.file_size_bytes,
//         width:           uf.uploadedAsset.width,
//         height:          uf.uploadedAsset.height,
//         duration_secs:   null,
//         ordering_index:  (draft.assets?.length ?? 0),
//       })
//       setLocalAssets(prev => [...prev, {
//         url:  uf.uploadedAsset!.thumbnail_url ?? uf.uploadedAsset!.original_url,
//         type: 'IMAGE',
//         name: uf.file.name,
//       }])
//     })
//   }

//   const handleVideoSaved = (uf: UploadedFile) => {
//     if (!uf.uploadedAsset) return
//     addDraftAsset({
//       original_url:    uf.uploadedAsset.original_url,
//       optimized_url:   uf.uploadedAsset.optimized_url,
//       thumbnail_url:   uf.uploadedAsset.thumbnail_url,
//       media_type:      'VIDEO',
//       mime_type:       uf.uploadedAsset.mime_type,
//       file_size_bytes: uf.uploadedAsset.file_size_bytes,
//       width:           uf.uploadedAsset.width,
//       height:          uf.uploadedAsset.height,
//       duration_secs:   null,
//       ordering_index:  (draft.assets?.length ?? 0),
//     })
//     setLocalAssets(prev => [...prev, {
//       url:  uf.uploadedAsset!.thumbnail_url ?? uf.uploadedAsset!.original_url,
//       type: 'VIDEO',
//       name: uf.file.name,
//     }])
//   }

//   const handleEmbedSaved = (url: string) => {
//     addDraftAsset({
//       original_url:    url,
//       optimized_url:   null,
//       thumbnail_url:   null,
//       media_type:      'EXTERNAL_LINK',
//       mime_type:       'text/html',
//       file_size_bytes: 0,
//       width:           null,
//       height:          null,
//       duration_secs:   null,
//       ordering_index:  (draft.assets?.length ?? 0),
//     })
//     setLocalAssets(prev => [...prev, { url, type: 'embed', name: url }])
//   }

//   const handleThreeDSaved = (url: string) => {
//     addDraftAsset({
//       original_url:    url,
//       optimized_url:   null,
//       thumbnail_url:   null,
//       media_type:      'THREE_D',
//       mime_type:       'model/gltf+json',
//       file_size_bytes: 0,
//       width:           null,
//       height:          null,
//       duration_secs:   null,
//       ordering_index:  (draft.assets?.length ?? 0),
//     })
//     setLocalAssets(prev => [...prev, { url, type: '3d', name: url }])
//   }

//   const handleRemoveAsset = (idx: number) => {
//     removeDraftAsset(idx)
//     setLocalAssets(prev => {
//       const next = [...prev]
//       next.splice(idx, 1)
//       return next
//     })
//   }

//   // ── API actions ─────────────────────────────────────────────────────────────

//   const handleSaveDraft = async () => {
//     setApiError(null)
//     setSavingDraft(true)
//     try {
//       const payload = {
//         ...draft,
//         status: 'DRAFT' as const,
//         title: draft.title ?? 'Untitled',
//         description: draft.description ?? '',
//         listing_type: draft.listing_type ?? 'PORTFOLIO',
//         artwork_format: draft.artwork_format ?? 'DIGITAL',
//         view_count: draft.view_count ?? 0,
//         like_count: draft.like_count ?? 0,
//         save_count: draft.save_count ?? 0,
//         comment_count: draft.comment_count ?? 0,
//         has_variants: draft.has_variants ?? false,
//         assets: draft.assets ?? [],
//       }
//       await artworkService.create(payload)
//       setApiSuccess('Draft saved successfully!')
//       setShowDraftModal(false)
//       onDraftSaved?.()
//     } catch (e: unknown) {
//       setApiError(e instanceof Error ? e.message : 'Failed to save draft. Please try again.')
//     } finally {
//       setSavingDraft(false)
//     }
//   }

//   const handlePublish = async () => {
//     setApiError(null)
//     setPublishing(true)
//     try {
//       const payload = {
//         ...draft,
//         status: 'PUBLISHED' as const,
//         title: draft.title ?? 'Untitled',
//         description: draft.description ?? '',
//         listing_type: draft.listing_type ?? 'PORTFOLIO',
//         artwork_format: draft.artwork_format ?? 'DIGITAL',
//         view_count: draft.view_count ?? 0,
//         like_count: draft.like_count ?? 0,
//         save_count: draft.save_count ?? 0,
//         comment_count: draft.comment_count ?? 0,
//         has_variants: draft.has_variants ?? false,
//         assets: draft.assets ?? [],
//       }
//       const created = await artworkService.create(payload)
//       // Transition to published status
//       if (created.data?.id) {
//         await artworkService.publish(created.data.id)
//       }
//       setApiSuccess('Artwork published!')
//       setShowPublishModal(false)
//       onPublished?.()
//     } catch (e: unknown) {
//       setApiError(e instanceof Error ? e.message : 'Failed to publish artwork. Please try again.')
//     } finally {
//       setPublishing(false)
//     }
//   }

//   // ── Button data ─────────────────────────────────────────────────────────────

//   const btnComp = [
//     {
//       imgSrc: '/icons/image.svg',
//       text: 'Image',
//       onClickFunction: () => setActiveModal('image'),
//     },
//     {
//       imgSrc: '/icons/code-square.svg',
//       text: 'Embed',
//       onClickFunction: () => setActiveModal('embed'),
//     },
//     {
//       imgSrc: '/icons/video.svg',
//       text: 'Video/Audio',
//       onClickFunction: () => setActiveModal('video'),
//     },
//     {
//       imgSrc: '/icons/box.svg',
//       text: '3D',
//       onClickFunction: () => setActiveModal('3d'),
//     },
//   ]

//   const hasAssets = localAssets.length > 0
//   const primaryAsset = localAssets[0]

//   // ── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <div className="w-full h-full flex flex-col gap-7 justify-center items-center p-8 pt-20 min-h-screen flex-1">

//         {/* Main canvas */}
//         <div className="relative w-full flex-1 max-h-[600px] bg-[url('/images/upload-bg.png')] bg-repeat bg-white border border-gray-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">

//           {/* If we have assets, show primary asset preview */}
//           {hasAssets && primaryAsset ? (
//             <div className="w-full h-full flex flex-col">
//               {/* Primary preview */}
//               <div className="flex-1 relative overflow-hidden rounded-2xl">
//                 {primaryAsset.type === 'IMAGE' ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={primaryAsset.url}
//                     alt="Primary artwork"
//                     className="w-full h-full object-contain"
//                   />
//                 ) : primaryAsset.type === 'VIDEO' ? (
//                   <video
//                     src={primaryAsset.url}
//                     controls
//                     className="w-full h-full object-contain bg-gray-900"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
//                     <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//                       <path d="M6 10H34M6 20H34M6 30H22" stroke="#A5ABB6" strokeWidth="2.5" strokeLinecap="round" />
//                     </svg>
//                     <p className="text-sm text-[#A5ABB6] max-w-xs text-center truncate px-4">
//                       {primaryAsset.name}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Secondary thumbnails strip */}
//               {localAssets.length > 1 && (
//                 <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-3">
//                   <AssetStrip
//                     assets={localAssets}
//                     onRemove={handleRemoveAsset}
//                   />
//                 </div>
//               )}
//             </div>
//           ) : (
//             /* Empty state — upload buttons */
//             <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 p-4">
//               {btnComp.map((item, index) => (
//                 <button
//                   key={index}
//                   onClick={item.onClickFunction}
//                   className="cursor-pointer group flex flex-col items-center justify-center gap-y-4 hover:opacity-80 transition-opacity"
//                 >
//                   <div className="w-[88px] h-[88px] bg-gray-800 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
//                     <Image src={item.imgSrc} width={32} height={32} alt={`${item.text} icon`} />
//                   </div>
//                   <h5 className="font-poppins text-base font-medium leading-6 text-center tracking-wide text-black">
//                     {item.text}
//                   </h5>
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Top left controls */}
//           <div className="absolute top-6 left-6 p-2 flex flex-col gap-3 bg-gray-300/60 rounded-2xl backdrop-blur-sm z-10">
//             <button className="flex items-center justify-center w-10 h-10 border-2 border-white rounded-full hover:bg-white/20 transition-colors">
//               <Image src='/icons/pen.svg' width={20} height={20} alt="pencil icon" />
//             </button>
//             <button className="flex items-center justify-center w-10 h-10 border-2 border-white rounded-full hover:bg-white/20 transition-colors">
//               <Image src='/icons/arrow-up-round.svg' width={20} height={20} alt="Arrow up icon" />
//             </button>
//             <button className="flex items-center justify-center w-10 h-10 border-2 border-white rounded-full hover:bg-white/20 transition-colors">
//               <Image src='/icons/arrow-down-round.svg' width={20} height={20} alt="Arrow down icon" />
//             </button>
//           </div>
//         </div>

//         {/* Bottom row: plus button + draft/publish actions */}
//         <div className="w-full flex items-center justify-between pb-4 px-2">

//           {/* Plus button — always visible to add more */}
//           <button
//             onClick={() => setActiveModal('image')}
//             className="flex items-center justify-center w-[88px] h-[88px] rounded-full bg-[#FFF0EE] hover:bg-[#ffe4e0] transition-transform hover:scale-105 cursor-pointer shadow-sm"
//           >
//             <Image src='/icons/plus-red-bg.svg' width={28} height={28} alt="plus icon" />
//           </button>

//           {/* Draft / Publish — only show once at least one asset is added */}
//           {hasAssets && (
//             <div className="flex items-center gap-3">
//               <OutlineBtn onClick={() => { setApiError(null); setShowDraftModal(true) }}>
//                 Save Draft
//               </OutlineBtn>
//               <OrangeBtn onClick={() => { setApiError(null); setShowPublishModal(true) }}>
//                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                   <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                   <path d="M2 12V13.5C2 13.7761 2.22386 14 2.5 14H13.5C13.7761 14 14 13.7761 14 13.5V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//                 </svg>
//                 Publish
//               </OrangeBtn>
//             </div>
//           )}
//         </div>

//         {/* API error banner */}
//         {apiError && (
//           <div className="w-full max-w-lg">
//             <ErrorMsg message={apiError} />
//           </div>
//         )}

//         {/* API success banner */}
//         {apiSuccess && (
//           <div className="w-full max-w-lg flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//               <path d="M3 8L6.5 11.5L13 4.5" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//             <p className="text-sm text-green-700">{apiSuccess}</p>
//           </div>
//         )}
//       </div>

//       {/* ── Modals ─────────────────────────────────────────────────────────── */}

//       {activeModal === 'image' && (
//         <ModalBackdrop onClose={() => setActiveModal(null)}>
//           <ImageModal
//             onClose={() => setActiveModal(null)}
//             onSaved={handleImagesSaved}
//           />
//         </ModalBackdrop>
//       )}

//       {activeModal === 'video' && (
//         <ModalBackdrop onClose={() => setActiveModal(null)}>
//           <VideoModal
//             onClose={() => setActiveModal(null)}
//             onSaved={handleVideoSaved}
//           />
//         </ModalBackdrop>
//       )}

//       {activeModal === 'embed' && (
//         <ModalBackdrop onClose={() => setActiveModal(null)}>
//           <EmbedModal
//             onClose={() => setActiveModal(null)}
//             onSaved={handleEmbedSaved}
//           />
//         </ModalBackdrop>
//       )}

//       {activeModal === '3d' && (
//         <ModalBackdrop onClose={() => setActiveModal(null)}>
//           <ThreeDModal
//             onClose={() => setActiveModal(null)}
//             onSaved={handleThreeDSaved}
//           />
//         </ModalBackdrop>
//       )}

//       {showDraftModal && (
//         <ModalBackdrop onClose={() => !savingDraft && setShowDraftModal(false)}>
//           <SaveDraftModal
//             onClose={() => setShowDraftModal(false)}
//             onConfirm={handleSaveDraft}
//             loading={savingDraft}
//           />
//         </ModalBackdrop>
//       )}

//       {showPublishModal && (
//         <ModalBackdrop onClose={() => !publishing && setShowPublishModal(false)}>
//           <PublishModal
//             onClose={() => setShowPublishModal(false)}
//             onConfirm={handlePublish}
//             loading={publishing}
//           />
//         </ModalBackdrop>
//       )}
//     </>
//   )
// }

// export default UploadArt