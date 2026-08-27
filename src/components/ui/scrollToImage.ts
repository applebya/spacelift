/**
 * Scrolls a horizontal snap container by one full slide, or directly to a slide
 * index. Slides are always exactly one container width wide.
 */
export const scrollToImage = (
  container: HTMLDivElement | null,
  directionOrIndex: 'prev' | 'next' | number
) => {
  if (!container) return

  const slide = container.clientWidth
  const left =
    typeof directionOrIndex === 'number'
      ? directionOrIndex * slide
      : directionOrIndex === 'next'
        ? container.scrollLeft + slide
        : container.scrollLeft - slide

  container.scrollTo({ left, behavior: 'smooth' })
}
