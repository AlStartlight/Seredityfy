import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const TestimonialsComponents = () => {
  return (
    <div className='bg-purple-950 w-full py-20'>
    <div className='grid grid-cols-1 xl:grid-cols-[33%_34%_33%] xl:max-w-6xl mx-auto'>
      <div className='flex flex-col justify-center gap-4 items-start mt-20 mb-20 xl:mr-20 mx-10'>
        <p className='text-white text-sm'>CUSTOMERS</p>
        <h1 className='text-white md:text-5xl text-3xl'>BigApp got to the next level</h1>
            <Link to="/contact" className='hidden md:flex'>
              <span className="hidden md:inline-flex group text-sm relative -ml-6  items-center  text-white px-6 py-2 mt-6 rounded-xl pointer-events-none group-hover:pointer-events-auto ">
               View Case Study <ArrowRight className="ml-2 w-5 h-5" color='white' />
              </span>
            </Link>
      </div>
      <div>
        <img alt='...' src="/weeb/Mobile.jpeg" className='relative top-10 xl:-left-10 object-cover' width={1000} height={1000}/>
      </div>
      <div className="flex flex-col justify-center gap-4 items-start mt-20 mx-10 md:mx-0 ">
        <p>
            &quot;Viverra viverra nibh enim et aliquam, enim. Tempor, sit mus viverra orci dui consequat turpis scelerisque faucibus&quot;
        </p>
        <div className='flex flex-row justify-center gap-4 items-start  mb-20'>
            <img alt='...' src="/weeb/User-Thumb.svg" className='relative ' width={50} height={50}/>
            <div className='flex flex-col justify-center gap-1 items-start '>
                <p className='text-white text-sm'>Rwanda Bigpop</p>
                <p className='text-gray-300 text-sm w-full'>
                    co-founder Bigpop
                </p>
            </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default TestimonialsComponents
