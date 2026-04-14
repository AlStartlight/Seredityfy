import React from 'react'

export const NotifyComponents = ({img,titleContent,dateContent}) => {
    return (
        <div className='py-[0.5px] mb-[70px] lg:mr-6  bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 h-[0.5px]  '>
            <div className='flex  bg-gradient-to-tl py-[10px] lg:px-[1px] pr-20 from-purple-950 to-neutral-700 rounded-r-2xl '>
                <img src={img} className='w-8 h-8 my-2 ml-2' alt={`seredityfy ${img}`} />
                <div className='flex flex-col my-[1px] mb-[4px] ml-2'>
                    <h5 className='mb-0 my-[2px] font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400  via-purple-300 to-fuchsia-500 '>{titleContent}</h5>
                    <p className='text-slate-300 text-xs'>{dateContent}</p>
                </div>
            </div>
        </div>
    )
}
