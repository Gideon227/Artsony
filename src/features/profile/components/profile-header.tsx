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
      <div className="h-[220px] w-full bg-[#D9D9D9] md:h-[280px] lg:h-[344px] relative">
        <Image fill src={user?.backgroundUrl || ''} alt='user background image' objectFit='cover' />
      </div>

      <div
        className={cn(
          'relative z-20 mx-auto -mt-40 w-[92vw] max-w-[420px] rounded-2xl border-2 border-transparent',
          'bg-gradient-to-b from-[090A0B/0] to-[#1B1B1B] via-85% opacity-90 bg-clip-padding',
          '[background-origin:border-box] backdrop-blur-xl md:-mt-48 lg:-mt-56'
        )}
      >
        <div
          className="flex w-full flex-col items-center gap-8 rounded-2xl px-4 py-6 md:gap-12 md:px-8 md:py-12"
          style={{ background: 'linear-gradient(180deg, rgba(9, 10, 11, 0) 0%, rgba(27, 27, 27, 0.9) 85.35%)' }}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <Image
                src="/home/profile-ring.svg"
                alt="Profile Ring"
                width={144}
                height={144}
                className="absolute object-contain"
                priority
              />
              
              {/* The actual User Avatar */}
              <div className="relative w-[104px] h-[104px] rounded-full overflow-hidden z-10 bg-gray-50">
                <Image
                  src={user?.avatarUrl || '/images/image-avatar.svg'}
                  alt={user?.username ? `${user.username}'s profile` : 'User avatar'}
                  width={104}
                  height={104}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            

            <p className="text-center font-raleway text-[20px] font-semibold leading-8 tracking-wide text-white">
              {user.username || 'Unknown Artist'}
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-8">
            <div className="flex w-full items-center justify-center">
              <button onClick={() => setFollowListType('followers')} className="flex cursor-pointer w-1/3 flex-col items-center justify-center gap-2 transition-opacity hover:opacity-80">
                <p className="text-center font-poppins text-body-m font-medium leading-6 tracking-wide text-secondary-500">
                  {(user.followersCount ?? 0).toLocaleString()}
                </p>
                <p className="text-center font-poppins text-body-m leading-6 tracking-wide text-white">Followers</p>
              </button>
              <div className="flex w-1/3 flex-col items-center justify-center gap-2 border-l border-r border-gray-50">
                <p className="text-center font-poppins text-body-m font-medium leading-6 tracking-wide text-secondary-500">
                  {(user.likesCount ?? 0).toLocaleString()}
                </p>
                <p className="text-center font-poppins text-body-m leading-6 tracking-wide text-white">Likes</p>
              </div>
              <button onClick={() => setFollowListType('following')} className="flex cursor-pointer w-1/3 flex-col items-center justify-center gap-2 transition-opacity hover:opacity-80">
                <p className="text-center font-poppins text-body-m font-medium leading-6 tracking-wide text-secondary-500">
                  {(user.followingCount ?? 0).toLocaleString()}
                </p>
                <p className="text-center font-poppins text-body-m leading-6 tracking-wide text-white">Following</p>
              </button>
            </div>

            <div className="flex w-full items-center justify-center gap-4 md:gap-6">
              {isOwnProfile ? (
                <Button variant="primary" leftIcon="/icons/plus-white-bg.svg" className='max-lg:hidden w-1/2 flex-1' onClick={onPostArtwork}>
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
                  className='max-lg:hidden'
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}

              {isOwnProfile ? (
                <Button variant="outline" leftIcon="/icons/message-white.svg" className='border-white max-lg:w-full lg:w-1/2 flex-1 text-white hover:bg-primary-100 hover:text-primary-500 hover:border-primary-500' onClick={handleMessage}>
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
                >
                  {canMessage ? 'Message' : 'Message restricted'}
                </Button>
              )}
            </div>
          </div>

          {isOwnProfile ? (
            <button
              onClick={handleEdit}
              aria-label="Edit profile"
              className="absolute cursor-pointer right-6 top-6 flex items-center justify-center rounded-full border-2 border-white p-2 transition-colors hover:bg-white/10"
            >
              <Image src="/icons/pen.svg" width={20} height={20} alt="" />
            </button>
          ) : (
            <div className="absolute right-6 top-6">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More options"
                className="flex items-center cursor-pointer justify-center rounded-full border-2 border-white p-2 transition-colors hover:bg-white/10"
              >
                <Ellipsis color="#fff" size={20} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[180px] rounded-[16px] border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
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
          totalCount={followListType === 'followers' ? (user.followersCount ?? 0) : (user.followingCount ?? 0)}
          onClose={() => setFollowListType(null)}
          onSelectUser={(id) => router.push(`/profile/${id}`)}
        />
      )}
    </div>
  )
}

export default ProfileHeader
