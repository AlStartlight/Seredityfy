'use client';
import React from 'react'
import { useRouter, usePathname } from 'next/navigation';

export const BottomBar = () => {
    const router = useRouter();
    const path = usePathname();
    const home = 'home';
    const contact = 'contact';
    const welcome = 'welcome';
    const support = 'support';
    const _onClickHandleChange = (e) => {
        router.push(`/${e}`);
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-transparent text-white p-4 flex row-auto flex-row align-middle justify-center">
            <button className={`py-2 px-4 rounded-full ${path === '/home'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
                onClick={() => _onClickHandleChange(home)} >Home</button>
            <button className={`py-2 px-4 rounded-full ${path === '/contact'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
                onClick={() => _onClickHandleChange(contact)} >Contact</button>
            <button className={`py-2 px-4 rounded-full ${path === '/welcome'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
                onClick={() => _onClickHandleChange(welcome)} >Welcome</button>
            <button className={`py-2 px-4 rounded-full ${path === '/support'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
                onClick={() => _onClickHandleChange(support)} >Support</button>
        </div>
    )
}
