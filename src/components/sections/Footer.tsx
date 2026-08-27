import { Picture } from 'components/Picture'
import { trackEvent } from 'components/analytics'
import { focusRing } from 'components/ui/styles'
import { FACEBOOK_URL, INSTAGRAM_URL } from 'components/ui/links'
import { SIZES, facebook, instagram, logo } from 'images'

export const Footer = () => (
  <footer className="flex bg-black/90 text-white">
    <div className="hidden flex-1 items-center justify-center lg:flex lg:border-r-white">
      <div>
        <Picture
          picture={logo}
          alt="Spacelift"
          sizes={SIZES.logo}
          className="h-32 w-auto brightness-150 grayscale"
        />
        <div className="sans-serif flex justify-center text-xs tracking-widest">
          <span className="mb-1">TRANSFORMING SPACES</span>
        </div>
      </div>
    </div>
    <div className="flex flex-[2] justify-between border-l border-l-white p-6 sm:px-12">
      <div className="flex flex-col gap-8 text-sm md:text-base">
        <div className="hidden font-thin tracking-wide md:block">
          Explore our projects on Facebook &amp; Instagram!
        </div>
        <div className="flex-1 flex-col items-center gap-8 md:flex-row">
          <div className="flex gap-2">
            <a
              className={`rounded-full border-2 border-white ${focusRing}`}
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackEvent('social_clicked', { platform: 'facebook' })
              }
            >
              <img
                src={facebook}
                alt="Spacelift on Facebook"
                width="24"
                height="24"
              />
            </a>
            <a
              className={`rounded-full border-2 border-white ${focusRing}`}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackEvent('social_clicked', { platform: 'instagram' })
              }
            >
              <img
                src={instagram}
                alt="Spacelift on Instagram"
                width="24"
                height="24"
              />
            </a>
          </div>
          <div className="hidden pt-2 tracking-wide text-white sm:block">
            @spaceliftonline
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-1 text-right">
        <div className="flex flex-1 flex-col">
          <a
            href="#"
            className={`mb-2 inline-block text-sm tracking-wide underline ${focusRing}`}
          >
            Back to top
          </a>
        </div>
        <div className="mt-2 flex flex-col gap-2 text-sm tracking-wide text-gray-300">
          &copy; Spacelift {new Date().getFullYear()}
        </div>
      </div>
    </div>
  </footer>
)
