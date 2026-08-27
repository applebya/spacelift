import { ReactNode, useId, useState } from 'react'
import { motion } from 'motion/react'

import { trackEvent } from 'components/analytics'
import { focusRing } from 'components/ui/styles'
import { arrowDown } from 'images'

/**
 * A disclosure.
 *
 * The question used to be an `<h3 tabIndex={-1} onClick>`: a negative tabindex
 * takes it out of the tab order entirely, so the whole FAQ was unreachable by
 * keyboard. It is now a `<button>` inside the heading — the standard disclosure
 * pattern — which keeps the heading in the document outline while making the
 * control operable and exposing its expanded state.
 */
const Question = ({
  title,
  children
}: {
  title: string
  children: ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="mt-4">
      <h3 className="mb-4">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => {
            setIsOpen(!isOpen)
            trackEvent('faq_clicked', { question: title, is_open: !isOpen })
          }}
          className={`inline-flex cursor-pointer text-left font-light text-gray-600 hover:underline sm:text-lg ${focusRing}`}
        >
          <span>{title}</span>
          <img
            src={arrowDown}
            width="24"
            height="24"
            alt=""
            aria-hidden="true"
            className={`ml-4 inline-block shrink-0 transition-transform ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      </h3>
      {isOpen && (
        <motion.div
          id={panelId}
          className="border border-gray-800 bg-white p-6 text-sm leading-loose tracking-wide text-gray-800"
          initial={{ marginTop: -50, opacity: 0 }}
          animate={{ marginTop: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

export const FAQ = () => (
  <section className="bg-gray-100">
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-12 sm:pb-36 sm:pt-24">
      <h2 className="mb-12 text-2xl tracking-wide sm:mb-16 md:text-3xl">
        Frequently Asked Questions
      </h2>
      <Question title="What are the rates for your services?">
        Prices begin at $75.00 per hour (3 hour minimum). Jobs can vary
        depending on your needs and requirements.
      </Question>
      <Question title="Should I buy boxes, bins or containers?">
        These supplies can be costly but necessary. We are happy to work with
        items you may want to purchase or already have. Alternatively we can
        provide any needed items for an additional fee.
      </Question>
      <Question title="Is Spacelift insured, certified and confidential?">
        Absolutely! Spacelift is fully insured and certified, ensuring top-notch
        quality and peace of mind for all our clients. All of your information
        is confidential and secure.
      </Question>
      <Question title="Does your company offer moving services?">
        Unfortunately we do not offer physical moving and loading, but we are
        able to offer packing and unpacking services.
      </Question>
      <Question title="Do I need to be home for the Spacelift process?">
        No, not usually. Depending on the project scope we may need to spend
        some time together one-on-one sorting through items.
      </Question>
      <Question title="What happens to all the extra stuff I don't want?">
        We will take care of all your unwanted &amp; unneeded items for you.
        <p className="mt-6 font-bold">DONATIONS:</p>
        We will donate to organizations that make a difference in our community.
        <p className="mt-2 font-bold">REHOMED &amp; REUSED:</p>
        Your items can have a second chance and be rehomed and reused in a
        different project.
        <p className="mt-2 font-bold">RECYCLING, GARBAGE &amp; HAULING:</p>
        We are happy to take it away but additional dump fees and rates may
        apply.
      </Question>
      <Question title="How long does a typical decluttering and space transformation take?">
        The time required depends on several factors, including the size of the
        space, the amount of clutter, and scope of work needed. A smaller
        project like a closet or pantry, can typically be completed in a few
        hours to a day. A larger space, such as a bedroom or home office, may
        take one to two days. Whole-home transformations or business spaces may
        require several days to a week.
      </Question>
      <Question title="My back yard isn't working for me, is this a space you could help with?">
        Any space in any style. From inside to out we will work with any space
        you need.
      </Question>
    </div>
  </section>
)
