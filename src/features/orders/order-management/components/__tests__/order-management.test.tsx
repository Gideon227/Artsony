/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import * as React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SellerSaleLine } from '@/types/seller-sales'
import { DEFAULT_FILTERS } from '../../lib/filters'
import { OrdersFilterBar } from '../orders-filter-bar'
import { OrdersPagination } from '../orders-pagination'
import { OrdersSidebar } from '../orders-sidebar'
import { OrdersTable } from '../orders-table'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() }
let mockSearch = ''
const mockAuth = { isHydrated: true, hasSeller: true }
const mockList = jest.fn()
const mockCounts = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/order-management',
  useSearchParams: () => new URLSearchParams(mockSearch),
}))
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) => require('react').createElement('img', { src, alt: alt ?? '' }),
}))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => require('react').createElement('a', { href, ...rest }, children),
}))
jest.mock('@/components/layout/navbar', () => ({ Navbar: () => null }))
jest.mock('@/store', () => ({
  useAuthStore: (selector: (state: typeof mockAuth) => unknown) => selector(mockAuth),
  selectIsHydrated: (state: typeof mockAuth) => state.isHydrated,
  selectHasSellerAccount: (state: typeof mockAuth) => state.hasSeller,
}))
jest.mock('@/hooks/queries/use-seller-sales', () => ({
  useSellerSales: (...args: unknown[]) => mockList(...args),
  useSellerSalesCounts: (...args: unknown[]) => mockCounts(...args),
}))

import { OrderManagementPage } from '../order-management-page'

const line = (overrides: Partial<SellerSaleLine> = {}): SellerSaleLine => ({
  order_item_id: 'item-1',
  order_id: 'order-1',
  physical_id: 'phys-1',
  order_code: 'AR-621843ED',
  legacy_code: 'AR-1A2B3C4D',
  artwork_id: 'art-1',
  artwork_title: 'Crimson Echoes',
  artwork_thumbnail_url: null,
  artwork_format: 'PHYSICAL',
  quantity: 10,
  unit_price: 23.946,
  line_total: 239.46,
  currency: 'USDT',
  buyer_name: "Salvador O'Keefe",
  seller_status: 'LIVE',
  timeline_status: 'IN_TRANSIT',
  delivery_status: 'LIVE',
  purchased_at: '2025-10-22T11:10:00.000Z',
  ...overrides,
})

const listResult = (rows: SellerSaleLine[], extra: Record<string, unknown> = {}) => ({
  data: { success: true, data: rows, total: rows.length, page: 1, limit: 7, total_pages: 1, has_next: false, has_prev: false },
  isPending: false,
  isError: false,
  isFetching: false,
  isPlaceholderData: false,
  refetch: jest.fn(),
  ...extra,
})

const countsResult = (all: number) => ({
  data: { success: true, data: { ALL: all, LIVE: 1, PENDING: 0, COMPLETED: 0, CANCELLED: 0 } },
  isSuccess: true,
})

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(),
    addListener: jest.fn(), removeListener: jest.fn(), onchange: null, dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia
})

beforeEach(() => {
  jest.clearAllMocks()
  mockSearch = ''
  mockAuth.isHydrated = true
  mockAuth.hasSeller = true
  mockList.mockReturnValue(listResult([line()]))
  mockCounts.mockReturnValue(countsResult(1))
})

describe('OrdersPagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<OrdersPagination page={1} totalPages={1} onPageChange={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('marks the current page, disables Previous on page 1 and navigates', async () => {
    const onPageChange = jest.fn()
    render(<OrdersPagination page={1} totalPages={3} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 2)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('disables Next on the last page', () => {
    render(<OrdersPagination page={3} totalPages={3} onPageChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})

describe('OrdersSidebar', () => {
  const counts = { ALL: 12, LIVE: 4, PENDING: 3, COMPLETED: 5, CANCELLED: 0 }

  it('highlights the active tab and shows its zero-padded count only', () => {
    render(<OrdersSidebar active="PENDING" counts={{ ...counts, PENDING: 3 }} disabled={false} onSelect={jest.fn()} onBack={jest.fn()} />)
    expect(screen.getByRole('button', { name: /pending orders/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.queryByText('12')).not.toBeInTheDocument()
  })

  it('selects a tab and goes back', async () => {
    const onSelect = jest.fn()
    const onBack = jest.fn()
    render(<OrdersSidebar active="ALL" counts={counts} disabled={false} onSelect={onSelect} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /live orders/i }))
    await userEvent.click(screen.getByRole('button', { name: /go back/i }))
    expect(onSelect).toHaveBeenCalledWith('LIVE')
    expect(onBack).toHaveBeenCalled()
  })

  it('disables every tab and shows a 00 badge on All Orders only', () => {
    render(<OrdersSidebar active="ALL" counts={undefined} disabled onSelect={jest.fn()} onBack={jest.fn()} />)
    for (const name of [/all orders/i, /live orders/i, /pending orders/i, /completed orders/i, /canceled orders/i]) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    expect(screen.getAllByText('00')).toHaveLength(1)
  })
})

describe('OrdersTable', () => {
  const props = {
    isFetching: false, isRefreshError: false, onRetry: jest.fn(), page: 1, totalPages: 1,
    onPageChange: jest.fn(), getRowHref: (row: SellerSaleLine) => `/order-management?order=${row.order_item_id}`,
  }

  it('renders row data with spaced USDT currency, status label and a labelled action link', () => {
    render(<OrdersTable {...props} rows={[line(), line({ order_item_id: 'item-2', order_code: 'AR-413280JI', seller_status: 'COMPLETED', artwork_format: 'DIGITAL', line_total: 9952.25 })]} />)
    const table = screen.getByRole('table', { name: 'Orders' })
    expect(within(table).getByText('AR-621843ED')).toBeInTheDocument()
    expect(within(table).getByText('$ 239.46')).toBeInTheDocument()
    expect(within(table).getByText('$ 9,952.25')).toBeInTheDocument()
    expect(within(table).getByText('Live')).toBeInTheDocument()
    expect(within(table).getByText('Delivered')).toBeInTheDocument()
    expect(within(table).getAllByRole('link', { name: /view order ar-621843ed/i })[0]).toHaveAttribute('href', '/order-management?order=item-1')
  })

  it('shows a retryable banner when a refresh fails but data is still present', async () => {
    const onRetry = jest.fn()
    render(<OrdersTable {...props} onRetry={onRetry} isRefreshError rows={[line()]} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Retry' })[0] as HTMLElement)
    expect(onRetry).toHaveBeenCalled()
  })
})

describe('OrdersFilterBar', () => {
  const setup = (search = '') => {
    const onChange = jest.fn()
    const view = render(
      <OrdersFilterBar filters={{ ...DEFAULT_FILTERS, search }} heading="All Orders" total={12} showMore={false} onToggleMore={jest.fn()} onChange={onChange} />,
    )
    return { onChange, ...view }
  }

  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('debounces search input and commits once with replace semantics', () => {
    const { onChange } = setup()
    const input = screen.getByPlaceholderText(/search by order id/i)
    fireEvent.change(input, { target: { value: 'cri' } })
    fireEvent.change(input, { target: { value: 'crimson' } })
    expect(onChange).not.toHaveBeenCalled()
    act(() => { jest.advanceTimersByTime(300) })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ search: 'crimson' }, { replace: true })
  })

  it('does not overwrite characters typed after a commit when the URL catches up', () => {
    const onChange = jest.fn()
    const view = render(<OrdersFilterBar filters={DEFAULT_FILTERS} heading="x" total={1} showMore={false} onToggleMore={jest.fn()} onChange={onChange} />)
    const input = screen.getByPlaceholderText(/search by order id/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ab' } })
    act(() => { jest.advanceTimersByTime(300) })
    fireEvent.change(input, { target: { value: 'abc' } })
    view.rerender(<OrdersFilterBar filters={{ ...DEFAULT_FILTERS, search: 'ab' }} heading="x" total={1} showMore={false} onToggleMore={jest.fn()} onChange={onChange} />)
    expect(input.value).toBe('abc')
  })

  it('syncs the input when the URL search changes externally', () => {
    const onChange = jest.fn()
    const view = render(<OrdersFilterBar filters={DEFAULT_FILTERS} heading="x" total={1} showMore={false} onToggleMore={jest.fn()} onChange={onChange} />)
    view.rerender(<OrdersFilterBar filters={{ ...DEFAULT_FILTERS, search: 'AR-1A2B3C4D' }} heading="x" total={1} showMore={false} onToggleMore={jest.fn()} onChange={onChange} />)
    expect((screen.getByPlaceholderText(/search by order id/i) as HTMLInputElement).value).toBe('AR-1A2B3C4D')
    act(() => { jest.advanceTimersByTime(500) })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the total badge and exposes the More Filters toggle state', () => {
    setup()
    expect(screen.getByLabelText('12 orders')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /more filters/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Price Range')).not.toBeInTheDocument()
  })

  it('reveals the secondary filter row when expanded', () => {
    render(<OrdersFilterBar filters={DEFAULT_FILTERS} heading="x" total={1} showMore onToggleMore={jest.fn()} onChange={jest.fn()} />)
    for (const label of ['Status', 'Artwork type', 'Price Range']) expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText('Date: from - to')).toBeInTheDocument()
  })
})

describe('OrderManagementPage', () => {
  it('shows the creator gate with a registration link and a disabled sidebar for non-sellers', () => {
    mockAuth.hasSeller = false
    render(<OrderManagementPage />)
    expect(screen.getByRole('heading', { name: 'Start Selling on Artsony' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /become a creator/i })).toHaveAttribute('href', '/seller-registration')
    expect(screen.getByRole('button', { name: /live orders/i })).toBeDisabled()
    expect(mockList).toHaveBeenCalledWith(expect.anything(), false)
  })

  it('shows the No Orders Yet state when the seller has no orders at all', () => {
    mockCounts.mockReturnValue(countsResult(0))
    render(<OrderManagementPage />)
    expect(screen.getByRole('heading', { name: 'No Orders Yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /all orders/i })).toBeDisabled()
  })

  it('renders the orders table with the real total for a seller with orders', () => {
    render(<OrderManagementPage />)
    expect(screen.getByRole('table', { name: 'Orders' })).toBeInTheDocument()
    expect(screen.getByLabelText('1 orders')).toBeInTheDocument()
    expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ sort_order: 'desc', page: 1, limit: 7 }), true)
  })

  it('reads filters from the URL and queries the API with them', () => {
    mockSearch = 'status=PENDING&price=R_50_200&q=salt&page=2&sort=asc'
    mockList.mockReturnValue(listResult([line()], { data: { success: true, data: [line()], total: 9, page: 2, limit: 7, total_pages: 2, has_next: false, has_prev: true } }))
    render(<OrderManagementPage />)
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING', price_min: 50, price_max: 200, q: 'salt', page: 2, sort_order: 'asc' }),
      true,
    )
    expect(screen.getByText('Search Result')).toBeInTheDocument()
  })

  it('shows a filtered empty state with a clear action that resets filters but keeps sort', async () => {
    mockSearch = 'q=nothing&sort=asc'
    mockList.mockReturnValue(listResult([], { data: { success: true, data: [], total: 0, page: 1, limit: 7, total_pages: 0, has_next: false, has_prev: false } }))
    render(<OrderManagementPage />)
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(mockRouter.push).toHaveBeenCalledWith('/order-management?sort=asc', { scroll: false })
  })

  it('shows a retryable error when the first load fails', async () => {
    const refetch = jest.fn()
    mockList.mockReturnValue({ data: undefined, isPending: false, isError: true, isFetching: false, isPlaceholderData: false, refetch })
    render(<OrderManagementPage />)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('switches tabs through the URL and resets to page 1', async () => {
    mockSearch = 'page=3'
    mockList.mockReturnValue(listResult([line()], { data: { success: true, data: [line()], total: 30, page: 3, limit: 7, total_pages: 5, has_next: true, has_prev: true } }))
    render(<OrderManagementPage />)
    await userEvent.click(screen.getByRole('button', { name: /live orders/i }))
    expect(mockRouter.push).toHaveBeenCalledWith('/order-management?status=LIVE', { scroll: false })
  })

  it('moves back to the last real page when the URL page is out of range', () => {
    mockSearch = 'page=9'
    mockList.mockReturnValue(listResult([], { data: { success: true, data: [], total: 12, page: 9, limit: 7, total_pages: 2, has_next: false, has_prev: true } }))
    render(<OrderManagementPage />)
    expect(mockRouter.replace).toHaveBeenCalledWith('/order-management?page=2', { scroll: false })
  })

  it('shows the loading skeleton and does not query before auth hydrates', () => {
    mockAuth.isHydrated = false
    const { container } = render(<OrderManagementPage />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
    expect(mockList).toHaveBeenCalledWith(expect.anything(), false)
  })
})
