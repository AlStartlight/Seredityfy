'use client';
import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/src/components/Card'
import { Card1, Card2, Card3, PolygonIcons, PolygonIcons2, PolygonIcons3 } from '@/src/assets/import';
import { staggerContainer, fadeInUp } from '@/src/animations/variants';

function Obsviewsly() {
  return (
    <div className='bg-fuchsia-900 bg-opacity-20 backdrop-blur-2xl mt-[-6%] border-t-0 border-fuchsia-500'>
      <div className='px-10 pt-6 max-w-7xl mx-auto'>
        <h1 className='text-white text-3xl  font-semibold'><strong>Features</strong> News</h1>
      </div>
      <motion.div
        className='flex top-20
         flex-col max-w-7xl mx-auto xl:flex-row sm:flex-col lg:flex-row 2xl:flex-row
         py-8 sm:py-20 md:py-8 lg:py-12 xl:py-16 2xl:py-20
          px-4  gap-8  md:justify-between justify-center items-center'
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }}>
          <Card img={Card1} imgicons={PolygonIcons} title="Using Discord" sub="Mastering the Art of Prompt Writing" content="Prompt writing involves crafting clear and engaging prompts, while using images to create a visual representation of the idea or concept." />
        </motion.div>
        <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }}>
          <Card img={Card2} imgicons={PolygonIcons2} title="Getting Started" sub="Streamlining Collaborative Workflows" content="se the Midjourney Bot on Discord to effortlessly generate designs and artworks for your project. Simply enter a command and the bot " />
        </motion.div>
        <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }}>
          <Card img={Card3} imgicons={PolygonIcons3} title="User Guide" sub="Unraveling the Mystery of Version" content="Explore key concepts like versions and parameters when using Midjourney. Versions refer to different variations of a design," />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Obsviewsly
