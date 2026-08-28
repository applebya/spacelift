import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

import { Picture } from 'components/Picture'
import { trackEvent } from 'components/analytics'
import { scrollToImage } from 'components/ui/scrollToImage'
import { focusRing } from 'components/ui/styles'
import type { PictureData } from 'types/images'
import { SIZES, arrowDown, galleries } from 'images'

type Gallery = {
  title: string
  description?: string
  photos: PictureData[]
}

const GALLERIES: Gallery[] = [
  {
    title: 'Home',
    description:
      "Whether it's a dull living room, chaotic kids room or a cluttered kitchen pantry, we bring skills and tailored designs to elevate your everyday living.",
    photos: galleries.home
  },
  {
    title: 'Business',
    description:
      'Drive productivity and impress customers and clientele. We specialize in functional designs and spaces for businesses of all sizes.',
    photos: galleries.business
  },
  {
    title: 'Real Estate',
    description:
      'Maximize property value with our expert staging services. We create inviting spaces that attract potential buyers.',
    photos: galleries.realEstate
  },
  {
    title: 'Store Displays',
    description:
      'Captivate customers with eye-catching store displays. Our designs enhance product visibility and drive sales.',
    photos: galleries.storeDisplays
  }
]

const ArrowButton = ({
  direction,
  disabled,
  onClick,
  className
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
  className: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={`Scroll to ${direction} image`}
    className={`absolute bottom-4 rounded-full bg-white p-2 md:bottom-12 ${focusRing} ${className}`}
  >
    <img
      src={arrowDown}
      width="24"
      height="24"
      alt=""
      aria-hidden="true"
      className={`transition-opacity duration-500 ${
        direction === 'previous' ? 'rotate-90' : '-rotate-90'
      } ${disabled ? 'opacity-25' : ''}`}
    />
  </button>
)

const Gallery = ({ title, description, photos }: Gallery) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setCanScrollPrev(scrollLeft > 0)
      // Sub-pixel scroll positions mean an exact comparison never reaches the
      // end, so allow a pixel of slack.
      setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scroll = (direction: 'previous' | 'next') => {
    scrollToImage(containerRef.current, direction === 'next' ? 'next' : 'prev')
    trackEvent('click-image-arrow', { direction, space_type: title })
  }

  const isFullWidth = !description
  const sizes = isFullWidth ? SIZES.galleryWide : SIZES.gallery

  return (
    <div>
      <div className="relative">
        <h3
          className={`sans-serif absolute z-10 border border-black bg-white px-4 py-2 text-center font-thin uppercase tracking-wider text-gray-700 md:px-8 md:py-3 md:text-xl ${
            isFullWidth
              ? 'left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 md:top-12'
              : 'left-3 top-3'
          }`}
        >
          {title}
        </h3>
        <div
          className={`hide-scrollbar flex aspect-video snap-x snap-mandatory overflow-x-scroll border-0 border-black lg:border ${
            isFullWidth ? '' : 'border md:aspect-square'
          }`}
          ref={containerRef}
        >
          {photos.map((photo, index) => (
            <div
              key={index}
              className="inline h-full min-w-full snap-center"
              style={{ scrollSnapAlign: 'center' }}
            >
              <Picture
                picture={photo}
                sizes={sizes}
                alt={`${title} project ${index + 1}`}
                className="size-full object-cover"
              />
            </div>
          ))}

          <ArrowButton
            direction="previous"
            disabled={!canScrollPrev}
            onClick={() => scroll('previous')}
            className="left-4"
          />
          <ArrowButton
            direction="next"
            disabled={!canScrollNext}
            onClick={() => scroll('next')}
            className="right-4"
          />
        </div>
      </div>
      {description && (
        <p className="px-2 pt-4 text-center font-light leading-loose tracking-wide text-gray-700 sm:px-10 md:px-0 md:pt-6">
          {description}
        </p>
      )}
    </div>
  )
}

export const Spaces = () => (
  <section id="spaces" className="relative md:scroll-mt-18">
    <div className="text-center lg:mb-24">
      <div className="sans-serif inline-block bg-white px-8 py-16 text-lg font-thin uppercase tracking-wider text-gray-700 sm:py-20 sm:text-2xl md:text-4xl lg:pb-20">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Any Space
          <span
            aria-hidden="true"
            className="mx-2 mb-12 mt-0.5 text-gray-200 md:mx-6"
          >
            •
          </span>
          Any Style
        </motion.h2>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 pb-12 text-left sm:px-12 sm:pb-28 md:grid-cols-2 md:gap-24">
        {GALLERIES.map((gallery) => (
          <Gallery key={gallery.title} {...gallery} />
        ))}
      </div>

      <div className="mx-auto max-w-6xl">
        <Gallery title="Any Space" photos={galleries.anySpace} />
      </div>
    </div>
  </section>
)
