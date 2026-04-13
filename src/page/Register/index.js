'use client';
import React from 'react'
import { Navbar } from '@/src/components/Navbar'
import { Footer } from '@/src/components/Footer'
import SignUP from '@/src/container/SIignUP'

const Register = () => {
  return (
    <div className='bg-white dark:bg-gradient-to-br bg-gradient-75 from-slate-950 via-purple-950 to-blue-950'>
        <Navbar type='update'/>
        <SignUP/>
        <Footer/>
    </div>
  )
}

export default Register