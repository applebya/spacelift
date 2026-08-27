import { render, screen, within } from '@testing-library/react'

import App from './App'

describe('<App />', () => {
  it('renders every marketing section', () => {
    render(<App />)

    for (const name of [
      /what is spacelift\?/i,
      /the process/i,
      /any space.*any style/i,
      /five-star customer service/i,
      /frequently asked questions/i,
      /start your spacelift/i
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })

  it('renders a contact form with labelled, required fields', () => {
    render(<App />)

    const name = screen.getByLabelText(/^name/i)
    const email = screen.getByLabelText(/^email/i)
    const message = screen.getByLabelText(/tell us about your space/i)

    expect(name).toBeRequired()
    expect(email).toBeRequired()
    expect(email).toHaveAttribute('type', 'email')
    expect(message).toBeRequired()
    expect(screen.getByLabelText(/phone number/i)).not.toBeRequired()
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()
  })

  it('opens external social links safely', () => {
    render(<App />)

    const external = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('http'))

    expect(external.length).toBeGreaterThan(0)
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toMatch(/noreferrer/)
    }
  })

  it('gives every image alternative text', () => {
    const { container } = render(<App />)

    const untitled = Array.from(container.querySelectorAll('img')).filter(
      (img) => img.getAttribute('alt') === null
    )

    expect(untitled).toHaveLength(0)
  })

  it('lists all six steps of the process', () => {
    render(<App />)

    const process = screen
      .getByRole('heading', { name: /the process/i })
      .closest('section') as HTMLElement

    for (const step of [
      'declutter',
      'organize',
      'paint',
      'clean',
      'stage',
      'merchandise'
    ]) {
      expect(
        within(process).getByRole('heading', { name: step })
      ).toBeInTheDocument()
    }
  })
})
