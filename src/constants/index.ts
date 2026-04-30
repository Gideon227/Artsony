export const COLORS = {
  primary: {
    50: '#FEEFEC',
    100: '#FDDBD8',
    200: '#FABCAE',
    300: '#F79C87',
    400: '#F57C61',
    500: '#F25B38',
    600: '#E1350F',
    700: '#A8280B',
    800: '#6E1A07',
    900: '#390E04',
  },
  // Teal/secondary brand color derived from design
  secondary: {
    50: '#F5FAFA',
    100: '#E7F3F3',
    200: '#CFE7E8',
    300: '#BADDDE',
    400: '#A2D1D2',
    500: '#5DAFB1',
    600: '#42888A',
    700: '#2B585A',
    800: '#1A3738',
    900: '#0D1C1D',
  },
  // Neutral/gray scale
  neutral: {
    50: '#F5FAFA',
    100: '#E6E8EB',
    200: '#D2D5DA',
    300: '#A5ABB6',
    400: '#788191',
    500: '#525965',
    600: '#2F333A',
    700: '#25282D',
    800: '#1A1D21',
    900: '#0D0F11',
  },
  // Info - blue
  info: {
    50: '#E9F5FB',
    100: '#D0E6F4',
    200: '#ACD8F1',
    300: '#81C3E9',
    400: '#55AEE2',
    500: '#2D9CDB',
    600: '#1F7AB3',
    700: '#155A85',
    800: '#0C3C59',
    900: '#061E2D',
  },
  // Success - green
  success: {
    50: '#EDF7EE',
    100: '#DBF0DC',
    200: '#B8E0B9',
    300: '#94D196',
    400: '#6DC070',
    500: '#4CAF50',
    600: '#3C8B3F',
    700: '#2E6B30',
    800: '#1E4820',
    900: '#0F2410',
  },
  // Warning - orange/amber
  warning: {
    50: '#FFF5E5',
    100: '#FFEBCC',
    200: '#FFD699',
    300: '#FFC266',
    400: '#FFAD33',
    500: '#FF9800',
    600: '#CC7A00',
    700: '#995C00',
    800: '#663D00',
    900: '#331F00',
  },
  // Error - red
  error: {
    50: '#FEEDEC',
    100: '#FCDFD9',
    200: '#FAB2AD',
    300: '#F88E86',
    400: '#F66A5F',
    500: '#F44336',
    600: '#E31B0C',
    700: '#A91409',
    800: '#6F0D06',
    900: '#3A0703',
  },
} as const

export const TYPOGRAPHY_SCALE = {
  display: { size: '3rem', lineHeight: '1.15', weight: '700', tracking: '-0.02em' },
  h1: { size: '2.25rem', lineHeight: '1.2', weight: '700', tracking: '-0.01em' },
  h2: { size: '1.875rem', lineHeight: '1.25', weight: '600', tracking: '-0.01em' },
  h3: { size: '1.5rem', lineHeight: '1.3', weight: '600', tracking: '0' },
  h4: { size: '1.25rem', lineHeight: '1.35', weight: '600', tracking: '0' },
  h5: { size: '1.125rem', lineHeight: '1.4', weight: '600', tracking: '0' },
  bodyLg: { size: '1.125rem', lineHeight: '1.6', weight: '400', tracking: '0' },
  body: { size: '1rem', lineHeight: '1.6', weight: '400', tracking: '0' },
  bodySm: { size: '0.875rem', lineHeight: '1.5', weight: '400', tracking: '0' },
  caption: { size: '0.75rem', lineHeight: '1.5', weight: '400', tracking: '0.01em' },
  label: { size: '0.875rem', lineHeight: '1.4', weight: '500', tracking: '0' },
  buttonLg: { size: '1rem', lineHeight: '1', weight: '600', tracking: '0' },
  button: { size: '0.875rem', lineHeight: '1', weight: '600', tracking: '0' },
  buttonSm: { size: '0.75rem', lineHeight: '1', weight: '600', tracking: '0.01em' },
  overline: { size: '0.75rem', lineHeight: '1', weight: '600', tracking: '0.08em' },
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const Z_INDEX = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
} as const

export const QUERY_KEYS = {
  feed: ['feed'] as const,
  artwork: (id: string) => ['artwork', id] as const,
  artworks: (params?: Record<string, unknown>) => ['artworks', params] as const,
  profile: (username: string) => ['profile', username] as const,
  me: ['me'] as const,
  notifications: ['notifications'] as const,
  cart: ['cart'] as const,
  orders: ['orders'] as const,
  comments: (artworkId: string) => ['comments', artworkId] as const,
} as const

export const STALE_TIMES = {
  static: Infinity,
  slow: 1000 * 60 * 10,
  medium: 1000 * 60 * 2,
  fast: 1000 * 30,
} as const

export const ROUTES = {
  home: '/',
  discover: '/discover',
  artwork: (id: string) => `/artwork/${id}`,
  profile: (username: string) => `/@${username}`,
  shop: '/shop',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  notifications: '/notifications',
  settings: '/settings',
  upload: '/upload',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
} as const
