import React from 'react'
import UpdateCard from './Update/UpdateCard'
import { dataSetUpdates } from '@/src/model/UpdateModels'
import { NotifyComponents } from './NotifyComponents'
import { data } from '@/src/model/models'
export const UpdatersRoadMap = () => {
  return (
    <div className='flex flex-col md:flex-row justify-end w- mb-[50px]'>
  <div className='flex flex-col justify-end pb-50 md:pb-200 lg:pb-800 items-end'>
    <div className='bg-gradient-to-r from-blue-950 ml-0 to-zinc-900 mx-2 md:w-5/12'>
      <div className='pl-4 lg:pl-4 pt-10 lg:pt-20'>
        <h1 className='text-white text-3xl mb-10'>Updates</h1>
        <p className='text-white text-xs md:text-sm w-64 md:w-5/6'>
          Stay up-to-date with the latest features released on Serendityfy. Our most recent updates are now live, offering you a wide range of new features and enhancements that will enhance your experience. From sleek design changes to powerful new tools, we are continuously working to make our platform even better for you. Discover the latest updates today and take your experience to the next level!
        </p>
        <div className='flex flex-wrap '>
          {dataSetUpdates.map((item, index) => (
            <UpdateCard
              title={item.title}
              firstListText={item.firstListText}
              secondListText={item.secondListText}
              heading={item.heading}
              headingContent={item.headingContent}
              isDetail={item.isDetail}
              icons={item.icons}
              keys={index}
              Author={item.detail.Author}
              ContentDetail={item.detail.ContentDetail}
              headerDetail={item.detail.headerDetail}
              iconsContent={item.detail.iconsContent}
              Authoricons={item.detail.Author}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
    // <div className='flex flex-col md:flex-row  justify-between w-full'>
     
    //   <div className='flex flex-col justify-end pb-50 md:pb-200 lg:pb-800'>
    //     <div className='bg-gradient-to-r from-blue-950 ml-0 to-zinc-900 w-full  md:w-5/12'>
    //       <div className='pl-4 lg:pl-4 pt-10 lg:pt-20'>
    //         <h1 className='text-white text-3xl mb-10'>Updates</h1>
    //         <p className='text-white text-xs md:text-sm w-64 md:w-5/6'>
    //           Stay up-to-date with the latest features released on Serendityfy. Our most recent updates are now live, offering you a wide range of new features and enhancements that will enhance your experience. From sleek design changes to powerful new tools, we are continuously working to make our platform even better for you. Discover the latest updates today and take your experience to the next level!
    //         </p>
    //         <div className='flex flex-wrap justify-end'>
    //           {dataSetUpdates.map((item, index) => (
    //             <UpdateCard
    //               title={item.title}
    //               firstListText={item.firstListText}
    //               secondListText={item.secondListText}
    //               heading={item.heading}
    //               headingContent={item.headingContent}
    //               isDetail={item.isDetail}
    //               icons={item.icons}
    //               keys={index}
    //               Author={item.detail.Author}
    //               ContentDetail={item.detail.ContentDetail}
    //               headerDetail={item.detail.headerDetail}
    //               iconsContent={item.detail.iconsContent}
    //               Authoricons={item.detail.Author}
    //             />
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  )
}
