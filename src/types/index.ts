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
  website: Nullable<string>
  followersCount: number
  followingCount: number
  artworksCount: number
  isVerified: boolean
  onboarded: boolean
}

export type ArtworkCategory =
  | 'painting'
  | 'digital'
  | 'photography'
  | 'sculpture'
  | 'illustration'
  | 'mixed-media'
  | 'other'

export type ArtworkStatus = 'draft' | 'published' | 'archived'
export type ArtworkAvailability = 'for-sale' | 'not-for-sale' | 'sold'

export type Artwork = Timestamp & {
  id: ID
  title: string
  description: Nullable<string>
  imageUrl: string
  thumbnailUrl: string
  category: ArtworkCategory
  tags: string[]
  price: Nullable<number>
  currency: string
  availability: ArtworkAvailability
  status: ArtworkStatus
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLiked: boolean
  isSaved: boolean
  artist: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>
}

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
  artwork: Pick<Artwork, 'id' | 'title' | 'imageUrl' | 'thumbnailUrl' | 'price' | 'currency' | 'artist'>
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
