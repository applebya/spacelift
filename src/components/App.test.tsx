import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'

describe('<App />', () => {
  it('has exactly one h1, naming the business proposition', () => {
    render(<App />)

    const h1s = screen.getAllByRole('heading', { level: 1 })

    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent(/we revitalize your/i)
  })

  it('does not skip heading levels', () => {
    const { container } = render(<App />)

    const levels = Array.from(
      container.querySelectorAll('h1,h2,h3,h4,h5,h6')
    ).map((h) => Number(h.tagName[1]))

    expect(levels[0]).toBe(1)
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1)
    }
  })

  it('wraps its content in a main landmark', () => {
    render(<App />)

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

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

  it('gives every image alternative text and intrinsic dimensions', () => {
    const { container } = render(<App />)
    const images = Array.from(container.querySelectorAll('img'))

    expect(images.length).toBeGreaterThan(0)
    for (const img of images) {
      expect(img.getAttribute('alt')).not.toBeNull()
      // Reserving the aspect ratio before decode is what keeps CLS near zero.
      expect(img.getAttribute('width')).not.toBeNull()
      expect(img.getAttribute('height')).not.toBeNull()
    }
  })

  it('lazy-loads gallery photographs but not the hero', () => {
    const { container } = render(<App />)

    const hero = container.querySelector<HTMLImageElement>(
      '[data-testid="hero-image"]'
    )
    expect(hero).not.toBeNull()
    expect(hero).toHaveAttribute('fetchpriority', 'high')
    expect(hero!.loading).not.toBe('lazy')

    // `picture img` excludes the small inline SVG carousel arrows.
    const gallery = Array.from(
      container.querySelectorAll<HTMLImageElement>('#spaces picture img')
    )
    expect(gallery.length).toBeGreaterThan(30)
    for (const img of gallery) {
      expect(img.loading).toBe('lazy')
    }
  })

  it('gives high fetch priority to the LCP image and nothing else', () => {
    const { container } = render(<App />)

    // A second high-priority image competes with the LCP request for bandwidth
    // on exactly the connections where it matters. The wordmark is above the
    // fold and so loads eagerly, but it must not claim priority.
    const prioritised = Array.from(container.querySelectorAll('img')).filter(
      (img) => img.getAttribute('fetchpriority') === 'high'
    )

    expect(prioritised).toHaveLength(1)
    expect(prioritised[0]).toHaveAttribute('data-testid', 'hero-image')
  })

  it('loads above-the-fold wordmarks eagerly without prioritising them', () => {
    const { container } = render(<App />)

    const wordmarks = Array.from(
      container.querySelectorAll<HTMLImageElement>('header img, section img')
    ).filter((img) => img.alt === 'Spacelift')

    expect(wordmarks.length).toBeGreaterThan(0)
    for (const img of wordmarks) {
      expect(img.loading).not.toBe('lazy')
      expect(img.getAttribute('fetchpriority')).not.toBe('high')
    }
  })

  it('offers modern image formats ahead of the original', () => {
    const { container } = render(<App />)

    const heroPicture = container
      .querySelector('[data-testid="hero-image"]')!
      .closest('picture')!

    const types = Array.from(heroPicture.querySelectorAll('source')).map(
      (source) => source.type
    )

    expect(types[0]).toBe('image/avif')
    expect(types).toContain('image/webp')
    expect(types.at(-1)).toBe('image/jpeg')
  })

  it('sizes gallery images by layout width, not device density alone', () => {
    const { container } = render(<App />)

    // The pre-modernization markup used `srcset="... 1x, ... 2x"`, which gives
    // the browser no way to account for how wide the element actually is: a
    // 390px phone at DPR 2 fetched a 1286px candidate regardless of the ~350px
    // it was displayed at. Width descriptors plus `sizes` are what make that
    // decision correct.
    const gallery = container.querySelector<HTMLImageElement>(
      '#spaces picture img'
    )!
    const sources = Array.from(
      gallery.closest('picture')!.querySelectorAll('source')
    )

    expect(gallery.getAttribute('sizes')).toBeTruthy()
    expect(sources.length).toBeGreaterThan(0)
    for (const source of sources) {
      expect(source.getAttribute('sizes')).toBeTruthy()
      expect(source.srcset).toMatch(/\d+w/)
      expect(source.srcset).not.toMatch(/\dx(,|$)/)
    }
  })

  describe('FAQ disclosures', () => {
    it('exposes each question as a keyboard-operable button', () => {
      render(<App />)

      const question = screen.getByRole('button', {
        name: /what are the rates for your services\?/i
      })

      expect(question).toHaveAttribute('aria-expanded', 'false')
      expect(question).not.toHaveAttribute('tabindex')
    })

    it('reveals the answer when activated', async () => {
      const user = userEvent.setup()
      render(<App />)

      const question = screen.getByRole('button', {
        name: /what are the rates for your services\?/i
      })

      expect(screen.queryByText(/\$75\.00 per hour/i)).not.toBeInTheDocument()

      await user.click(question)

      expect(question).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText(/\$75\.00 per hour/i)).toBeInTheDocument()
    })
  })

  describe('process steps', () => {
    it('renders all six as buttons with pressed state', () => {
      render(<App />)

      const group = screen.getByRole('group', { name: /process steps/i })
      const steps = within(group).getAllByRole('button')

      expect(steps.map((b) => b.textContent)).toEqual([
        'declutter',
        'organize',
        'paint',
        'clean',
        'stage',
        'merchandise'
      ])
      expect(steps[0]).toHaveAttribute('aria-pressed', 'true')
      expect(steps[1]).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('gallery carousels', () => {
    it('labels both scroll directions distinctly', () => {
      render(<App />)

      expect(
        screen.getAllByRole('button', { name: /scroll to previous image/i })
          .length
      ).toBe(5)
      expect(
        screen.getAllByRole('button', { name: /scroll to next image/i }).length
      ).toBe(5)
    })
  })
})
