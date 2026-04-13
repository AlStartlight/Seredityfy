'use client';
import React, { Suspense } from 'react'
import { Navbar } from '@/src/components/Navbar'
import { PriceApp } from '@/src/container/Price'
import { Footer } from '@/src/components/Footer'
import { Loader } from '@/src/components/Loader'

export const Price = () => {

  return (
    <div className='dark:bg-gradient-to-r bg-gradient-75 from-slate-950 via-purple-950 to-blue-950 w-full h-fit'>
      <Suspense fallback={<Loader/>}>
        <Navbar type='update' />
        <PriceApp />
        <Footer />
      </Suspense>
    </div>
  )
}
