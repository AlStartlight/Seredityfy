import { FacebookIcon,  InstagramIcon,  LinkedinIcon,  TwitterIcon,  YoutubeIcon } from 'lucide-react'
import React from 'react'

function Footer() {
  return (
    <div className='flex flex-col'>
      <div className='grid grid-cols-1 md:grid-cols-5 gap-10 px-10 py-10 md:px-20 md:py-20 bg-white'>
        <div className='flex justify-center md:justify-start'>
          <span className='text-black text-2xl'>weeb</span>
        </div>
        <div>
          <ul className='flex flex-col gap-2 text-black text-center md:text-left'>
            <li>Product</li>
            <li>Pricing</li>
            <li>Overview</li>
            <li>Browse</li>
            <li>Accessbility <span className='align-sub bg-fuchsia-100 text-fuchsia-900 text-[12px] px-1 rounded-xs'>Beta</span></li>
          </ul>
        </div>
        <div>
          <ul className='flex flex-col gap-2 text-black text-center md:text-left'>
            <li>Solutions</li>
            <li>Brainstorming</li>
            <li>Ideation</li>
            <li>Wireframing</li>
            <li>Research <span className='align-sub bg-fuchsia-100 text-fuchsia-900 text-[12px] px-1 rounded-xs'>Beta</span></li>
          </ul>
        </div>
        <div>
          <ul className='flex flex-col gap-2 text-black text-center md:text-left'>
            <li>Resources</li>
            <li>Help Centers</li>
            <li>Blog</li>
            <li>Tutorials</li>
            <li>FAQs</li>
          </ul>
        </div>
        <div>
          <ul className='flex flex-col gap-2 text-black text-center md:text-left'>
            <li>Resources</li>
            <li>Help Centers</li>
            <li>Blog</li>
            <li>Tutorials</li>
            <li>FAQs</li>
          </ul>
        </div>
      </div>
      <div className='flex flex-row bg-white justify-between md:px-20'>
        <span className='text-black text-sm '>
          @ 2023 Weeb, Inc. All rights reserved.
        </span>
        <div className='flex flex-row gap-2'>
          <YoutubeIcon size={20} className='text-black' />
          <FacebookIcon size={20} className='text-black' />
          <TwitterIcon size={20} className='text-black' />
          <InstagramIcon size={20} className='text-black' />
          <LinkedinIcon size={20} className='text-black' />
        </div>
      </div>
    </div>
  )
}

export default Footer
