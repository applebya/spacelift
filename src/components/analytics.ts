declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, string | boolean>
    ) => void
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | boolean>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params || {})
  }
}
