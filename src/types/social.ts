export type CommentAuthor = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type Comment = {
  id: string
  artwork_id: string
  user_id: string
  parent_id: string | null
  body: string
  likes_count: number
  reply_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  author: CommentAuthor
}

export type CreateCommentInput = {
  artwork_id: string
  body: string
  parent_id?: string
}

export type FollowUser = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  followers_count: number
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}