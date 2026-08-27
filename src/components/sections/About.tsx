import { motion } from 'motion/react'

import { Picture, imageSet } from 'components/Picture'
import { ButtonLarge } from 'components/ui/styles'
import { SIZES, arrowDown, couch, couchBg, vanIsle } from 'images'

export const About = () => (
  <section
    id="about"
    // `isolate` makes this section a stacking context so the decorative layers
    // below can use negative z-index without falling behind the section itself.
    className="relative isolate bg-gray-100 bg-[length:100%_150px] bg-[position:right_bottom] bg-no-repeat pb-96 md:scroll-mt-18 lg:pb-56"
    style={{ backgroundImage: `url(${couchBg})` }}
  >
    {/*
      Island watermark. Previously the third layer of the section's
      `background-image`; pulled onto its own element so it can use `image-set()`
      to negotiate AVIF/WebP without risking the gradient strip above falling
      back with it. It was positioned off-screen below `md`, so it is simply not
      rendered there.
    */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden bg-fixed bg-[position:right_top_-90px] bg-no-repeat md:block"
      style={{ backgroundImage: imageSet(vanIsle) }}
    />

    <motion.div
      className="sans-serif my-8 inline-block border border-l-0 border-gray-800 bg-white py-6 pl-8 pr-12 text-xl font-thin uppercase tracking-wider text-gray-700 sm:my-12 sm:pl-12 sm:pr-20 sm:text-2xl md:text-3xl xl:pl-24"
      initial={{ x: -100, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h2>What is Spacelift?</h2>
    </motion.div>

    <div className="px-8 sm:px-12 xl:pl-24">
      <div className="max-w-2xl font-light leading-loose tracking-wide text-gray-700 sm:text-lg">
        Spacelift is your complete transformation design service for home /
        business / real estate. Any space, in any style.
        <br />
        <br />
        Cost-effective, reliable, and fully insured, we manage projects from
        start to success with personalized care at every step.
        <br />
        <br />
        Proudly based in southern Vancouver Island.
      </div>
      <div className="mt-12">
        <a href="#process" className={ButtonLarge}>
          View the process
          <img
            src={arrowDown}
            alt=""
            aria-hidden="true"
            width="24"
            height="24"
          />
        </a>
      </div>
    </div>

    {/*
      The cut-out couch sits against the section's bottom-right corner. It was a
      CSS background sized by height; as an <img> it can be lazy-loaded, offered
      as AVIF or WebP with transparency intact, and generated at the size it is
      actually displayed at rather than the 1200px the old rule asked for.
    */}
    <Picture
      picture={couch}
      alt=""
      aria-hidden="true"
      sizes={SIZES.couch}
      className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[370px] w-auto max-w-none md:h-[450px]"
    />
  </section>
)
