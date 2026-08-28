import { motion } from 'motion/react'

import { Picture } from 'components/Picture'
import { trackEvent } from 'components/analytics'
import { ButtonLarge, ButtonLargeSecondary } from 'components/ui/styles'
import { SIZES, arrowDown, check, hero, logo } from 'images'

const AUDIENCES = ['Home', 'Business', 'Real Estate', 'Any Space']

/**
 * The tagline is laid out twice — once beside the photograph on desktop, once
 * over it on mobile — because the two live in different flex columns. Only one
 * is ever visible, but both are in the DOM, so neither can be the page's `h1`
 * without producing two of them.
 *
 * The heading is therefore rendered once, visually hidden, and the two visible
 * copies are presentational.
 */
const TAGLINE_TEXT =
  'We revitalize your regular, unused, unloved places into amazing spaces.'

const Tagline = ({ className }: { className?: string }) => (
  <p aria-hidden="true" className={className}>
    We revitalize your{' '}
    <span className="sans-serif font-extralight">regular, unused, unloved</span>{' '}
    places into <span className="underline">amazin</span>g spaces.
  </p>
)

const taglineType =
  'py-8 text-center text-2xl leading-loose tracking-wide text-white sm:text-3xl md:max-w-2xl md:py-0 md:text-left md:text-4xl md:text-black'

export const Hero = () => (
  <section className="min-height relative flex h-screen flex-col-reverse md:flex-row md:pt-18">
    <h1 className="sr-only">{TAGLINE_TEXT}</h1>

    <div className="flex text-gray-700 md:flex-[2] md:flex-row md:pt-[30%] lg:pt-[15%] xl:flex-1">
      <div className="flex flex-1 flex-col justify-around pb-4 md:pb-10">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="hidden max-w-3xl px-8 md:block md:px-12 lg:my-8 xl:pl-24"
        >
          <Tagline className={taglineType} />
        </motion.div>

        <div className="px-2 py-8 sm:px-8 md:bg-gray-50 md:px-12 lg:pl-12 lg:pr-8 xl:pl-24">
          <ul className="sans-serif grid max-w-xl grid-cols-2 gap-4 text-gray-500 md:flex md:justify-between md:gap-0">
            {AUDIENCES.map((item, index) => (
              <motion.li
                key={item}
                className="flex justify-center gap-2 text-xs uppercase tracking-wider lg:gap-2 lg:text-sm"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.25 }}
              >
                <span>{item}</span>
                <img
                  src={check}
                  width="20"
                  height="20"
                  className="size-4 sm:size-5"
                  alt=""
                  aria-hidden="true"
                />
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex max-w-3xl justify-between gap-8 px-8 pt-4 md:justify-around md:px-12 xl:pl-24">
          <a
            href="#about"
            className={`${ButtonLarge} flex-1 font-bold`}
            onClick={() => trackEvent('learn_more_clicked')}
          >
            Learn More
            <img
              src={arrowDown}
              alt=""
              aria-hidden="true"
              width="24"
              height="24"
            />
          </a>
          <a
            href="#contact"
            className={`${ButtonLargeSecondary} hidden flex-1 border-0 md:block`}
            onClick={() => trackEvent('book_estimate_clicked')}
          >
            Book Your Estimate
          </a>
        </div>
      </div>
    </div>

    {/*
      The hero photograph is the Largest Contentful Paint element. It is a real
      <img> rather than a CSS background so it can carry fetchpriority, be
      preloaded from the document head, and pick a candidate sized to the
      viewport. `priority` opts it out of lazy loading.
    */}
    <div className="relative flex w-full flex-1 items-center overflow-hidden">
      <Picture
        picture={hero}
        alt=""
        aria-hidden="true"
        data-testid="hero-image"
        sizes={SIZES.hero}
        priority
        // `object-left-top` reproduces the framing of the CSS background
        // this replaced: `background-position` defaults to 0% 0%, whereas
        // `object-position` defaults to centre.
        className="absolute inset-0 size-full object-cover object-left-top"
      />
      {/* Darkens the photograph on mobile so the white tagline stays legible. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 md:hidden"
      />
      <motion.div
        className="relative mx-4 w-full pt-28 text-center sm:pt-24 md:hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Tagline className={taglineType} />
      </motion.div>
    </div>

    <div className="pointer-events-none absolute top-0 flex h-0 w-full justify-center text-center md:hidden">
      <div className="z-40">
        <div className="relative px-4">
          <Picture
            picture={logo}
            alt="Spacelift"
            sizes={SIZES.logo}
            eager
            className="top-1 h-24 w-auto sm:h-28"
          />
        </div>
      </div>
    </div>
  </section>
)
