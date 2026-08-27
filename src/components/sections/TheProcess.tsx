import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

import { Picture } from 'components/Picture'
import { scrollToImage } from 'components/ui/scrollToImage'
import { focusRing } from 'components/ui/styles'
import type { PictureData } from 'types/images'
import {
  SIZES,
  clean,
  cleanBg,
  declutter,
  declutterBg,
  merchandise,
  merchandiseBg,
  organize,
  organizeBg,
  paint,
  paintBg,
  stage,
  stageBg
} from 'images'

type Step = {
  id: string
  icon: PictureData
  background: PictureData
  description: string
}

const STEPS: Step[] = [
  {
    id: 'declutter',
    icon: declutter,
    background: declutterBg,
    description:
      'Decluttering removes unnecessary items to create a cleaner, more functional space. This reduces stress, improves efficiency, and enhances overall mental clarity.'
  },
  {
    id: 'organize',
    icon: organize,
    background: organizeBg,
    description:
      'Organizing can help people save time, and improve productivity by creating order in their spaces and routines. A well-organized space makes it easier to find what you need and promotes a sense of order.'
  },
  {
    id: 'paint',
    icon: paint,
    background: paintBg,
    description:
      'Painting transforms homes and businesses by adding color, freshness, and personality to any space. A fresh coat of paint can create a brand-new atmosphere, making spaces feel more inviting, modern, or spacious.'
  },
  {
    id: 'clean',
    icon: clean,
    background: cleanBg,
    description:
      'Cleaning sets the foundation for a fresh start by preparing the space for decorating, staging, or remodeling. A thorough clean removes dust, grime, and old residues. A spotless space enhances the impact of any transformation, making the final result feel crisp, inviting, and revitalized.'
  },
  {
    id: 'stage',
    icon: stage,
    background: stageBg,
    description:
      'Staging prepares your home for sale by arranging furniture, décor, and lighting to highlight the property’s best features. This helps create an inviting, stylish space that appeals to potential buyers. A staged home will often sell faster and at a higher price, by making a strong first impression.'
  },
  {
    id: 'merchandise',
    icon: merchandise,
    background: merchandiseBg,
    description:
      'Merchandising boosts business growth by increasing visibility, attracting customers, and getting it into the hands of the consumer. Well-placed & well-packaged items encourage impulse purchases and increase revenue.'
  }
]

export const TheProcess = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Set while a selector is driving the scroll, so the resulting scroll events
  // do not fight the selection.
  const isSelectingRef = useRef(false)
  const selectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectStep = (index: number) => {
    isSelectingRef.current = true
    scrollToImage(containerRef.current, index)
    setSelectedIndex(index)

    if (selectTimeoutRef.current) clearTimeout(selectTimeoutRef.current)
    selectTimeoutRef.current = setTimeout(() => {
      isSelectingRef.current = false
    }, 500)
  }

  useEffect(
    () => () => {
      if (selectTimeoutRef.current) clearTimeout(selectTimeoutRef.current)
    },
    []
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (isSelectingRef.current) return
      const { scrollLeft, clientWidth } = container
      // Clamp: at the end of the scroll range the rounded index can overrun the
      // last step, which previously selected `undefined`.
      const index = Math.min(
        STEPS.length - 1,
        Math.max(0, Math.round(scrollLeft / clientWidth))
      )
      setSelectedIndex(index)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="process" className="relative flex flex-col md:scroll-mt-18">
      <motion.div
        className="sans-serif my-6 inline-block self-center border border-gray-800 bg-white px-8 py-6 text-xl font-thin uppercase tracking-wider text-gray-700 sm:my-12 sm:px-20 sm:text-2xl md:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2>The Process</h2>
      </motion.div>

      <div className="mx-auto my-8 flex max-w-6xl flex-col justify-around gap-4 px-8 font-light leading-loose tracking-wide text-gray-700 sm:px-12 md:flex-row lg:my-16">
        <div className="flex flex-1 gap-8">
          <div aria-hidden="true" className="font-serif text-4xl text-gray-300">
            1
          </div>
          <div className="sm:text-lg">
            We design a space perfectly-suited to fit your unique goals &amp;
            budget.
          </div>
        </div>
        <div className="flex flex-1 gap-6">
          <div aria-hidden="true" className="font-serif text-4xl text-gray-300">
            2
          </div>
          <div className="sm:text-lg">
            Our process then takes over, to deliver incredible results and
            exceed expectations.
          </div>
        </div>
      </div>

      {/*
        Step selectors. These were <div tabIndex={0}> with a hand-rolled key
        handler, and the label inside each was an <h3> — a heading nested in a
        control, which is neither valid HTML nor an accurate description of what
        these are. As <button>s they get keyboard activation, the correct role
        and `aria-pressed` state for free.
      */}
      <div
        role="group"
        aria-label="Process steps"
        className="z-10 mx-auto -mb-18 grid grid-cols-3 gap-1 sm:gap-4 md:grid-cols-6 md:gap-8"
      >
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            aria-pressed={selectedIndex === index}
            aria-controls="process-detail"
            onMouseEnter={() => selectStep(index)}
            onClick={() => selectStep(index)}
            onFocus={() => selectStep(index)}
            className={`sans-serif flex size-28 flex-1 cursor-pointer flex-col items-center justify-center border border-gray-800 bg-white pb-6 pt-4 text-center text-xs uppercase tracking-wide underline-offset-8 hover:font-bold sm:text-sm sm:tracking-wider sm:hover:underline md:size-36 ${focusRing} ${
              selectedIndex === index ? 'font-bold underline' : ''
            }`}
          >
            <Picture
              picture={step.icon}
              alt=""
              sizes="80px"
              className="w-16 bg-black md:w-20"
            />
            <span>{step.id}</span>
          </button>
        ))}
      </div>

      <div
        id="process-detail"
        className="hide-scrollbar h-96 snap-x snap-mandatory overflow-x-scroll xl:h-75vh"
        ref={containerRef}
      >
        <div className="flex h-full">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="relative size-full shrink-0 snap-center"
            >
              <motion.div
                className="absolute inset-x-0 top-24 mx-auto max-w-6xl md:bottom-[5%]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="mx-16 bg-black/60 p-3 text-center text-xs text-white lg:text-lg">
                  {step.description}
                </p>
              </motion.div>
              <Picture
                picture={step.background}
                alt=""
                aria-hidden="true"
                sizes={SIZES.fullBleed}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
