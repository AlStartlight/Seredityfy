import React from 'react'
import { Link } from 'react-router-dom'

const HeroPages = () => {
  return (
    <div className='mt-28 flex flex-col justify-center items-center'>
    <h1 className="max-sm:hidden block text-4xl md:text-6xl font-extrabold text-center text-gray-200">
      Design Generative<br className='pb-5'/> <span className="underline decoration-purple-500 mt-5">Faster</span> <span className="text-purple-700 mt-5">&</span> <span className="overline decoration-purple-500">Better</span>
    </h1>
    <h1 className="max-sm:block hidden text-5xl md:text-6xl font-extrabold text-center text-gray-200">
      Design <span>Faster</span> <br/> <span className="text-purple-700">&</span> <span className="overline decoration-purple-500 ">Better</span>
    </h1>
    <p className='text-gray-300 text-center mt-4 mx-auto max-w-2xl'>
        Design Generative empowers creatives, designers, and innovators to craft stunning visual concepts faster and better through the power of AI-driven image generation. Leveraging the advanced capabilities of Sereditify, our proprietary AI generative engine, users can instantly turn ideas into high-quality, futuristic, and elegant visuals with minimal effort
    </p>
    <div className='flex flex-row justify-center items-center gap-4 mt-8'>
        <Link to="/join" className="group text-md relative inline-flex items-center  text-white bg-purple-600 px-6 py-2 rounded-sm  shadow pointer-events-none group-hover:pointer-events-auto">
            Join Now
        </Link>
        <Link to="/demo" className="group text-md relative inline-flex items-center border-2   text-white  px-6 py-2 rounded-xl  shadow pointer-events-none group-hover:pointer-events-auto">
            View Demo
        </Link>
    </div>

        <div className='flex flex-col justify-center items-center mt-8'>
            <img src="/weeb/Imagegenerative.png" alt="hero" width={1000} height={500} className='w-full max-w-5xl h-[59vh]' />
        </div>
     </div>
  )
}

export default HeroPages
