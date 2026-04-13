import React from 'react'
import { Back } from '@/src/assets/import'
import { dataSetUpdates } from '@/src/model/UpdateModels'
const UpdateCard = ({ icons, title, heading, headingContent, firstListText, secondListText, isDetail,keys,headerDetail,ContentDetail,iconsContent,Authoricons }) => {
    return (
        <div key={keys} className='mt-4 mr-2 md:mr-6 items-center'>
            <div className='h-[0.2px] lg:mr-6  bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600  w-4/6 self-center ml-24' />
            <div className='py-6 items-center bg-blue-950  bg-opacity-30  rounded-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] justify-center  backdrop-blur-3xl'>
                <div className='flex flex-row w-11/12'>
                    <div className='flex flex-col items-center mr-2 md:mr-10'>
                        <div>
                            <img src={icons} className='w-30 h-30 ' alt="safe partice button" />
                        </div>
                        {
                            keys===dataSetUpdates.length-1? null : <div className='-z-10 w-[0.1px] h-full bg-slate-500 absolute ' />
                        }
                    </div>
                    <div className='w-full'>
                        <h1 className='text-white text-sm md:text-lg leading-4 font-bold my-4'>{title}</h1>
                        <h5 className='text-blue-300 text-xs md:text-sm my-2 '>{heading} <span className='text-slate-400 text-sm '>{headingContent}</span></h5>
                        <ul className='list-disc ml-4 mb-4'>
                            <li className='text-gray-400 text-xs'>{firstListText}</li>
                            <li className='text-gray-400 text-xs '>{secondListText}</li>
                        </ul>
                        {
                            isDetail &&
                            <>
                             <div className='py-2 items-center bg-gradient-to-r from-blue-950 via-1% via-blue-950 to-1% to-zinc-950 bg-opacity-30  rounded-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] justify-center  backdrop-blur-3xl'>
                                <div className='p-10'>
                                    <h5 className='text-md text-white mb-4'>{headerDetail}</h5>
                                    <p className='text-xs text-gray-400  mb-4'>{ContentDetail}</p>
                                    <div className='flex flex-row mb-4 items-center'>
                                        <img src={iconsContent} className='w-10 h-10' alt="creator logo"/>
                                        <p className='text-sm text-white ml-2'>{Authoricons}</p>
                                    </div>
                                    <button className='p-2 flex flex-row items-center bg-blue-800  bg-opacity-30  rounded-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] justify-center  backdrop-blur-3xl'>
                                        <img src={Back} className='h-4 w-4'/>
                                        <p className='text-white text-xs ml-2'>Explore Feature</p>
                                    </button>
                                </div>

                             </div>
                            
                            </>
                        }
                    </div>
                </div>
            </div>

        </div>
    )
}

export default UpdateCard