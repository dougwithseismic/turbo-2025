import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Greeting } from '../src/components/greeting'

describe('Greeting Component', () => {
  it('renders with the provided name', () => {
    render(<Greeting name="John" />)
    expect(screen.getByText('Hello, John!')).toBeInTheDocument()
  })

  it('applies the correct styling classes', () => {
    render(<Greeting name="Jane" />)
    const heading = screen.getByText('Hello, Jane!')
    expect(heading).toHaveClass('text-xl', 'font-bold')
  })
})
