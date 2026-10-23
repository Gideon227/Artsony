'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMoodboards } from '@/hooks/use-moodboards'
import { CreateMoodboardDialog } from '@/features/moodboards/components/create-moodboard-dialog'
import type { MoodboardSummary } from '@/features/moodboards/types'
import { ProfileMoodboardDetail } from './profile-moodboard-detail'
import type { Artwork } from '@/types/artwork'

interface Props {
  isOwnProfile: boolean
  onArtworkClick: (artwork: Artwork, list: Artwork[]) => void
}

// ─── Empty moodboard artwork (orange / dark / teal diagonal stripes) ────────
function EmptyMoodboardPattern() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="#F15A2B" />
      <polygon points="30,0 75.3,0 46.7,100 2.6,100" fill="#04282F" />
      <polygon points="75.3,0 98.2,0 69.3,100 46.7,100" fill="#8DC6C8" />
    </svg>
  )
}

// Closed-eye icon (shown on private boards)
function ClosedEyeIcon() {
  return (
    <svg
      width="26"
      height="18"
      viewBox="0 0 24 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-label="Private moodboard"
      role="img"
    >
      <path d="M2 5c3 5 17 5 20 0" />
      <path d="M12 11v3M6.5 9.5 5 12M17.5 9.5 19 12M3 7l-1.5 2M21 7l1.5 2" />
    </svg>
  )
}

// ─── One moodboard card ─────────────────────────────────────────────────────
function MoodboardCard({
  board,
  onOpen,
  onMenu,
}: {
  board: MoodboardSummary & { is_private?: boolean }
  onOpen: () => void
  onMenu?: (board: MoodboardSummary) => void
}) {
  const isEmpty = board.artwork_count === 0

  return (
    <div className="group relative pt-4">
      {/* Stacked layers peeking out behind the card */}
      <span
        aria-hidden="true"
        className="absolute inset-x-[10%] top-0 h-10 rounded-t-3xl bg-[#CFE5E8] transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-[4%] top-2 h-10 rounded-t-3xl bg-[#8DC6C8] transition-transform duration-300 group-hover:-translate-y-0.5"
      />

      {/* Front card */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open moodboard: ${board.title}`}
          className="absolute inset-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          {board.cover_thumbnail_url ? (
            // First artwork of the moodboard (image / video poster / 3D preview)
            <Image
              src={board.cover_thumbnail_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : isEmpty ? (
            <EmptyMoodboardPattern />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/icons/moodboard-grey.svg" width={32} height={32} alt="" className="opacity-40" />
            </div>
          )}

          {/* Hover state: dim overlay + title (bottom-left) + count (bottom-right) */}
          <div className="absolute inset-0 flex items-end justify-between gap-4 bg-black/40 px-6 pb-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <span className="truncate font-poppins text-[16px] font-medium tracking-wide">{board.title}</span>
            <span className="shrink-0 font-poppins text-[16px] font-medium">{board.artwork_count}</span>
          </div>
        </button>

        {/* Hover state: menu button + private indicator (top-left) */}
        <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <button
            type="button"
            aria-label="Moodboard options"
            onClick={() => onMenu?.(board)}
            className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white/90 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          {board.is_private && <ClosedEyeIcon />}
        </div>
      </div>
    </div>
  )
}

export function ProfileMoodboards({ isOwnProfile, onArtworkClick }: Props) {
  const { data: moodboards, isLoading, isError, refetch, isRefetching } = useMoodboards()
  const [showCreate, setShowCreate] = useState(false)
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)

  if (!isOwnProfile) {
    // `moodboardService.list()` is scoped to the signed-in user — there's no
    // documented endpoint for fetching *another* user's moodboards yet, so
    // this stays an honest placeholder rather than silently showing the
    // viewer's own boards on someone else's profile.
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center pb-24">
        <h3 className="font-poppins text-body-l font-semibold text-heading">Moodboards aren&apos;t viewable yet</h3>
        <p className="max-w-sm font-poppins text-body-s text-gray-400">
          Viewing another artist&apos;s moodboards is coming soon.
        </p>
      </div>
    )
  }

  if (activeBoardId) {
    return (
      <ProfileMoodboardDetail
        moodboardId={activeBoardId}
        onBack={() => setActiveBoardId(null)}
        onSelectArtwork={onArtworkClick}
      />
    )
  }

  if (moodboards?.length === 0) {
    return (
      <div className='flex flex-col w-full items-center justify-center pt-12 pb-26 gap-y-12'>
        <svg width="500" height="293" viewBox="0 0 500 293" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_9904_57522)">
            <path d="M477.483 269.54H148.05C143.039 269.534 138.235 267.544 134.692 264.004C131.148 260.465 129.155 255.666 129.149 250.66V75.0204C129.155 70.015 131.148 65.2162 134.692 61.6768C138.235 58.1374 143.039 56.1464 148.05 56.1406H477.483C482.494 56.1464 487.298 58.1374 490.841 61.6768C494.384 65.2162 496.377 70.015 496.383 75.0204V250.662C496.377 255.667 494.383 260.466 490.84 264.005C487.297 267.544 482.493 269.534 477.483 269.54Z" fill="white"/>
            <path d="M480.996 263.617L151.892 275.134C146.886 275.304 142.017 273.483 138.353 270.071C134.689 266.658 132.53 261.934 132.349 256.934L126.195 81.4674C126.025 76.4667 127.848 71.603 131.264 67.9433C134.68 64.2836 139.409 62.1266 144.415 61.9457L473.519 50.4282C478.525 50.2588 483.394 52.0798 487.058 55.4918C490.721 58.9038 492.881 63.6281 493.062 68.6283L499.216 244.095C499.386 249.095 497.563 253.959 494.147 257.619C490.731 261.279 486.002 263.436 480.996 263.617ZM144.455 63.0889C139.753 63.2589 135.31 65.2851 132.101 68.723C128.892 72.1609 127.18 76.7298 127.339 81.4273L133.493 256.894C133.663 261.591 135.692 266.029 139.134 269.234C142.576 272.44 147.15 274.15 151.853 273.991L480.956 262.474C485.658 262.304 490.102 260.278 493.31 256.84C496.519 253.401 498.232 248.832 498.072 244.135L491.918 68.6684C491.748 63.9711 489.719 59.533 486.277 56.3279C482.836 53.1227 478.262 51.4121 473.559 51.5714L144.455 63.0889Z" fill="#D6D6E3"/>
            <path d="M332.492 291.228L14.0542 206.91C9.2118 205.622 5.07866 202.468 2.56151 198.14C0.0443527 193.811 -0.651253 188.662 0.627282 183.823L45.6848 14.0416C46.9743 9.20458 50.132 5.07599 54.465 2.56161C58.7981 0.0472346 63.9526 -0.647605 68.7979 0.629522L387.235 84.9478C392.078 86.2359 396.211 89.3901 398.728 93.7183C401.245 98.0466 401.941 103.196 400.662 108.035L355.605 277.813C354.316 282.651 351.159 286.78 346.825 289.295C342.492 291.81 337.337 292.505 332.492 291.228Z" fill="#F2F2F2"/>
            <path d="M407.033 292.997H77.6008C72.5898 292.992 67.7858 291.001 64.2425 287.461C60.6992 283.922 58.706 279.123 58.7002 274.118V98.4775C58.706 93.472 60.6992 88.6732 64.2425 85.1338C67.7858 81.5944 72.5898 79.6034 77.6008 79.5977H407.033C412.044 79.6034 416.849 81.5945 420.392 85.134C423.935 88.6736 425.928 93.4725 425.934 98.4781V274.119C425.928 279.125 423.935 283.923 420.391 287.462C416.848 291.001 412.044 292.992 407.033 292.997Z" fill="white"/>
            <path d="M317.53 278.125H104.792C104.526 278.125 104.26 278.12 103.997 278.105L204.613 221.503C206.528 220.403 210.827 220.016 214.213 220.638C215.142 220.781 216.041 221.073 216.876 221.503L284.401 259.487L287.636 261.304L317.53 278.125Z" fill="#E6E6E6"/>
            <path d="M384.646 278.124H200.646L236.302 261.304L238.868 260.095L285.332 238.175C288.378 236.739 295.706 236.648 299.286 237.904C299.527 237.989 299.75 238.08 299.956 238.175L384.646 278.124Z" fill="#E6E6E6"/>
            <path d="M77.6013 80.7422C72.8939 80.7475 68.3807 82.6178 65.0521 85.9428C61.7234 89.2678 59.851 93.776 59.8457 98.4783V274.12C59.851 278.822 61.7234 283.331 65.0521 286.656C68.3807 289.981 72.8939 291.851 77.6013 291.856H407.034C411.742 291.851 416.255 289.981 419.584 286.656C422.912 283.331 424.785 278.822 424.79 274.12V98.4783C424.785 93.776 422.912 89.2678 419.584 85.9428C416.255 82.6178 411.742 80.7475 407.034 80.7422H77.6013Z" fill="#3F3D56"/>
            <path d="M407.034 279.268H77.6013C76.2346 279.267 74.9242 278.724 73.9578 277.758C72.9914 276.793 72.4478 275.484 72.4463 274.119V98.4775C72.4478 97.1122 72.9914 95.8033 73.9578 94.838C74.9242 93.8726 76.2346 93.3296 77.6013 93.3281H407.034C408.401 93.3296 409.711 93.8726 410.678 94.838C411.644 95.8033 412.188 97.1122 412.189 98.4775V274.119C412.188 275.485 411.644 276.794 410.678 277.759C409.711 278.724 408.401 279.267 407.034 279.268ZM77.6019 94.4719C76.5389 94.473 75.5198 94.8953 74.7681 95.6462C74.0165 96.397 73.5937 97.415 73.5925 98.4768V274.119C73.5937 275.181 74.0165 276.199 74.7681 276.95C75.5198 277.701 76.5389 278.123 77.6019 278.124H407.034C408.097 278.123 409.117 277.701 409.868 276.95C410.62 276.199 411.043 275.181 411.044 274.119V98.4775C411.043 97.4156 410.62 96.3976 409.868 95.6468C409.117 94.896 408.097 94.4736 407.034 94.4725L77.6019 94.4719Z" fill="#CCCCCC"/>
            <path d="M348.454 219.007C373.255 219.007 393.36 193.869 393.36 162.86C393.36 131.851 373.255 106.713 348.454 106.713C323.654 106.713 303.549 131.851 303.549 162.86C303.549 193.869 323.654 219.007 348.454 219.007Z" fill="#F2F2F2"/>
            <path d="M348.578 151.569H348.703L350.924 278.742H346.236L348.578 151.569Z" fill="#CCCCCC"/>
            <path d="M356.237 235.763C356.305 235.892 356.347 236.033 356.36 236.178C356.374 236.323 356.358 236.469 356.315 236.609C356.272 236.748 356.202 236.877 356.108 236.989C356.015 237.101 355.901 237.194 355.772 237.261L349.334 240.648L348.3 238.686L354.737 235.299C354.866 235.231 355.007 235.189 355.153 235.176C355.298 235.162 355.444 235.178 355.583 235.221C355.723 235.264 355.852 235.334 355.964 235.427C356.076 235.52 356.169 235.634 356.237 235.763Z" fill="#CCCCCC"/>
            <path d="M219.352 219.007C244.153 219.007 264.258 193.869 264.258 162.86C264.258 131.851 244.153 106.713 219.352 106.713C194.551 106.713 174.446 131.851 174.446 162.86C174.446 193.869 194.551 219.007 219.352 219.007Z" fill="#F2F2F2"/>
            <path d="M227.135 237.865C226.998 237.605 226.762 237.41 226.481 237.323C226.2 237.236 225.895 237.264 225.635 237.401L221.139 239.766L219.599 151.569H219.474L217.13 278.742H221.817L221.18 242.247L226.667 239.361C226.928 239.225 227.123 238.99 227.211 238.71C227.298 238.429 227.271 238.126 227.135 237.865Z" fill="#CCCCCC"/>
            <path d="M293.675 226.374C293.589 226.211 293.472 226.066 293.33 225.948C293.187 225.83 293.024 225.741 292.847 225.686C292.671 225.632 292.485 225.612 292.301 225.629C292.117 225.646 291.938 225.699 291.775 225.785L286.077 228.782L284.126 117.03H283.97L281 278.174H286.938L286.13 231.932L293.083 228.275C293.413 228.101 293.661 227.804 293.771 227.448C293.882 227.092 293.846 226.707 293.673 226.377L293.675 226.374Z" fill="#3F3D56"/>
            <path d="M408.179 291.854H78.7463C73.7353 291.848 68.9313 289.857 65.388 286.318C61.8447 282.778 59.8515 277.979 59.8457 272.974V97.3339C59.8515 92.3284 61.8447 87.5297 65.388 83.9903C68.9313 80.4509 73.7353 78.4599 78.7463 78.4541H408.179C413.19 78.4599 417.994 80.4509 421.537 83.9903C425.08 87.5297 427.074 92.3284 427.079 97.3339V272.976C427.073 277.981 425.08 282.779 421.537 286.318C417.993 289.857 413.189 291.848 408.179 291.854Z" fill="white"/>
            <path d="M322.558 291.181H90.8076C90.5176 291.181 90.2277 291.175 89.9414 291.159L199.549 229.498C201.636 228.3 206.318 227.878 210.008 228.556C211.019 228.712 211.999 229.03 212.908 229.498L286.471 270.877L289.995 272.858L322.558 291.181Z" fill="#F2F2F2"/>
            <path d="M395.672 291.181H195.226L234.068 272.857L236.863 271.537L287.478 247.658C290.796 246.092 298.779 245.995 302.681 247.362C302.943 247.455 303.186 247.554 303.409 247.658L395.672 291.181Z" fill="#F2F2F2"/>
            <path d="M408.179 291.854H78.7463C73.7353 291.848 68.9313 289.857 65.388 286.318C61.8447 282.778 59.8515 277.979 59.8457 272.974V97.3339C59.8515 92.3284 61.8447 87.5297 65.388 83.9903C68.9313 80.4509 73.7353 78.4599 78.7463 78.4541H408.179C413.19 78.4599 417.994 80.4509 421.537 83.9903C425.08 87.5297 427.074 92.3284 427.079 97.3339V272.976C427.073 277.981 425.08 282.779 421.537 286.318C417.993 289.857 413.189 291.848 408.179 291.854ZM78.7463 79.5985C74.0389 79.6038 69.5257 81.4741 66.1971 84.7991C62.8684 88.1241 60.996 92.6323 60.9907 97.3345V272.976C60.996 277.678 62.8684 282.186 66.1971 285.511C69.5257 288.836 74.0389 290.707 78.7463 290.712H408.179C412.886 290.707 417.399 288.836 420.728 285.511C424.057 282.186 425.929 277.678 425.934 272.976V97.3339C425.929 92.6316 424.057 88.1235 420.728 84.7985C417.399 81.4734 412.886 79.6031 408.179 79.5978L78.7463 79.5985Z" fill="#3F3D56"/>
            <path d="M331.92 124.892C353.251 124.892 370.543 107.619 370.543 86.3107C370.543 65.0029 353.251 47.7295 331.92 47.7295C310.588 47.7295 293.296 65.0029 293.296 86.3107C293.296 107.619 310.588 124.892 331.92 124.892Z" fill="#F79C87"/>
            <path d="M348.067 226.779C375.084 226.779 396.986 199.395 396.986 165.615C396.986 131.834 375.084 104.45 348.067 104.45C321.049 104.45 299.147 131.834 299.147 165.615C299.147 199.395 321.049 226.779 348.067 226.779Z" fill="#E6E6E6"/>
            <path d="M348.202 153.315H348.337L350.755 291.856H345.648L348.202 153.315Z" fill="#CCCCCC"/>
            <path d="M356.545 245.034C356.619 245.175 356.664 245.328 356.679 245.486C356.693 245.644 356.677 245.804 356.63 245.955C356.583 246.107 356.506 246.248 356.404 246.37C356.303 246.492 356.178 246.592 356.038 246.666L349.021 250.356L347.896 248.218L354.913 244.528C355.196 244.379 355.528 244.349 355.834 244.444C356.139 244.539 356.395 244.751 356.545 245.034Z" fill="#CCCCCC"/>
            <path d="M207.426 226.779C234.444 226.779 256.346 199.395 256.346 165.615C256.346 131.834 234.444 104.45 207.426 104.45C180.409 104.45 158.507 131.834 158.507 165.615C158.507 199.395 180.409 226.779 207.426 226.779Z" fill="#E6E6E6"/>
            <path d="M215.905 247.324C215.755 247.041 215.499 246.828 215.193 246.733C214.886 246.639 214.555 246.669 214.271 246.818L209.373 249.394L207.695 153.312H207.561L205.008 291.853H210.116L209.422 252.097L215.4 248.953C215.682 248.804 215.894 248.548 215.989 248.243C216.083 247.938 216.053 247.608 215.905 247.324Z" fill="#CCCCCC"/>
            <path d="M277.577 24.6582C311.81 24.6582 339.635 89.0915 339.635 131.895C339.635 174.698 311.885 209.397 277.65 209.397C243.414 209.397 215.664 174.698 215.664 131.895C215.664 89.0915 243.343 24.6582 277.577 24.6582Z" fill="#F25B38"/>
            <path d="M288.391 234.806C288.202 234.447 287.878 234.178 287.489 234.058C287.101 233.937 286.681 233.976 286.321 234.165L280.115 237.429L277.99 115.688H277.82L274.584 291.233H281.055L280.175 240.857L287.749 236.874C287.927 236.781 288.085 236.653 288.214 236.498C288.342 236.344 288.439 236.165 288.499 235.973C288.559 235.781 288.58 235.579 288.561 235.379C288.543 235.179 288.485 234.984 288.391 234.806Z" fill="#3F3D56"/>
          </g>
          <defs>
            <clipPath id="clip0_9904_57522">
              <rect width="500" height="293" fill="white"/>
            </clipPath>
          </defs>
        </svg>

        <div className='flex flex-col gap-y-6 items-center justify-center w-[500px]'>
          <div className='flex flex-col gap-y-4 items-center justify-center'>
            <h6 className='font-poppins font-medium text-[20px] text-center text-heading'>Create Your First Moodboard</h6>
            <p className='font-poppins text-[16px] text-body text-center'>Save and organize artwork you love into moodboards made for your ideas, inspiration, and creative projects.</p>
          </div>

          <Button onClick={() => setShowCreate(true)} leftIcon='/icons/plus-white-bg.svg' className='px-6 py-3 w-[206px]'>New Moodboards</Button>
        </div>
      </div>
    )
  }


  const gridClass = 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      {isLoading ? (
        <div className={gridClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pt-4">
              <div className="aspect-square animate-pulse rounded-3xl bg-gray-50" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="font-poppins text-body-s text-gray-400">We couldn&apos;t load your moodboards.</p>
          <Button variant="outline" onClick={() => void refetch()} isLoading={isRefetching}>
            Retry
          </Button>
        </div>
      ) : (
        <div className={gridClass}>
          {moodboards?.map((board) => (
            <MoodboardCard key={board.id} board={board} onOpen={() => setActiveBoardId(board.id)} />
          ))}

          {/* Add new — same pt-4 so it lines up with the stacked cards */}
          <div className="pt-4">
            <button
              onClick={() => setShowCreate(true)}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary-500 text-center transition-colors hover:bg-primary-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white">
                <Plus size={22} />
              </span>
              <span className="font-poppins text-body-s font-medium text-gray-500">Add New Collection</span>
            </button>
          </div>
        </div>
      )}

      <CreateMoodboardDialog open={showCreate} onOpenChange={setShowCreate} onCreated={(id) => setActiveBoardId(id)} />
    </div>
  )
}