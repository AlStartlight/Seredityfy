'use client';
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import framework from '@/src/utils/framework'
import { fadeInUp, staggerContainer } from '@/src/animations/variants'

export const MultiIntegration = () => {
  const headingRef = useRef(null);
  const cardsRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-100px' });
  const cardsInView = useInView(cardsRef, { once: true, margin: '-100px' });

  return (
    <div className="flex flex-col mb-20 items-center bg-contain xl:h-screen py-10 w-screen bg-no-repeat bg-gray-900">
      <motion.div
        ref={headingRef}
        variants={staggerContainer}
        initial="hidden"
        animate={headingInView ? 'visible' : 'hidden'}
        className="flex flex-col items-center"
      >
        <motion.h1 variants={fadeInUp} className="text-white font-extrabold text-3xl tracking-wider text-center">Framework Integration</motion.h1>
        <motion.p variants={fadeInUp} className="text-white text-2xl font-bold tracking-wide text-center">Multi connecting line rule of machine</motion.p>
      </motion.div>
      <motion.div
        ref={cardsRef}
        className="container mx-auto grid gap-2 lg:grid-cols-3 lg:gap-2 2xl:gap-8 mt-8"
        variants={staggerContainer}
        initial="hidden"
        animate={cardsInView ? 'visible' : 'hidden'}
      >
        {
          framework.map((item, index) =>
            <motion.a key={index} href="#" variants={fadeInUp}>
              <div className="bg-white rounded-lg shadow-lg cursor-pointer" >
                <img src={item.url} alt="Card Image" className="w-full h-40 object-cover rounded-t-lg" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2"><strong><em>{item.thumbl}</em></strong></h3>
                  <p className="text-gray-600">{item.content}</p>
                  <div className="mt-4 flex items-center">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUTMgDC5dkNN2Pv3l3R9_70LMseGCGnUtheQ&usqp=CAU" alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
                    <span className="text-gray-700">John Doe</span>
                  </div>
                </div>
              </div>
            </motion.a>
          )
        }
      </motion.div>
    </div>
  )
}
