import React,{useEffect,useRef} from 'react'
import { fadeInUp } from '../../../../utils/gsapAnimations'

const PowerfullTools = () => {
  const cardRef = useRef(null);
    useEffect(() => {
      fadeInUp(cardRef.current);
    }, []);
  return (
    <div className='grid grid-cols-1 md:grid-cols-[40%_60%] max-w-5xl md:mx-20 mx-10'>
      <div ref={cardRef} className='flex flex-col order-2 md:order-1 justify-center gap-4 items-start mt-40 mb-20'>
        <p className='text-white text-sm'>POWERFULL</p>
        <h1 className='text-white md:text-5xl text-3xl'>All the tools you can imagine</h1>
        <p className='text-gray-300 text-sm md:w-[75%] w-full'>Scelerisque auctor dolor diam tortor, fames faucibus non interdum nunc.
          Ultrices nibh sapien elit gravida ac, rutrum molestie adipiscing lacinia.</p>
      </div>
      <img ref={cardRef} alt='...' src="/weeb/Limbic.png" className='relative top-20 order-1 md:order-2' width={1000} height={500}/>
    </div>
  )
}

export default PowerfullTools
