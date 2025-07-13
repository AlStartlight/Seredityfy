import React from 'react'
import { Navbar } from '../../components/Navbar'
import { AI,Union,Vector,Back } from '../../assets/import';

import { NotifyComponents } from '../../components/NotifyComponents';
import { data } from '../../model/models';

 const Seredity = () => {
    return (
        <div
            className='xl:bg-cover xl:bg-center  h-full'
            style={{ backgroundImage: `url(${AI})` }}
        >
            <Navbar />
            <div className='items-center lg:flex lg:flex-1 justify-between '>
                <div className=' flex flex-col p-4 lg:p-20 lg:w-2/4'>
                    <div className='flex flex-row  items-center '>
                        <img src={Union} className='h-2 w-2 mr-2' alt='union seredityfy' />
                        <p className='text-white text-xs'>Introduce Image Features</p>
                    </div>
                    <h2 className='py-10 leading-[52px] font-extrabold text-transparent text-6xl bg-clip-text  from-fuchsia-500   via-indigo-500  to-purple-300 bg-gradient-30'> Image With
                        Seredityfy</h2>
                    <p className='text-white text-sm w-5/6'>Discover a vibrant community of creators on Seredityfy! Connect with thousands of like-minded individuals on Discord or the web and unleash your imagination through collaborative storytelling. From vivid worlds to unforgettable characters, bring your short text descriptions to life in new and exciting ways. Join Serendipity today and embark on a journey of endless creativity!</p>
                    <div className='items-center lg:items-stretch'>
                        <button className='mt-8 flex px-4 py-2 items-center  rounded-md text-white w-3/6 lg:w-2/6  bg-gradient-to-tr from-purple-600  via-purple-800 to-violet-800'>
                        <img src={Vector} className='h-4 w-4 mr-2' alt='vector seredityfy'/> Generate Images
                        </button>
                    </div>
                </div>
                <div className='flex flex-col items-center  lg:items-stretch py-10 lg:py-0 lg:mx-20 mt-[2px] lg:w-3/12 lg:h-[540px] lg:mb-[100px]  xs:z-0 bg-orange-600 bg-opacity-10 backdrop-blur-md shadow-sm shadow-white  '>
                    <h2 className='text-white text-[20px] py-4 lg:py-6 lg:px-10  lg:text-[24px]'>Updates</h2>
                    {
                        data.map((item, index) => {
                            return (
                                <NotifyComponents  key={index} titleContent={item.title} img={item.image} dateContent={item.date} />
                            )
                        })
                    }
                    <button className='mt-5 px-6 py-[12px] flex items-center justify-center align-center rounded-md text-white text-xs  bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-400 border-fuchsia-500 border-2 bg-opacity-10 mx-20'>
                        <img src={Back} className='h-4 w-4 mr-2' alt='back icons seredityfy'/> <span>View More</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Seredity;