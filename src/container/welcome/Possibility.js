'use client';
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Midjourney60 } from '@/src/assets/import'
import { fadeInLeft, fadeInRight } from '@/src/animations/variants'

export const Possibility = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div
      ref={ref}
      className='flex flex-col md:flex-row items-center
      md:px-40 md:p-20 bg-orange-600 p-10
      bg-opacity-10 backdrop-blur-3xl'
    >
      <motion.img
        src={Midjourney60}
        className='w-[200px] h-[200px] xl:w-full xl:h-[460px] rounded-2xl'
        alt={`${Midjourney60}`}
        variants={fadeInLeft}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      />
      <motion.div
        className='flex flex-col md:p-10 p-4'
        variants={fadeInRight}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <p className='mb-4 leading-5 text-transparent text-[11px] bg-clip-text bg-gradient-to-tr from-orange-400 to-fuchsia-500'>Request Early Access to Get Started</p>
        <h1 className='mb-6 leading-8 bg-clip-text bg-gradient-45 from-fuchsia-500 via-purple-600 to-orange-600 text-transparent  text-2xl lg:text-3xl md:w-5/6'>Seredityfy Possibility is the possibilities are beyond your imagination</h1>
        <h3 className='mb-6 text-transparent bg-clip-text bg-gradient-to-tr from-orange-200 to-fuchsia-300'>Meet New Next AI Generation </h3>
        <p className=' mb-5 leading-6 text-[13px] text-gray-300'>Seredityfy is an image AI generator website that possesses the capability of deep shadow and image manipulation. It allows users to enhance and modify images and graphics using advanced algorithms. By utilizing its deep shadow feature, Seredityfy can generate realistic and intricate shadows in images, adding depth and dimension to the visuals. Furthermore, the platform offers various tools for image engineering and manipulation, enabling users to transform and edit pictures and illustrations according to their preferences. With Seredityfy, users can unlock the potential of their images and unleash their creativity by leveraging powerful AI-driven techniques.</p>
      </motion.div>
    </div>
  )
}
