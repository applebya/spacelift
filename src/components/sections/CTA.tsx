import { Picture } from 'components/Picture'
import { trackEvent } from 'components/analytics'
import { Button } from 'components/ui/styles'
import { SIZES, arrowDown, ctaBg } from 'images'

export const CTA = () => (
  <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden md:h-screen">
    <Picture
      picture={ctaBg}
      alt=""
      aria-hidden="true"
      sizes={SIZES.fullBleed}
      className="absolute inset-0 -z-10 size-full object-cover object-center"
    />
    <div className="m-4 border bg-white/80 px-12 py-6 text-center text-lg font-light leading-loose tracking-wide text-gray-700 backdrop-blur-sm md:px-24 md:py-12">
      Have a unique space in mind?
      <br />
      Let us elevate it.
      <div className="mt-6">
        <a
          href="#contact"
          className={`${Button} ml-2 font-bold`}
          onClick={() => trackEvent('start_project_clicked')}
        >
          Start your project
          <img
            src={arrowDown}
            width="24"
            height="24"
            alt=""
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  </section>
)
