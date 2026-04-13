import React from 'react'
import { withPartnerCard } from '@/src/utils/withPartnerCard'

const PartnerCard = (props ) => {
    console.log(props.lead);
    const withleadcss='w-[86px] h-10 rounded-sm m-6 bg-slate-700 align-middle justify-center items-center';
    const withFollowcss='w-16 h-10 rounded-sm m-6 bg-slate-700 align-middle justify-center items-center'
    return (
        <div className='max-w-xs items-center bg-blue-950 border border-slate-200 bg-opacity-30  rounded-lg shadow  dark:border-gray-700 justify-center  backdrop-blur-3xl '>
            <div className={props.lead?withleadcss:withFollowcss}>
                <p className='text-white p-2'>{props.product_title}</p>
            </div>
            <h2 className='text-white m-6'>{props.company}</h2>
            <p className='m-6 text-xs text-gray-300'>{props.content}</p>
            <img className='h-20 w-20 absolute top-[30px] right-[120px]' src={props.firstimg}  alt='seredity partner company'/>
            <img className='h-20 w-20 absolute top-[30px] right-[20px]' src={props.secondimg} alt='seredity partner company product'/>
        </div>
    )
}
export default withPartnerCard(PartnerCard);