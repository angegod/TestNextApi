"use client";
import '@/css/globals.css';
// app/layout.js

import {Menu,MainMenu} from '@/components/Menu';
import Footer from '@/components/Footer'

import { StatusToastProvider } from '@/context/StatusMsg.js';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
    const pathname =usePathname();

    const MainContent = ()=>{
        if(pathname === '/' || pathname === '/TestNextApi/'){
            return(<MainMenu/>)
        }else{
            return(<>
                <Menu />
                <div className='min-h-[100vh]'>
                    {children}
                </div>
            </>)
        }
    }

    return (
        <html lang="zh-Hant">
            <body>
                <StatusToastProvider>
                    <div>
                        <MainContent/>
                        <Footer />
                    </div>
                </StatusToastProvider>
            </body>
        </html>
    )
}
