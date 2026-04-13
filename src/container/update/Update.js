'use client';
import React from 'react'
import { Dragons } from '@/src/assets/import'
import { Navbar } from '@/src/components/Navbar'
import { UpdatersRoadMap } from '@/src/components/UpdatersRoadMap'
import { Footer } from '@/src/components/Footer'
const Updates = () => {
  return (
    <div className='bg-blue-950 flex flex-1 flex-col h-fit'>
      <div
        className='flex flex-col flex-1 bg-cover bg-center h-fit'
        style={{ backgroundImage: `url(${Dragons})` }}
      >
        <Navbar type={'update'}/>
        <UpdatersRoadMap />
      </div>
    </div>
  )
}
export default Updates;
