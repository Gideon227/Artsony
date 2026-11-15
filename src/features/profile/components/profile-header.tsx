'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components'
import { useIsFollowing, useToggleFollow } from '@/hooks/use-follow'
import { useInteractionPermissions } from '@/hooks/use-user'
import { useToast } from '@/components/ui/toaster'
import { ProfileFollowersModal } from './profile-followers-modal'
import { cn } from '@/utils'
import { User } from '@/types'
import { Ellipsis, Flag, UserX } from 'lucide-react'

interface Props {
  user: User
  isOwnProfile: boolean
  onPostArtwork?: () => void
}

const CARD_FILL =
  'linear-gradient(180deg, rgba(9, 10, 11, 0) 0%, rgba(27, 27, 27, 0.9) 85.35%)'
const BORDER_GRADIENT = 'linear-gradient(180deg, #FFFFFF 45%, #F6947D 100%)'

const STAT_VALUE =
  'text-center font-poppins text-[14px] font-medium leading-5 tracking-wide text-secondary-500 lg:text-[16px] lg:leading-6'
const STAT_LABEL =
  'text-center font-poppins text-[12px] leading-[18px] tracking-wide text-white lg:text-[16px] lg:leading-6'
const STAT_CELL =
  'flex h-16 w-1/3 flex-col items-center justify-center gap-1 lg:h-auto lg:gap-4'

const ProfileHeader = ({ user, isOwnProfile, onPostArtwork }: Props) => {
  const router = useRouter()
  const { info } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null)

  const { data: isFollowing } = useIsFollowing(isOwnProfile ? undefined : user.id)
  const { mutate: toggleFollow, isPending: isTogglingFollow } = useToggleFollow(user.id)
  const { data: permissions } = useInteractionPermissions(isOwnProfile ? undefined : user.id)
  const canMessage = permissions?.can_message ?? true

  const handleMessage = () => {
    if (!isOwnProfile && !canMessage) {
      info('Messaging restricted', `${user.displayName || user.username} limits who can message them.`)
      return
    }
    router.push(`/messages?userId=${user.id}`)
  }
  const handleEdit = () => router.push('/settings/profile-customization')

  return (
    <div className="relative w-full bg-white">
      <div className="relative h-[296px] w-full bg-[#D9D9D9] lg:h-[344px]">
        {user?.background_url && (
          <Image
            fill
            sizes="100vw"
            src={user.background_url}
            alt="user background image"
            className="object-cover"
          />
        )}
      </div>

      <div
        className={cn(
          'relative z-20 mx-auto -mt-40 w-[calc(100%-2rem)] max-w-[448px] rounded-[32px]',
          'backdrop-blur-[10px] md:-mt-48 lg:-mt-[296px]'
        )}
      >
        {/* 2px gradient border, drawn as an overlay so the blur and fill stay visible */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[32px] p-[2px]"
          style={{
            background: BORDER_GRADIENT,
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            maskComposite: 'exclude',
          }}
        />

        <div
          className="flex w-full flex-col items-center gap-6 rounded-[32px] px-4 py-9 lg:gap-14 lg:px-8 lg:py-12"
          style={{ background: CARD_FILL }}
        >
          {/* ring + avatar + name */}
          <div className="flex flex-col items-center justify-center gap-4 lg:gap-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center lg:h-36 lg:w-36">
              <Image
                src="/home/profile-ring.svg"
                alt="Profile Ring"
                width={144}
                height={144}
                className="absolute inset-0 h-full w-full object-contain"
                priority
              />
              <div className="relative z-10 h-[69px] w-[69px] overflow-hidden rounded-full bg-gray-50 lg:h-[104px] lg:w-[104px]">
                <Image
                  src={user?.avatar_url || '/images/image-avatar.svg'}
                  alt={user?.username ? `${user.username}'s profile` : 'User avatar'}
                  width={104}
                  height={104}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <p className="text-center font-raleway text-[16px] font-semibold leading-6 tracking-wide text-white lg:text-[20px] lg:leading-8">
              {user.username || 'Unknown Artist'}
            </p>
          </div>

          {/* stats + actions */}
          <div className="flex w-full flex-col items-center justify-center gap-4 lg:gap-8">
            <div className="flex w-full items-center justify-center">
              <button
                onClick={() => setFollowListType('followers')}
                className={cn(STAT_CELL, 'cursor-pointer transition-opacity hover:opacity-80')}
              >
                <p className={STAT_VALUE}>{(user.followers_count ?? 0).toLocaleString()}</p>
                <p className={STAT_LABEL}>Followers</p>
              </button>
              <div className={cn(STAT_CELL, 'border-l border-r border-gray-50')}>
                <p className={STAT_VALUE}>{(user.likesCount ?? 0).toLocaleString()}</p>
                <p className={STAT_LABEL}>Likes</p>
              </div>
              <button
                onClick={() => setFollowListType('following')}
                className={cn(STAT_CELL, 'cursor-pointer transition-opacity hover:opacity-80')}
              >
                <p className={STAT_VALUE}>{(user.following_count ?? 0).toLocaleString()}</p>
                <p className={STAT_LABEL}>Following</p>
              </button>
            </div>

            <div className="flex w-full items-center justify-center gap-4 lg:gap-6">
              {isOwnProfile ? (
                <Button
                  variant="primary"
                  leftIcon="/icons/plus-white-bg.svg"
                  className="min-w-0 flex-1 basis-0 px-4 max-lg:hidden"
                  onClick={onPostArtwork}
                >
                  Post Artwork
                </Button>
              ) : (
                <Button
                  variant="primary"
                  leftIcon={isFollowing ? '/icons/user-check.svg' : undefined}
                  fullWidth
                  isLoading={isTogglingFollow}
                  onClick={() => toggleFollow()}
                  aria-pressed={isFollowing}
                  className="max-lg:hidden"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}

              {isOwnProfile ? (
                <Button
                  variant="outline"
                  leftIcon="/icons/message-white.svg"
                  className="h-10 w-full border-white px-4 text-white hover:border-primary-500 hover:bg-primary-100 hover:text-primary-500 lg:h-12 lg:min-w-0 lg:flex-1 lg:basis-0"
                  onClick={handleMessage}
                >
                  Inbox
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon="/icons/chat-round.svg"
                  fullWidth
                  onClick={handleMessage}
                  disabled={!canMessage}
                  title={!canMessage ? `${user.displayName || user.username} limits who can message them` : undefined}
                  className="border-white text-white outline-white max-lg:h-10"
                >
                  {canMessage ? 'Inbox' : 'Message restricted'}
                </Button>
              )}
            </div>
          </div>

          {isOwnProfile ? (
            <button
              onClick={handleEdit}
              aria-label="Edit profile"
              className="absolute right-4 top-4 flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white transition-colors hover:bg-white/10 lg:right-6 lg:top-6"
            >
              <Image src="/icons/pen.svg" width={20} height={20} alt="" className="max-lg:hidden" />
              <svg
                className="lg:hidden"
                width="19"
                height="20"
                viewBox="0 0 19 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.2788 0.152241C10.9085 0 10.439 0 9.5 0C8.56102 0 8.09153 0 7.72119 0.152241C7.2274 0.355229 6.83509 0.744577 6.63056 1.23463C6.53719 1.45834 6.50065 1.7185 6.48635 2.09799C6.46534 2.65568 6.17716 3.17189 5.69017 3.45093C5.20318 3.72996 4.60864 3.71954 4.11149 3.45876C3.77318 3.2813 3.52789 3.18262 3.28599 3.15102C2.75609 3.08178 2.22018 3.22429 1.79616 3.5472C1.47814 3.78938 1.24339 4.1929 0.773903 4.99993C0.304414 5.80697 0.069669 6.21048 0.017347 6.60491C-0.0524154 7.1308 0.0911811 7.66266 0.416547 8.08348C0.565055 8.27556 0.773773 8.43703 1.0977 8.63902C1.57391 8.93598 1.88032 9.44186 1.88029 10C1.88026 10.5581 1.57386 11.0639 1.0977 11.3608C0.773716 11.5629 0.564971 11.7244 0.416448 11.9165C0.0910824 12.3373 -0.0525141 12.8691 0.0172484 13.395C0.0695703 13.7894 0.304315 14.193 0.773804 15C1.24329 15.807 1.47804 16.2106 1.79606 16.4527C2.22008 16.7756 2.75599 16.9181 3.28589 16.8489C3.52778 16.8173 3.77305 16.7186 4.11133 16.5412C4.60852 16.2804 5.2031 16.27 5.69012 16.549C6.17714 16.8281 6.46533 17.3443 6.48635 17.9021C6.50065 18.2815 6.53719 18.5417 6.63056 18.7654C6.83509 19.2554 7.2274 19.6448 7.72119 19.8478C8.09153 20 8.56102 20 9.5 20C10.439 20 10.9085 20 11.2788 19.8478C11.7726 19.6448 12.1649 19.2554 12.3694 18.7654C12.4628 18.5417 12.4994 18.2815 12.5137 17.902C12.5347 17.3443 12.8228 16.8281 13.3098 16.549C13.7968 16.2699 14.3914 16.2804 14.8886 16.5412C15.2269 16.7186 15.4721 16.8172 15.714 16.8488C16.2439 16.9181 16.7798 16.7756 17.2038 16.4527C17.5219 16.2105 17.7566 15.807 18.2261 14.9999C18.6956 14.1929 18.9303 13.7894 18.9827 13.395C19.0524 12.8691 18.9088 12.3372 18.5835 11.9164C18.4349 11.7243 18.2262 11.5628 17.9022 11.3608C17.4261 11.0639 17.1197 10.558 17.1197 9.99991C17.1197 9.44185 17.4261 8.93608 17.9022 8.63919C18.2263 8.43715 18.435 8.27566 18.5836 8.08355C18.9089 7.66273 19.0525 7.13087 18.9828 6.60497C18.9304 6.21055 18.6957 5.80703 18.2262 5C17.7567 4.19297 17.522 3.78945 17.2039 3.54727C16.7799 3.22436 16.244 3.08185 15.7141 3.15109C15.4722 3.18269 15.2269 3.28136 14.8887 3.4588C14.3915 3.71959 13.7969 3.73002 13.3099 3.45096C12.8229 3.17191 12.5347 2.65566 12.5136 2.09794C12.4993 1.71848 12.4628 1.45833 12.3694 1.23463C12.1649 0.744577 11.7726 0.355229 11.2788 0.152241ZM9.5 13C11.1695 13 12.5228 11.6569 12.5228 10C12.5228 8.34315 11.1695 7 9.5 7C7.83053 7 6.47716 8.34315 6.47716 10C6.47716 11.6569 7.83053 13 9.5 13Z" fillRule="evenodd" clipRule="evenodd" fill="white" />
              </svg>
            </button>
          ) : (
            <div className="absolute right-4 top-4 lg:right-6 lg:top-6">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More options"
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white transition-colors hover:bg-white/10"
              >
                <Ellipsis color="#fff" size={20} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[180px] rounded-[16px] border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  {/* No report/block endpoint exists on the backend yet — these
                      are wired to a "coming soon" toast rather than faking a
                      success state, until that contract exists. */}
                  <button
                    onClick={() => { setMenuOpen(false); info('Coming soon', 'Reporting profiles isn\'t available yet.') }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50"
                  >
                    <Flag size={16} /> Report
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); info('Coming soon', 'Blocking profiles isn\'t available yet.') }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-error-500 hover:bg-gray-50"
                  >
                    <UserX size={16} /> Block
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {followListType && (
        <ProfileFollowersModal
          userId={user.id}
          type={followListType}
          totalCount={followListType === 'followers' ? (user.followers_count ?? 0) : (user.following_count ?? 0)}
          onClose={() => setFollowListType(null)}
          onSelectUser={(id) => router.push(`/profile/${id}`)}
        />
      )}
    </div>
  )
}

export default ProfileHeader