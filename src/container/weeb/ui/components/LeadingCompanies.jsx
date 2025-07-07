import React from 'react'

const LeadingCompanies = () => {
  return (
    <div className='flex flex-col justify-center items-center mt-20 mb-20'>
      <h1 className='text-white text-5xl'>Join Leading Companies</h1>
      <div className='grid grid-cols-5 gap-20 mt-8 w-max-6xl'>
        <img alt='Logo 1' src="/weeb/Logo-grey_1.svg" className='' width={110} height={50}/>
        <img alt='Logo 2' src="/weeb/Logo-grey_2.svg" className='' width={110} height={50}/>
        <img alt='Logo 3' src="/weeb/Logo-grey_3.svg" className='' width={110} height={50}/>
        <img alt='Logo 4' src="/weeb/Logo-grey_5.svg" className='' width={110} height={50}/>
        <img alt='Logo 5' src="/weeb/Logo-grey_4.svg" className='' width={110} height={50}/>
      </div>
    </div>
  )
}

export default LeadingCompanies
