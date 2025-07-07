import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
const IdeasComponents = () => {
  return (
    <div className='grid grid-cols-[70%_30%] max-w-5xl mx-20'>
      <div className='flex flex-col justify-center gap-4 items-start mt-20 mb-20'>
        <p className='text-white text-sm'>DISCOVER</p>
        <h1 className='text-white text-5xl'><span className='text-purple-600'>Unlimited</span><span className='border-0 text-red-500 h-20 w-32'></span> <span>ideas</span> for your<br/> next great projects</h1>
        <p className='text-gray-300 text-sm w-[55%]'>Scelerisque auctor dolor diam tortor, fames faucibus non interdum nunc.
          Ultrices nibh sapien elit gravida ac, rutrum molestie adipiscing lacinia.</p>
            <Link to="/contact" className='hidden md:flex'>
              <span className="hidden md:inline-flex group text-xl relative -ml-6  items-center  text-white px-6 py-2 mt-6 rounded-xl pointer-events-none group-hover:pointer-events-auto ">
                Discover ideas <ArrowRight className="ml-2 w-5 h-5" color='white' />
              </span>
            </Link>
      </div>
      <img alt='...' src="/weeb/Shapes.svg" className='relative top-20 -left-10' width={1000} height={1000}/>
    </div>
  )
}

export default IdeasComponents
