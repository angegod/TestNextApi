import React from 'react';


function Footer(){
    return(
    <div className='bg-[rgb(40,40,40)] min-h-[10vh] pt-1 text-left'>  
        <div className='w-4/5 mx-auto flex flex-col [&>span]:text-left [&>span]:font-bold  [&>span]:my-1 py-2 '>
            <span>&copy; 2025 <a href="https://home.gamer.com.tw/profile/index.php?&owner=ange0733" className="underline">Ange</a></span>
            <span>Website created by Ange. All rights reserved.</span>
            <span>Data latest Updated at 2025/04/30</span>
        </div>
    </div>)
}

export default Footer;