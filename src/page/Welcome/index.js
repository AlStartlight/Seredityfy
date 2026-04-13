'use client';
import React, { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Possibility } from '@/src/container/welcome/Possibility.js';
import { Partner } from '@/src/container/welcome/Partner.js';
import { Footer } from '@/src/components/Footer.js';
import { Loader } from '@/src/components/Loader/index.js';
import { pageTransition } from '@/src/animations/variants.js';
const Obsviewsly = lazy(() => import('@/src/container/welcome/Obsviewsly.js'));
const Seredity = lazy(() => import('@/src/container/welcome/Seredity.jsx'));

export const Welcome = () => {
    return (
        <motion.div
            className='bg-gradient-60 from-slate-950 via-gray-800 to-fuchsia-900 max-h-full h-full'
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <Suspense fallback={<Loader />}>
                <Seredity />
                <Obsviewsly />
                <Possibility />
                <Partner />
                <Footer />
            </Suspense>
        </motion.div>
    )
}
