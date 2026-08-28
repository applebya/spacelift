import { MotionConfig } from 'motion/react'

import 'styles/fonts.css'
import './App.css'

import { About } from 'components/sections/About'
import { Biography } from 'components/sections/Biography'
import { CTA } from 'components/sections/CTA'
import { Contact } from 'components/sections/Contact'
import { FAQ } from 'components/sections/FAQ'
import { Footer } from 'components/sections/Footer'
import { Header } from 'components/sections/Header'
import { Hero } from 'components/sections/Hero'
import { Spaces } from 'components/sections/Spaces'
import { TheProcess } from 'components/sections/TheProcess'
import { Testimonials } from 'components/sections/Testimonials'

/**
 * `reducedMotion="user"` makes every `motion` component honour the visitor's
 * `prefers-reduced-motion` setting: transform and opacity animations resolve
 * straight to their end state instead of playing.
 */
const App = () => (
  <MotionConfig reducedMotion="user">
    <div className="relative overflow-hidden bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <TheProcess />
        <Spaces />
        <CTA />
        <Testimonials />
        <Biography />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  </MotionConfig>
)

export default App
