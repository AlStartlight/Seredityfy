import React,{useEffect,useRef} from 'react'
import { fadeInUp } from '../../../../utils/gsapAnimations'

const SpeedComponents = () => {
  const cardRef = useRef(null);
    useEffect(() => {
      fadeInUp(cardRef.current);
    }, []);
  return (
    <div className='grid grid-cols-1 md:grid-cols-[40%_60%] max-w-5xl md:mx-20 mx-10 pb-40 pt-10'>
      <div ref={cardRef} className='flex flex-col order-2 md:order-1 justify-center gap-4 items-start mt-40 mb-20'>
        <p className='text-white text-sm'>SPEED</p>
        <h1 className='text-white md:text-5xl text-3xl'>Work fast,w/o interruptions</h1>
        <p className='text-gray-300 text-sm md:w-[75%] w-full'>Scelerisque auctor dolor diam tortor, fames faucibus non interdum nunc.
          Ultrices nibh sapien elit gravida ac, rutrum molestie adipiscing lacinia.</p>
      </div>
      <img alt='...' ref={cardRef} src="/weeb/futuristics.png" className='relative top-20 order-1 md:order-2 object-cover md:object-none' width={1000} height={500}/>
    </div>
  )
}

export default SpeedComponents
