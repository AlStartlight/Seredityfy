'use client';
import React from 'react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import Login from '@/src/container/Login';

const LoginPage = () => {
  return (
    <div className='bg-white dark:bg-gradient-to-br bg-gradient-75 from-slate-950 via-purple-950 to-blue-950'>
        <Navbar type='update'/>
        <Login/>
        <Footer/>
    </div>
  );
};

export default LoginPage;
