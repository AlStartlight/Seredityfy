'use client';
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { dataPlatform } from '@/src/model/dummyFeatures'
import { fadeInUp, staggerContainer } from '@/src/animations/variants'

export const ExpandPlatform = () => {
    const headingRef = useRef(null);
    const cardsRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: '-100px' });
    const cardsInView = useInView(cardsRef, { once: true, margin: '-100px' });

    return (
        <div className='flex flex-col bg-opacity-70 pt-10 xl:w-full xl:h-screen xl:pt-40'>
            <motion.div
                ref={headingRef}
                className='flex flex-col items-center'
                variants={fadeInUp}
                initial="hidden"
                animate={headingInView ? 'visible' : 'hidden'}
            >
                <h1 className='text-white font-extrabold text-3xl tracking-wider xl:text-4xl'>Platform Support</h1>
            </motion.div>
            <div className='flex flex-col items-center p-5 xs:p-10 xl:p-16'>
                <motion.div
                    ref={cardsRef}
                    className='flex flex-wrap justify-center -mx-2 gap-4'
                    variants={staggerContainer}
                    initial="hidden"
                    animate={cardsInView ? 'visible' : 'hidden'}
                >
                    {
                        dataPlatform.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="max-w-xs bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                            >
                                <a href="#">
                                    <img className="rounded-t-lg h-56 w-56" src={item.url} alt="" />
                                </a>
                                <div className="p-5">
                                    <a href="#">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{item.platform}</h5>
                                    </a>
                                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{item.SupportKarnelVersion}-{item.SupportVersion}</p>
                                    <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Read more
                                        <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                        </svg>
                                    </a>
                                </div>
                            </motion.div>
                        ))
                    }
                </motion.div>
            </div>
        </div>
    )
}
