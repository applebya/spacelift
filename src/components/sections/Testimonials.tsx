import { motion } from 'motion/react'

import { star } from 'images'

const TESTIMONIALS: [string, string][] = [
  [
    'T. Malley',
    '“Completely transformed our space! The design was thoughtful, modern, and exactly what we needed. Couldn’t be happier!”'
  ],
  [
    'T. Deelstra',
    '“You did more than expected — your help staging our home was truly exceptional. I appreciate your services and all your hard work.”'
  ],
  [
    'M. Bowden',
    '“Amazing — upfront, honest, and incredibly dedicated. She cleaned and staged our home. Fantastic job, sold within hours.”'
  ],
  [
    'R. Scott',
    '“Excellent design sense and her incredible attention to every detail to make sure things are perfect is incredible. I’ve never met someone with her level of energy. 11 out of 10.”'
  ],
  [
    'S. Wilson',
    '“Hard worker and I appreciate everything she did . Hands and knees cleaning and staging. And she is fast!!! Efficient and incredible - I couldn’t recommend her more.”'
  ],
  [
    'H. Forhand',
    '“Completely transformed my entire townhouse to allow for the sales using her great taste, creativity, ingenuity and muscle. She staged it with style and class. No job is too big or small for her.”'
  ],
  [
    'M. Seel',
    '“Spacelift transformed our office! Their design gave us a competitive edge by boosting productivity and impressing clients.”'
  ],
  [
    'A. Johnson',
    '“Exceptional service and stunning results. Our new space is both beautiful and practical. Thank you, Spacelift!”'
  ],
  [
    'H. Smith',
    '“Spacelift transformed our home into a modern, stylish space. An absolute pleasure to work with, highly recommended!”'
  ]
]

export const Testimonials = () => (
  <section className="bg-gray-100">
    <div className="mx-auto flex max-w-6xl flex-col bg-gray-100 p-4 sm:p-8 sm:px-12">
      <motion.div
        className="mt-8 inline-flex justify-center gap-2 self-center px-6 py-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        role="img"
        aria-label="Rated five out of five stars"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <img
            key={index}
            src={star}
            alt=""
            aria-hidden="true"
            width="48"
            height="48"
            className="w-12 sm:w-18"
          />
        ))}
      </motion.div>
      <h2 className="mt-4 text-center text-lg italic tracking-wide text-gray-600 sm:text-xl">
        Five-Star Customer Service
      </h2>
      <ul className="grid grid-cols-1 gap-8 py-12 sm:gap-x-20 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-3">
        {TESTIMONIALS.map(([name, quote]) => (
          <li key={name} className="flex flex-col">
            <figure className="flex flex-1 flex-col">
              <figcaption className="mb-2 text-lg italic text-gray-600">
                {name}
              </figcaption>
              <blockquote className="flex-1 border border-black bg-white px-6 py-4 text-sm italic leading-loose tracking-wide text-gray-700 transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-300">
                {quote}
              </blockquote>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  </section>
)
