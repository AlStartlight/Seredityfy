'use client';
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Microsoft, OpenAi, Image12, Image2, Image6, Bing } from '@/src/assets/import'
import PartnerCard from '@/src/components/PartnerCard'
import { staggerContainer, scaleIn } from '@/src/animations/variants'

export const Partner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div className='flex flex-col bg-gradient-135 from-slate-700 via-grey-900 to-fuchsia-900 h-full backdrop-blur-3xl bg-opacity-5'>
      <div className='bg-blue-950 h-full bg-opacity-10 backdrop-blur-3xl'>
        <div className='px-4 lg:px-32 py-4 lg:py-20  justify-center items-center align-middle'>
          <div className='flex flex-col items-center mx-auto gap-8 xs:w-5/6'>
            <h1 className='leading-5 font-medium lg:text-4xl text-white xs:text-[25px] sm:text-sm'>Seredityfy Partner</h1>
            <h3 className='leading-5 font-medium lg:text-4xl  text-white xs:text-[18px] xs:text-center xs:whitespace-normal sm:text-xs'>Most Partner ever support deep AI Image and 3D generator </h3>
            <p className='mx-auto w-9/12 lg:text-center xs:text-justify lg:text-base text-white xs:text-[11px] md:text-sm'>An imaginative collage showcasing characters, landscapes, and icons representing collaborative storytelling. Diverse people coming together, a fantasy realm, and thought bubbles hinting at creative ideas merge into an artistic mosaic, symbolizing the unity and boundless imagination found on Serendipityfy.</p>
          </div>
          <motion.div
            ref={ref}
            className='flex flex-col lg:flex-row  mt-20 lg:mx-[80px] gap-2 items-center justify-center'
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div
              variants={scaleIn}
              className='max-w-xs items-center bg-slate-950 border border-slate-200 bg-opacity-40  rounded-lg shadow  dark:border-gray-700 justify-center  backdrop-blur-3xl '
            >
              <div className='w-[86px] h-10 rounded-sm m-6 bg-slate-700 align-middle justify-center items-center'>
                <p className='text-white p-2'>Microsoft</p>
              </div>
              <h2 className='text-white m-6'>Corporates</h2>
              <p className='m-6 text-xs text-gray-300'>Microsoft partners with businesses to provide comprehensive solutions across sectors. Through collaborations in cloud computing, Azure offers scalable infrastructure and advanced analytics, enabling efficient operations and digital transformation. Microsoft 365 delivers powerful productivity tools for seamless collaboration and secure document management. Customized solutions drive innovation, while hardware partnerships ensure compatibility and optimization. Microsoft's partnerships empower businesses with resources for digital success.</p>
              <img className='h-20 w-20 absolute top-[30px] right-[120px]' src={Microsoft}
                alt='seredity company partner' />
              <img className='h-20 w-20 absolute top-[30px] right-[20px]' src={Image12} alt='seredity partner company company product ' />
            </motion.div>
            <motion.div variants={scaleIn}>
              <PartnerCard product_title="GPT-4" company="Open AI" lead={true} firstimg={OpenAi} secondimg={Image2}
                content="openAI, a leading artificial intelligence research organization, has collaborated with numerous companies across various industries to leverage the power of AI and provide innovative solutions. As a partner in business, OpenAI offers its expertise and technologies to drive advancements and create value. By harnessing cutting-edge natural language processing capabilities, OpenAI can assist businesses in summarizing information effectively." />
            </motion.div>
            <motion.div variants={scaleIn}>
              <PartnerCard product_title="BING" company="Microsoft" lead={true} firstimg={Bing} secondimg={Image6}
                content="Bing, the search engine developed by Microsoft, exemplifies the successful partnership between the two entities. As a part of Microsoft's ecosystem, Bing provides users with a comprehensive search experience, while Microsoft's resources and expertise enhance its functionality. The collaboration between Bing and Microsoft offers a powerful tool for information discovery and online exploration." />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
