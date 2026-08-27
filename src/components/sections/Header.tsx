import { Fragment, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

import { sourcesFor } from 'components/Picture'
import { trackEvent } from 'components/analytics'
import { Button, focusRing } from 'components/ui/styles'
import { FACEBOOK_URL, INSTAGRAM_URL } from 'components/ui/links'
import { SIZES, facebook, instagram, logo, logoWatermark } from 'images'

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#process', label: 'The Process' },
  { href: '#spaces', label: 'Any Space' }
]

/** Matches Tailwind's `md` breakpoint. */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}

const SocialLinks = ({
  className,
  linkClassName,
  onNavigate
}: {
  className?: string
  linkClassName?: string
  onNavigate?: () => void
}) => (
  <div className={className}>
    <a
      href={FACEBOOK_URL}
      target="_blank"
      rel="noreferrer"
      className={`${linkClassName} ${focusRing}`}
      onClick={() => {
        onNavigate?.()
        trackEvent('social_clicked', { platform: 'facebook' })
      }}
    >
      <img src={facebook} alt="Spacelift on Facebook" width="24" height="24" />
    </a>
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      className={`${linkClassName} ${focusRing}`}
      onClick={() => {
        onNavigate?.()
        trackEvent('social_clicked', { platform: 'instagram' })
      }}
    >
      <img
        src={instagram}
        alt="Spacelift on Instagram"
        width="24"
        height="24"
      />
    </a>
  </div>
)

export const Header = () => {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  const { scrollY } = useScroll()
  const scrollEnd = 310

  // Desktop only: the logo shrinks into the corner as the page scrolls.
  const left = useTransform(scrollY, [0, scrollEnd], ['12%', '1%'])
  const top = useTransform(scrollY, [0, scrollEnd], ['50%', '0%'])
  const width = useTransform(scrollY, [0, scrollEnd], [420, 150])
  const opacity = useTransform(scrollY, [0, 80], [1, 0])
  const watermarkTop = useTransform(scrollY, [0, scrollEnd], [-280, -400])
  const watermarkOpacity = useTransform(
    scrollY,
    [0, scrollEnd],
    [isMobile ? 0 : 0.075, 0]
  )

  return (
    <header className="sans-serif fixed left-0 top-0 z-20 w-full md:bg-white/80 md:backdrop-blur-sm">
      <div className="px-4 lg:mx-auto">
        <picture>
          {sourcesFor(logoWatermark, '1200px')}
          <motion.img
            src={logoWatermark.img.src}
            alt=""
            aria-hidden="true"
            width={logoWatermark.img.w}
            height={logoWatermark.img.h}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute -z-50 w-[1200px] max-w-none opacity-10 grayscale"
            style={{ top: watermarkTop, opacity: watermarkOpacity }}
          />
        </picture>

        {/* Desktop logo: animated into the corner on scroll. */}
        <motion.div className="absolute hidden md:block" style={{ left, top }}>
          <a
            href="#"
            className={`mt-4 flex flex-col items-center md:mt-0 ${focusRing}`}
          >
            <picture>
              {sourcesFor(logo, SIZES.logo)}
              <motion.img
                src={logo.img.src}
                alt="Spacelift"
                width={logo.img.w}
                height={logo.img.h}
                sizes={SIZES.logo}
                fetchPriority="high"
                decoding="async"
                className="h-auto"
                style={{ width }}
              />
            </picture>
            <motion.div
              className="hidden justify-center text-sm tracking-widest text-gray-600 md:flex"
              style={{ opacity }}
            >
              <span>TRANSFORMING SPACES</span>
            </motion.div>
          </a>
        </motion.div>

        <nav
          aria-label="Primary"
          className="hidden items-center justify-end gap-5 py-4 text-sm uppercase tracking-wider underline-offset-8 md:flex"
        >
          {NAV_LINKS.map((item, index) => (
            <Fragment key={item.href}>
              <a
                href={item.href}
                className={`p-2 text-gray-700 hover:cursor-pointer hover:text-gray-900 hover:underline ${focusRing}`}
              >
                {item.label}
              </a>
              {index < NAV_LINKS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden text-gray-300 lg:block"
                >
                  •
                </span>
              )}
            </Fragment>
          ))}
          <a
            href="#contact"
            className={`${Button} ml-2 px-4 font-bold`}
            onClick={() => trackEvent('book_estimate_clicked')}
          >
            <span className="hidden lg:block">Book your</span> Estimate
          </a>
          <SocialLinks className="hidden gap-2 xl:flex" />
        </nav>

        <div className="absolute right-3 top-4 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`z-50 border border-black bg-white p-2 ${focusRing}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Primary"
            className="absolute right-0 top-0 z-10 -ml-8 flex h-screen w-screen flex-col items-center justify-center gap-12 bg-white py-4 pt-24 text-sm uppercase tracking-wider md:hidden"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-xl text-gray-700 hover:text-gray-900 hover:underline ${focusRing}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className={`${Button} ml-2 font-bold`}
              onClick={() => {
                setMenuOpen(false)
                trackEvent('book_estimate_clicked')
              }}
            >
              Book Free Estimate
            </a>
            <SocialLinks
              className="flex gap-2"
              onNavigate={() => setMenuOpen(false)}
            />
          </nav>
        )}
      </div>
    </header>
  )
}
