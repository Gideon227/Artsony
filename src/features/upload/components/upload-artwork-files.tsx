"use client";

import * as React from "react";
import Image from "next/image";
import { CircleHelp, X, Upload, FileImage, Video, FileText, FileArchive, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components";
import { useArtworkStore } from "@/store/artwork.store";
import type { ArtworkMediaType } from "@/types/artwork";

// ── Props ─────────────────────────────────────────────────────────────────────

interface UploadArtworkFilesProps {
  id?: string;
  number: string;
  steps?: string;
  onNext: () => void;
  handleBackStep: () => void;
  onSaveAndExit: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE_LIMITS = {
  IMAGE: 50  * 1024 * 1024,  // 50MB
  VIDEO: 200 * 1024 * 1024,  // 200MB
  THREE_D: 500 * 1024 * 1024,  // 500MB
  EXTERNAL_LINK: 50 * 1024 * 1024
}

// ── Local display type — never persisted to store ─────────────────────────────
// The store holds ArtworkAsset shape; this is UI-only for name/icon/size display

interface LocalFileDisplay {
  // Used as the key to match against draft.assets[ordering_index]
  ordering_index: number;
  name:      string;
  sizeLabel: string;
  extension: string;
  mediaType: ArtworkMediaType;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMediaType(fileName: string): ArtworkMediaType | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (["jpg", "jpeg", "png", "tiff", "tif"].includes(ext)) return "IMAGE"
  if (["mp4", "mov"].includes(ext))                          return "VIDEO"
  if (["gltf", "obj", "fbx", "glb"].includes(ext))          return "THREE_D"
  return null // unsupported
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    tiff: "image/tiff", tif: "image/tiff",
    mp4: "video/mp4", mov: "video/quicktime",
    gltf: "model/gltf+json", glb: "model/gltf-binary",
    obj: "model/obj", fbx: "application/octet-stream",
  }
  return map[ext] ?? "application/octet-stream"
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1).replace(".0", "")}mb`
}

function FileIcon({ mediaType }: { mediaType: ArtworkMediaType }) {
  const cls = "h-5 w-5 text-slate-600"
  if (mediaType === "IMAGE")   return <FileImage className={cls} />
  if (mediaType === "VIDEO")   return <Video className={cls} />
  if (mediaType === "THREE_D") return <FileText className={cls} />
  return <File className={cls} />
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UploadArtworkFiles({
  number,
  steps = "7",
  onNext,
  handleBackStep,
  onSaveAndExit,
}: UploadArtworkFilesProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const draft          = useArtworkStore((s) => s.draft)
  const addDraftAsset  = useArtworkStore((s) => s.addDraftAsset)
  const removeDraftAsset = useArtworkStore((s) => s.removeDraftAsset)
  const setDraftStep   = useArtworkStore((s) => s.setDraftStep)

  // Local display list — mirrors draft.assets ordering but holds UI-only fields
  // Seeded from store on mount so display survives remounts
  const [displayFiles, setDisplayFiles] = React.useState<LocalFileDisplay[]>(() =>
    (draft.assets ?? []).map((asset, i) => ({
      ordering_index: i,
      name:      asset.mime_type,          // best fallback we have from the store
      sizeLabel: formatFileSize(asset.file_size_bytes),
      extension: asset.mime_type.split("/")[1]?.toUpperCase() ?? "FILE",
      mediaType: asset.media_type,
    }))
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    Array.from(e.target.files).forEach((file) => {
      const mediaType = getMediaType(file.name)
      if (!mediaType) {
        alert(`Unsupported file type: ${file.name}`)
        return
      }

      const limit = SIZE_LIMITS[mediaType]
      if (file.size > limit) {
        alert(`${file.name} exceeds the ${formatFileSize(limit)} limit for ${mediaType} files.`)
        return
      }

      const nextIndex = (draft.assets ?? []).length
      const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE"

      // Persist to store — original_url is a local blob URL until server upload
      addDraftAsset({
        original_url:    URL.createObjectURL(file),
        optimized_url:   null,
        thumbnail_url:   null,
        media_type:      mediaType,
        width:           null,
        height:          null,
        duration_secs:   null,
        mime_type:       getMimeType(file.name),
        file_size_bytes: file.size,
        ordering_index:  nextIndex,
      })

      // Update local display list
      setDisplayFiles((prev) => [
        ...prev,
        {
          ordering_index: nextIndex,
          name:           file.name,
          sizeLabel:      formatFileSize(file.size),
          extension,
          mediaType,
        },
      ])
    })

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemove = (ordering_index: number) => {
    // Remove from store by index
    removeDraftAsset(ordering_index)
    // Remove from display list and re-number ordering_index to stay in sync
    setDisplayFiles((prev) =>
      prev
        .filter((f) => f.ordering_index !== ordering_index)
        .map((f, i) => ({ ...f, ordering_index: i }))
    )
  }

  const handleNextStep = () => {
    setDraftStep(4)
    onNext()
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden font-poppins">

      {/* HEADER */}
      <div className="flex justify-between px-6 py-4 items-center border-b border-gray-50">
        <div className="flex gap-4 items-center">
          <h6 className="font-raleway font-semibold text-primary-500 text-h5 leading-8 tracking-wide">Step</h6>
          <h6 className="font-raleway font-semibold text-primary-500 text-h5 leading-8 tracking-wide">
            {number ?? "3"}<span className="text-gray-500">/{steps}</span>
          </h6>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" className="py-3 px-6 leading-6 text-sm font-medium" onClick={onSaveAndExit}>
            Save Draft
          </Button>
          <button type="button" onClick={onSaveAndExit} className="border border-gray-50 rounded-full p-2 hover:bg-gray-50 transition-colors">
            <Image src="/icons/cancel.svg" width={20} height={20} alt="cancel icon" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6 max-h-[64vh] overflow-y-auto custom-scrollbar">

        {/* HEADING */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[18px] font-semibold text-neutral-800">
              <span className="text-[#F15A2B] mr-1">*</span>Upload Artwork Files
            </label>
            <CircleHelp size={18} className="text-[#30A2FF]" fill="#30A2FF" color="white" />
          </div>
          <p className="text-sm leading-relaxed text-neutral-400 font-medium">
            Upload all relevant files in high quality. Supported formats: JPG, PNG, TIFF (up to 50MB),
            MP4 or MOV (up to 200MB), GLTF / OBJ (up to 500MB).
          </p>
        </div>

        {/* UPLOAD TRIGGER */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".jpg,.jpeg,.png,.tiff,.tif,.mp4,.mov,.gltf,.obj,.fbx,.glb"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-16 rounded-full border border-dashed border-neutral-200 bg-white hover:border-[#F15A2B] transition-all flex items-center justify-center gap-2.5 group"
          >
            <Upload size={18} className="text-[#F15A2B] transition-transform group-hover:-translate-y-0.5" />
            <span className="text-sm font-semibold text-[#F15A2B]">Upload File</span>
          </button>
        </div>

        {/* FILE LIST */}
        <AnimatePresence>
          {displayFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="border border-neutral-100 rounded-[32px] p-2 bg-white overflow-hidden"
            >
              <div className="max-h-[290px] overflow-y-auto custom-scrollbar divide-y divide-neutral-50 px-4">
                {displayFiles.map((file) => (
                  <motion.div
                    key={file.ordering_index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-4"
                  >
                    {/* Left — icon + name */}
                    <div className="flex items-center gap-3.5 max-w-[75%] overflow-hidden">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100/80 shrink-0">
                        <FileIcon mediaType={file.mediaType} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-neutral-700 truncate pr-2">
                          {file.name}
                        </span>
                        <span className="text-xs text-neutral-400 uppercase tracking-wider">
                          {file.mediaType}
                        </span>
                      </div>
                    </div>

                    {/* Right — size + remove */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {file.sizeLabel} · {file.extension}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(file.ordering_index)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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