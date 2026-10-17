/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker } from '@/components/ui/date-picker'

describe('DateRangePicker (Figma calendar)', () => {
  it('shows the placeholder, then an orange "Sept 2025" title with Monday-first weekday headers', async () => {
    render(<DateRangePicker value={{ from: new Date(2025, 8, 17), to: null }} onChange={jest.fn()} />)
    await userEvent.click(screen.getAllByRole('button')[0] as HTMLElement)

    const title = screen.getByText('Sept 2025')
    expect(title.className).toContain('text-primary-500')
    expect(screen.getAllByText(/^(MO|TU|WE|TH|FR|SA|SU)$/i).map((el) => el.textContent?.toUpperCase())).toEqual(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])
  })

  it('reports the picked day, in local calendar terms', async () => {
    const onChange = jest.fn()
    render(<DateRangePicker value={{ from: null, to: null }} onChange={onChange} />)
    await userEvent.click(screen.getAllByRole('button')[0] as HTMLElement)
    const days = screen.getAllByRole('button', { name: /^\w{3} \w{3} 15 \d{4}$/ })
    await userEvent.click(days[0] as HTMLElement)
    const picked = onChange.mock.calls[0]?.[0].from as Date
    expect(picked.getDate()).toBe(15)
  })

  it('uses the hyphenated placeholder from the design', () => {
    render(<DateRangePicker value={{ from: null, to: null }} onChange={jest.fn()} />)
    expect(screen.getByText('Date: from - to')).toBeInTheDocument()
  })
})
