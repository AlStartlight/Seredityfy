'use client';
import React from 'react'
import { ExpandPlatform } from '@/src/container/Feature/ExpandPlatform'
import { Navbar } from '@/src/components/Navbar'
import { Footer } from '@/src/components/Footer'
import { MultiIntegration } from '@/src/container/Feature/MultiIntegration'
import WeepApps from '@/src/container/weeb/page'

export const Features = () => {
    return (
        <div className='flex-1 bg-gradient-to-r ml-0 in from-black via-emerald-950  to-black max-h-full h-full'>
            <Navbar type='update'/>
            <WeepApps/>
            {/* <MultiIntegration/>
             <ExpandPlatform />  */}
            <Footer/>
        </div>
    )
}
