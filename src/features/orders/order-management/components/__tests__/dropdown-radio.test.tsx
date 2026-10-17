/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) => require('react').createElement('img', { src, alt: alt ?? '' }),
}))

const OPTIONS: DropdownOption[] = [
  { id: 'LIVE', label: 'Live' },
  { id: 'COMPLETED', label: 'Delivered' },
  { id: 'PENDING', label: 'Pending' },
]

beforeAll(() => {
  window.scrollTo = jest.fn()
  window.matchMedia = ((query: string) => ({
    matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(),
    addListener: jest.fn(), removeListener: jest.fn(), onchange: null, dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia
})

function rowFor(label: string): HTMLElement {
  const menuLabel = screen.getAllByText(label).find((element) => element.className.includes('leading-tight'))
  const row = menuLabel?.closest('[role="button"]')
  if (!row) throw new Error(`menu row for ${label} not found`)
  return row as HTMLElement
}

describe('Dropdown indicator="radio"', () => {
  it('renders the selected row in brand orange with a check, and empty radio circles elsewhere', async () => {
    render(<Dropdown options={OPTIONS} value={OPTIONS[0]} onChange={jest.fn()} placeholder="Status" arrow="triangle" indicator="radio" />)
    await userEvent.click(screen.getByRole('button', { name: /live/i }))

    const selected = rowFor('Live')
    expect(selected.className).toContain('bg-primary-500')
    expect(selected.querySelector('svg')).toBeInTheDocument()

    for (const label of ['Delivered', 'Pending']) {
      const row = rowFor(label)
      expect(row.className).not.toContain('bg-primary-500')
      expect(row.querySelector('svg')).not.toBeInTheDocument()
      expect(row.querySelector('span[class*="border-2"]')).toBeInTheDocument()
    }
  })

  it('reports the chosen option', async () => {
    const onChange = jest.fn()
    render(<Dropdown options={OPTIONS} onChange={onChange} placeholder="Status" arrow="triangle" indicator="radio" />)
    await userEvent.click(screen.getByRole('button', { name: /status/i }))
    await userEvent.click(screen.getByText('Pending'))
    expect(onChange).toHaveBeenCalledWith(OPTIONS[2])
  })
})
