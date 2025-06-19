"use client";
import '@/css/globals.css';
// app/layout.js

import {Menu,MainMenu} from '@/components/Menu';
import Footer from '@/components/Footer'
import Head from 'next/head';

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
                <div className='min-h-[100vh] '>
                    {children}
                </div>
            </>)
        }
    };

    //判斷現在該使用哪種背景?
    let backgroundClass = "";

    if(pathname === "/"||pathname === "/TestNextApi/"){
        backgroundClass = "MainBackGround"
    }else {
        backgroundClass = "SubBackGround"
    }

    if(process.env.NODE_ENV ==='production'){
        backgroundClass += "-release";
    }

    return (
        <html lang="zh-Hant">
            <body>
                <StatusToastProvider>
                    <div className={`${backgroundClass}`}>
                        <MainContent/>
                        <Footer />
                    </div>
                </StatusToastProvider>
            </body>
        </html>
    )
}
