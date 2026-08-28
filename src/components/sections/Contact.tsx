import { FormEvent, useState } from 'react'

import { Picture } from 'components/Picture'
import { trackEvent } from 'components/analytics'
import { ButtonLargeSecondary } from 'components/ui/styles'
import { CONTACT_FORM_ENDPOINT } from 'components/ui/links'
import { SIZES, contactBg } from 'images'

const fieldClass = 'mt-2 block w-full border border-gray-300 p-2'

/** Formats North American digits as 123-456-7890 while typing. */
const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  const [, area, prefix, line] =
    digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/) ?? []

  if (line) return `${area}-${prefix}-${line}`
  if (prefix) return `${area}-${prefix}`
  return area ?? ''
}

export const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [question, setQuestion] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const formData = { name, email, phone, question, message }
    trackEvent('submit_form')

    try {
      setError('')
      setIsLoading(true)

      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.code === 200) {
        setIsSuccess(true)
      } else {
        setError(data.message ?? 'Something went wrong. Please try again.')
      }
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'An unknown error occurred. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="contact" className="flex md:scroll-mt-32">
      <div className="relative hidden flex-1 md:flex">
        <Picture
          picture={contactBg}
          alt=""
          aria-hidden="true"
          sizes={SIZES.contact}
          className="absolute inset-0 size-full object-cover object-center"
        />
      </div>
      <div className="flex flex-[2] flex-col items-center p-4 leading-loose tracking-wide sm:p-12">
        <h2 className="sans-serif -mt-16 mb-6 inline w-full border border-gray-800 bg-white px-8 py-4 text-center font-thin uppercase tracking-wider sm:w-auto sm:px-12 sm:text-xl lg:-mt-24 lg:px-24 lg:py-8 lg:text-2xl">
          Start Your Spacelift
        </h2>

        {isSuccess ? (
          <div className="my-36 max-w-xl text-center">
            <h3 className="mb-8 text-xl">Thanks for getting in touch!</h3>
            <p>
              We&apos;ll get back to you within a few business days to discuss
              your Spacelift project.
              <br />
              <br />
              Your info:
              <br />
              <br />
              {name}
              <br />
              {email} / {phone}
              <br />
              <strong>Question:</strong> {question}
              <br />
              <strong>Message:</strong> {message}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full sm:max-w-md">
            <label className="mt-4 block">
              <span className="text-gray-700">
                Name <sup className="text-red-500">*</sup>
              </span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                placeholder="Your full name"
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                required
              />
            </label>
            <div className="flex-col gap-8 md:flex-row">
              <label className="mt-6 block">
                <span className="text-gray-700">
                  Email <sup className="text-red-500">*</sup>
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  placeholder="your@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  required
                />
              </label>
              <label className="mt-6 block">
                <span className="text-gray-700">Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  placeholder="123-456-7890"
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="mt-6 block">
              <span className="text-gray-700">Have a question?</span>
              <input
                type="text"
                name="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="mt-6 block">
              <span className="text-gray-700">
                Tell us about your space <sup className="text-red-500">*</sup>
              </span>
              <textarea
                className={`${fieldClass} text-sm`}
                rows={5}
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>
            {error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                Error: {error}
              </p>
            )}
            <button
              className={`${ButtonLargeSecondary} mt-8 w-full rounded-full border border-gray-700`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending…' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
