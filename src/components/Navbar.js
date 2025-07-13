import React, { useEffect, useState, useRef } from 'react'
import { Logo } from '../assets/import';
import { useNavigate } from 'react-router-dom';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import { gsap } from 'gsap';

export const Navbar = ({ type = '' }) => {
    const navigate = useNavigate();
    const [toggle, setToggle] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClickRegister = () => {
        navigate('/signup');
        navigate(0)
    }
    const handleScoll=(type)=>{
        if(isScrolled){
            return 'white'
        }
        return type == 'update' ? 'grey' : 'grey-300';
    }
    return (
        <nav
            ref={navRef}
            className={`${isScrolled ? 'bg-slate-900' : 'bg-gray-800 bg-opacity-20 backdrop-blur-lg'} py-5 ${isScrolled ? 'fixed top-0' : ''} w-full z-50 transition duration-500 ease-in-out ${isScrolled ? 'scrolled' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 mx-auto">
                    <div className="flex-shrink-0">
                        <a href="#" className="text-white font-bold text-xl justify-between flex"> <img src={Logo} className='w-6 h-6 mr-4' alt={`${Logo} seredityfy `} /> <span>Seredityfy</span></a>
                    </div>
                    <div className='block md:hidden'>
                        {
                            toggle ?
                                <RiCloseLine color={`${handleScoll(type)}`} size={27} onClick={() => setToggle(false)} />
                                :
                                <RiMenu3Line color={`${handleScoll(type)}`} size={27} onClick={() => setToggle(true)} />
                        }
                    </div>
                    <div className="hidden md:block  ">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
                            <a href="/features" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Features</a>
                            <a href="/update" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Update</a>
                            <a href="/price" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Price</a>
                            <div className="p-0.5 rounded bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-fuchsia-500">
                                <button className="px-6 py-2 text-white bg-gray-800 bg-opacity-90 backdrop-blur-xl text-xs" onClick={() => handleClickRegister()}>Sign Up</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {
                toggle && <div className='pt-2 px-2 pb-[1000px] absolute top-0 right-0 bg-black xs:z-40 w-screen h-fit  items-center mx-auto transform after:translate-y-4 before::translate-y-6
                transition duration-500 ease-in-out'>
                    <div className='flex flex-row justify-between items-center gap-8 p-2'>
                        <a className='p-2  rounded-md  cursor-pointer'>
                            <img src={Logo} className='w-6 h-6 mr-4' alt={`${Logo} seredityfy `} />
                        </a>
                        <button
                            className=" md:ml-auto text-white mr-2  bg-slate-900 p-2 rounded-full"
                            onClick={() => setToggle(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col items-start lg:items-stretch py-10 px-10 lg:py-0 lg:mx-20 mt-[2px] lg:w-3/12 lg:h-[540px] lg:mb-[100px] bg-opacity-60 backdrop-blur-md shadow-sm  ">
                        <a href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white py-4 rounded-md text-xl font-bold tracking-widest">Home</a>
                        <a href="/features" className="text-gray-300 hover:bg-gray-700 hover:text-white py-4 rounded-md text-xl font-bold tracking-widest">Features</a>
                        <a href="/update" className="text-gray-300 hover:bg-gray-700 hover:text-white py-4 rounded-md text-xl font-bold tracking-widest">Update</a>
                        <a href="/price" className="text-gray-300 hover:bg-gray-700 hover:text-white py-4 rounded-md text-xl font-bold tracking-widest">Price</a>
                        <button className="w-full py-6 mt-20 text-white border border-fuchsia-600 bg-gradient-to-br bg-gray-800 bg-opacity-90 backdrop-blur-xl text-xl" onClick={() => handleClickRegister()}>Sign Up</button>
                    </div>
                </div>
            }

        </nav>
    )
}

//bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-fuchsia-100