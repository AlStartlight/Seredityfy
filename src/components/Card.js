import React, { useEffect, useRef } from 'react'
import { Search } from '../assets/import'
import { fadeInUp } from '../utils/gsapAnimations'
function Card({ img, title, sub, content, imgicons }) {
    const cardRef = useRef(null);
    useEffect(() => {
        fadeInUp(cardRef.current);
    }, []);
    return (
        <div ref={cardRef} className='max-w-xs border border-gray-700 bg-opacity-70 backdrop-blur-md rounded-lg shadow bg-gray-800 dark:bg-gray-800 dark:border-gray-700 justify-center items-center mb-4 md:mb-0 transition-transform duration-500 ease-out hover:scale-105 hover:shadow-2xl'>
            <img src={img} className='w-100 h-54 rounded-t-lg' alt="seredityfy ai image generator"/>
            <a className='absolute right-2 z-10 bottom-[226px] cursor-pointer'><img src={imgicons} className='w-16 h-16' /></a>
            <div className='px-6  pb-6 pt-2 inset-y-0 mt-[-30px] bg-slate-700 bg-opacity-30 backdrop-blur-sm' >
                <h2 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{title}</h2>
                <h4 className='mb-3 font-normal text-gray-200'>{sub}</h4>
                <p className='text-gray-400 text-sm'>{content}</p>
            </div>
                <button className='my-4 m-20 flex px-4 py-2 items-center align-middle self-center   rounded-md text-white w-3/6 bg-gradient-to-tr from-slate-600  from-0% via-slate-800 to-slate-600'>
                    <img src={Search} className='h-4 w-4 mr-2' alt={`${Search} icons`}/> Explore Now
                </button>
        </div>
    )
}

export default Card