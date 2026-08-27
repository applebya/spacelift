/** Shared button appearance. Kept as class strings so Tailwind can see them. */
export const Button =
  'sans-serif inline-flex items-center justify-center gap-2 whitespace-nowrap border border-gray-800 bg-white px-6 py-2 text-sm uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800'

export const ButtonLarge = `${Button} px-12 py-3 text-lg`

export const ButtonLargeSecondary = `${ButtonLarge} bg-yellow-50 text-center`

/** Applied to links and controls that are not `Button`-styled. */
export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800'
