'use client';
import React, { Suspense, lazy } from 'react'
import { Loader } from '@/src/components/Loader';
import { Footer } from '@/src/components/Footer';
const Updates = lazy(() => import('@/src/container/update/Update'));
export const Update = () => {
    return (
        <div className='bg-gradient-60 from-slate-950 via-gray-800 to-fuchsia-900 h-fit'>
            <Suspense fallback={<Loader/>}>
                <Updates />
                <Footer/>
            </Suspense>
            <div>Update</div>
        </div>
    )
}
