import { Artwork } from './artwork'
export type {
  Artwork,
  ArtworkAsset,
  ArtworkFilters,
  ArtworkFormat,
  ArtworkMediaType,
  ArtworkStatus,
  ArtworkVisibility,
  CreateArtworkPayload,
  ListingType,
  ModerationStatus,
  PaginatedArtworksResponse,
  PhysicalDetails,
  UpdateArtworkPayload,
  Variant,
  VariantOption,
} from './artwork'

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncState<T> = {
  data: Nullable<T>
  isLoading: boolean
  error: Nullable<string>
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  hasNextPage: boolean
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  message: string
  code?: string
  statusCode?: number
}

export type ID = string

export type Timestamp = {
  createdAt: string
  updatedAt: string
}

export type User = Timestamp & {
  id: ID
  email: string
  username: string
  displayName: string
  avatarUrl: Nullable<string>
  bio: Nullable<string>
  artworks: Artwork
  website: Nullable<string>
  instagramLink: Nullable<string>
  facebookLink: Nullable<string>
  twitterLink: Nullable<string>
  behanceLink: Nullable<string>
  followersCount: number
  followingCount: number
  likesCount: number
  viewsCount: number
  artworksCount: number
  isVerified: boolean
  onboarded: boolean
  interests: string[]
  created_at: string
  state?: string;
  country?: string;
}

export type ArtworkCategory =
  | 'painting'
  | 'digital'
  | 'photography'
  | 'sculpture'
  | 'illustration'
  | 'mixed-media'
  | 'other'

// export type ArtworkStatus = 'draft' | 'published' | 'archived'
export type ArtworkAvailability = 'for-sale' | 'not-for-sale' | 'sold'

export type Comment = Timestamp & {
  id: ID
  body: string
  artworkId: ID
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  repliesCount: number
  likesCount: number
  isLiked: boolean
  parentId: Nullable<ID>
}

export type Notification = Timestamp & {
  id: ID
  type: 'like' | 'comment' | 'follow' | 'sale' | 'reply'
  isRead: boolean
  actor: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  resourceId: ID
  resourceType: 'artwork' | 'comment' | 'user'
  message: string
}

export type CartItem = {
  id: ID
  artwork: Pick<Artwork, 'id' | 'title' | 'assets' | 'price' | 'currency' | 'creator_id'>
  quantity: number
  addedAt: string
}

export type Order = Timestamp & {
  id: ID
  items: CartItem[]
  total: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  txHash: Nullable<string>
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'default' | 'error' | 'success'

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGING DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ConversationType  = 'direct' | 'broadcast'
export type MessageType       = 'text' | 'image' | 'system'
export type ParticipantRole   = 'owner' | 'member'

export type ParticipantProfile = {
  user_id: string
  role: ParticipantRole
  last_read_at: string
  is_muted: boolean
  joined_at: string
  left_at: string | null
  email: string
  display_name:  string | null
  avatar_url: string | null
}

export type MessagePreview = {
  id:         string
  sender_id:  string
  body:       string
  type:       MessageType
  created_at: string
  deleted_at: string | null
}

export type ConversationSummary = {
  id:                string
  type:              ConversationType
  title:             string | null
  last_activity_at:  string
  last_message_id:   string | null
  unread_count:      number
  last_message?:     MessagePreview | null
  other_user?:       ParticipantProfile | null
}

export type SenderProfile = {
  id:           string
  email:        string
  display_name: string | null
  avatar_url:   string | null
}

export type TextMessageMetadata = Record<string, never>

export type ImageMessageMetadata = {
  url:          string
  thumbnailUrl: string
  width:        number
  height:       number
  size:         number
  mimeType:     string
}

export type SystemMessageEvent =
  | 'user_joined'
  | 'user_left'
  | 'title_changed'
  | 'conversation_created'

export type SystemMessageMetadata = {
  event:   SystemMessageEvent
  payload: Record<string, unknown>
}

export type MessageMetadata =
  | TextMessageMetadata
  | ImageMessageMetadata
  | SystemMessageMetadata

export type MessageWithSender = {
  id:                 string
  conversation_id:    string
  sender_id:          string
  body:               string
  type:               MessageType
  reply_to_id:        string | null
  metadata:           MessageMetadata
  is_broadcast_root:  boolean
  created_at:         string
  edited_at:          string | null
  deleted_at:         string | null
  sender:             SenderProfile
  reply_to?:          MessagePreview | null
  read_by?:           string[]
}

export type CursorPage<T> = {
  items:       T[]
  next_cursor: string | null
  has_more:    boolean
}

export type SendMessageInput = {
  conversation_id:   string
  sender_id:         string
  body:              string
  type?:             MessageType
  reply_to_id?:      string | null
  metadata?:         MessageMetadata
  client_message_id: string
}

export type MarkReadInput = {
  conversation_id:   string
  user_id:           string
  up_to_message_id:  string
}