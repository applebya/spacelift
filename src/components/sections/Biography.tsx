import { Picture } from 'components/Picture'
import { SIZES, biographyBg, biographyBgMobile, signature } from 'images'

export const Biography = () => (
  <section className="min-height-bio relative isolate h-screen overflow-hidden">
    {/*
      Two crops of the founder's photograph, one portrait and one landscape. The
      swap used to be done by setting one layer's `background-size` to `0 0` at
      each breakpoint, which downloaded both. `<source media>` is what that hack
      was imitating, and it downloads only the one that applies.
    */}
    <Picture
      picture={biographyBg}
      media={[{ media: '(max-width: 767px)', picture: biographyBgMobile }]}
      alt=""
      aria-hidden="true"
      sizes={SIZES.fullBleed}
      className="absolute inset-0 -z-10 size-full object-cover object-left md:object-center"
    />

    <div className="mx-auto flex size-full max-w-7xl items-center justify-center sm:px-12 md:mt-0 md:flex-row">
      <div className="flex-[3]"></div>
      <div className="my-4 ml-[15%] flex w-full flex-col items-center bg-black/60 px-4 py-1 sm:flex-[5] md:max-w-2xl md:px-12 md:py-8 lg:ml-0">
        <div className="relative flex-1 py-4 pt-6 text-center text-white">
          <div
            aria-hidden="true"
            className="ml-10 block min-h-[3px] bg-white"
          />
          <span
            aria-hidden="true"
            className="absolute -left-4 top-2 z-0 px-3 text-7xl text-gray-200"
          >
            &#8220;
          </span>
          <span
            aria-hidden="true"
            className="absolute -bottom-8 -right-2 z-0 px-3 text-7xl text-gray-200"
          >
            &#8221;
          </span>

          <div className="sans-serif mt-6 leading-loose lg:mt-10">
            <h2 className="text-sm text-inherit md:text-lg lg:text-xl">
              I&apos;m a certified Professional Organizer and the founder of
              Spacelift.
            </h2>

            <p className="mt-5 text-sm leading-loose md:text-lg lg:text-xl">
              Raised on beautiful Vancouver Island, I have always had a passion
              for building things and problem-solving. With an eye for style and
              a need to refurbish, create, organize and decorate I find
              inspiration everywhere.
            </p>
            <p className="mt-5 text-sm leading-loose md:text-lg lg:text-xl">
              Over the years, honing my skills has been more than just
              professional growth. It feeds my soul to create functional,
              beautiful things &amp; spaces that truly reflect the people who
              use and live in them.
            </p>
          </div>
          <div className="justify-self-center">
            <Picture
              picture={signature}
              alt="Rosemarie Root"
              title="Rosemarie Root"
              sizes={SIZES.signature}
              className="relative z-10 mb-2 h-auto w-auto md:mt-2 md:h-32"
            />
          </div>
          <div
            aria-hidden="true"
            className="mr-12 block min-h-[3px] bg-white"
          />
        </div>
      </div>
    </div>
  </section>
)
