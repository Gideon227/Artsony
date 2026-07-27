// Artwork-specific query keys — extend the existing QUERY_KEYS map
export const ARTWORK_QUERY_KEYS = {
  all:      ['artworks'] as const,
  lists:    () => ['artworks', 'list'] as const,
  list:     (filters: object) => ['artworks', 'list', filters] as const,
  feed:     (params: object) => ['artworks', 'feed', params] as const,
  byId:     (id: string)     => ['artworks', 'detail', id] as const,
  bySlug:   (slug: string)   => ['artworks', 'slug', slug] as const,
  myDrafts: ()               => ['artworks', 'my-drafts'] as const,
  search:   (q: string, f?: object) => ['artworks', 'search', q, f] as const,
} as const

// Listing type display labels
export const LISTING_TYPE_LABELS: Record<string, string> = {
  MARKETPLACE: 'For Sale',
  PORTFOLIO: 'Portfolio Only',
}

// Artwork format display labels
export const ARTWORK_FORMAT_LABELS: Record<string, string> = {
  DIGITAL:  'Digital',
  PHYSICAL: 'Physical',
}

// Media type display labels
export const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  THREE_D: '3D Model',
  EXTERNAL_LINK: 'External Link',
}

// Visibility display labels
export const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  UNLISTED: 'Unlisted',
}

// Status display labels + badge variant mapping
export const STATUS_LABELS: Record<string, string> = {
  DRAFT:        'Draft',
  PUBLISHED:    'Published',
  ARCHIVED:     'Archived',
  UNDER_REVIEW: 'Under Review',
}

export const STATUS_BADGE_VARIANT: Record<string, string> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
  UNDER_REVIEW: 'info',
}

// Variant type display labels
export const VARIANT_TYPE_LABELS: Record<string, string> = {
  SIZE: 'Size',
  COLOR: 'Color',
  MATERIAL: 'Material',
  FRAMING: 'Framing',
  EDITION: 'Edition',
}

// Allowed MIME types for upload (client-side pre-validation before hitting the API)
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
] as const

export const ALLOWED_3D_MIME_TYPES = [
  'model/gltf-binary',
  'model/gltf+json',
] as const

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
  ...ALLOWED_3D_MIME_TYPES,
] as const

export const MAX_ASSET_SIZE_BYTES = 50 * 1024 * 1024  // 50 MB
export const MAX_ASSETS_PER_ARTWORK = 10
export const MAX_VARIANTS_PER_ARTWORK = 10
export const MAX_OPTIONS_PER_VARIANT = 20


//MOCK DATA:
// Assuming your types look something like this based on the provided Order type:
export type OrderStatus = 'Live' | 'Pending' | 'Delivered'

export type OrderItem = {
  id: string
  title: string
  type: 'Physical' | 'Digital'
  quantity: number
  unit_price: number
}

export type Order = {
  id: string
  buyer_id: string
  status: OrderStatus
  subtotal: number
  currency: string
  shipping_address: string | null
  idempotency_key: string
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

// You can copy and paste this directly into your project
export const MOCK_ORDERS: Order[] = [
  {
    id: 'AR-621843ED',
    buyer_id: "Salvador O'Keefe",
    status: 'Live',
    subtotal: 239.46,
    currency: 'USD',
    shipping_address: null,
    idempotency_key: 'idk-001',
    notes: null,
    created_at: '2025-10-22T11:10:00Z',
    updated_at: '2025-10-22T11:10:00Z',
    items: [
      {
        id: 'item-1',
        title: 'Crimson Echoes',
        type: 'Physical',
        quantity: 10,
        unit_price: 23.94, 
      },
    ],
  },
  {
    id: 'AR-245306YR',
    buyer_id: 'Heidi Reichel',
    status: 'Live',
    subtotal: 1501.01,
    currency: 'USD',
    shipping_address: null,
    idempotency_key: 'idk-002',
    notes: null,
    created_at: '2025-10-22T20:14:00Z',
    updated_at: '2025-10-22T20:14:00Z',
    items: [
      {
        id: 'item-2',
        title: 'Zero Gravity Blues',
        type: 'Physical',
        quantity: 98,
        unit_price: 15.31,
      },
    ],
  },
  {
    id: 'AR-413280JI',
    buyer_id: 'Roland Keebler',
    status: 'Delivered',
    subtotal: 9952.25,
    currency: 'USD',
    shipping_address: null, // Digital items don't typically need shipping addresses
    idempotency_key: 'idk-003',
    notes: null,
    created_at: '2025-10-21T13:59:00Z',
    updated_at: '2025-10-21T13:59:00Z',
    items: [
      {
        id: 'item-3',
        title: 'Solstice of the Sun',
        type: 'Digital',
        quantity: 76,
        unit_price: 130.95,
      },
    ],
  },
  {
    id: 'AR-180699BG',
    buyer_id: 'Nancy Swift',
    status: 'Pending',
    subtotal: 6412.14,
    currency: 'USD',
    shipping_address: null,
    idempotency_key: 'idk-004',
    notes: null,
    created_at: '2025-10-21T19:26:00Z',
    updated_at: '2025-10-21T19:26:00Z',
    items: [
      {
        id: 'item-4',
        title: 'Riverbend Nocturne',
        type: 'Physical',
        quantity: 99,
        unit_price: 64.76,
      },
    ],
  },
  {
    id: 'AR-955394AQ',
    buyer_id: 'Marty Hickle',
    status: 'Delivered',
    subtotal: 7085.49,
    currency: 'USD',
    shipping_address: null,
    idempotency_key: 'idk-005',
    notes: null,
    created_at: '2025-10-20T09:53:00Z',
    updated_at: '2025-10-20T09:53:00Z',
    items: [
      {
        id: 'item-5',
        title: 'Salt Spray and Sand',
        type: 'Digital',
        quantity: 90,
        unit_price: 78.72,
      },
    ],
  },
  {
    id: 'AR-733167SK',
    buyer_id: 'Diana Dooley',
    status: 'Delivered',
    subtotal: 6613.22,
    currency: 'USD',
    shipping_address: null,
    idempotency_key: 'idk-006',
    notes: null,
    created_at: '2025-10-20T05:37:00Z',
    updated_at: '2025-10-20T05:37:00Z',
    items: [
      {
        id: 'item-6',
        title: 'Obsidian Peaks',
        type: 'Physical',
        quantity: 53,
        unit_price: 124.77,
      },
    ],
  },
  {
    id: 'AR-549533CV',
    buyer_id: 'Earl Kessler',
    status: 'Delivered',
    subtotal: 7892.65,
    currency: 'USD',
    shipping_address: null,
    idempotency_key: 'idk-007',
    notes: null,
    created_at: '2025-10-16T11:14:00Z',
    updated_at: '2025-10-16T11:14:00Z',
    items: [
      {
        id: 'item-7',
        title: 'Waiting for the Dawn',
        type: 'Physical',
        quantity: 7,
        unit_price: 1127.52,
      },
    ],
  },
]