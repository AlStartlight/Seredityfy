import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { fadeInUp } from '../../../../utils/gsapAnimations'

const CustomersComponents = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    fadeInUp(containerRef.current);
  }, []);

  return (
    <div ref={containerRef} className='grid grid-cols-1 md:grid-cols-[70%_30%] max-w-full md:max-w-5xl mx-4 md:mx-20 py-10 md:py-20 gap-8'>
      <div className='flex flex-col justify-center gap-4 items-center md:items-start mt-10 md:mt-20 mb-10 md:mb-20 text-center md:text-left'>
        <p className='text-white text-sm'>CUSTOMERS</p>
        <h1 className='text-white text-3xl md:text-5xl'><span className='text-purple-600'>Target</span><span className='border-0 text-red-500 h-20 w-32'></span> <span>customers </span>with<br/> our powerful AI kit</h1>
        <p className='text-gray-300 text-sm w-full md:w-[55%]'>Scelerisque auctor dolor diam tortor, fames faucibus non interdum nunc.
          Ultrices nibh sapien elit gravida ac, rutrum molestie adipiscing lacinia.</p>
            <Link to="/contact" className='hidden md:flex'>
              <span className="hidden md:inline-flex group text-sm relative -ml-6  items-center  text-white px-6 py-2 mt-6 rounded-xl pointer-events-none group-hover:pointer-events-auto ">
               How Targeting Customers Works <ArrowRight className="ml-2 w-5 h-5" color='white' />
              </span>
            </Link>
      </div>
      <img alt='...' src="/weeb/ShapesAI.svg" className='relative md:top-20 md:-left-10 w-full max-w-xs md:max-w-full mx-auto transition-transform duration-500 ease-out hover:scale-105' width={1000} height={1000}/>
    </div>
  )
}
export default CustomersComponents