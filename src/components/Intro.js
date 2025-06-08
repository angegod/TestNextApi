import React, { Component } from 'react';
import '@/css/intro.css';
import Image from 'next/image';
//闡述為啥要使用這個工具 
function Intro(){
    return(
        <div className='intro p-[1rem] rounded-md [&>div]:my-1 flex flex-col w-3/5 max-[800px]:w-full'>
            <div className='flex flex-col'>
                <span className='text-lg text-red-500 font-bold'>常見Q&A</span>
                <span className='text-white'>這裡列出比較常見的三個問題，如果有其他問題也歡迎利用巴哈私訊我</span>
            </div>
            <div className='flex flex-col [&>div]:my-1'>
                <div className='flex flex-row items-center'>
                    <span className='text-md font-bold italic'>Q:甚麼是重洗?</span>
                    <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/good.png`}
                         alt="icon"
                         className="inline align-middle h-[25px] w-auto ml-1"/>
                </div>
                <div className='[&>span]:text-white flex flex-col'>
                    <span>A:崩鐵2.7版本中推出了一個道具叫<span className='text-yellow-500'>變量骰子</span></span>
                    <span className="text-md leading-tight">
                        此道具可以針對強化至滿等的五星遺器作詞條隨機重新分配的動作
                        
                    </span>

                </div>
            </div>
            <div className='flex flex-col [&>div]:my-1'>
                <div className='flex flex-row items-center'>
                    <span className='text-md font-bold italic'>Q:為啥需要重洗?</span>
                    <img    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/yulin.png`}
                            alt="Good.png" width={25} height={25}
                            className='inline'/>
                </div>
                <div>
                    <span className='text-white'>A:崩鐵的遺器沒有散件的概念，儘管說詞條配置不錯，但如果出錯套裝仍功虧一簣</span>
                    <span className='text-white flex flex-row items-center'>更何況強化結果有可能會不盡人意，這個道具就是給予每件遺器重生的機會</span>
                </div>
            </div>
            <div className="flex flex-col [&>div]:my-1 ">
                <div className='flex flex-row items-center'>
                    <span className='text-md font-bold italic'>Q:這件適合重洗嗎?</span>
                    <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/feixiao.png`}
                                 alt="Good.png" width={25} height={25}/>
                </div>
                <div className='flex'>
                    <span className='text-white'>A:這個就是為何要使用本工具了!本工具不僅可以根據你想要的詞條配置
                        <span className='text-red-500 font-bold'>計算出每件遺器所有可能的強化組合</span>
                        <span className='text-white'>以及計算出在這些組合中翻盤的機率</span>
                    </span>                   
                </div>
            </div>
        </div>
    )
}

export default Intro;