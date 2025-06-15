"use client"
import React, { Component } from 'react';
import "@/css/intro.css";
//闡述為啥要使用這個工具 
function Intro(){
    //之後intro頁面可能會改成json控管
    return(
        <div className='intro p-[1rem] rounded-md [&>div]:my-1 flex flex-col w-4/5 mx-auto max-[800px]:w-full'>
            <div className='flex flex-col'>
                <span className='text-2xl text-red-500 font-bold'>常見Q&A</span>
                <span className='text-white'>這裡列出比較常見的三個問題，如果有其他問題也歡迎利用巴哈私訊我</span>
            </div>
            <div className='flex flex-col [&>div]:my-1'>
                <div className='flex flex-row items-center'>
                    <span className='question'>Q:甚麼是重洗?</span>
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
                    <span className='question'>Q:為啥需要重洗?</span>
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
                    <span className='question'>Q:這件適合重洗嗎?</span>
                    <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/feixiao.png`}
                                 alt="Good.png" width={25} height={25}/>
                </div>
                <div className='flex flex-col'>
                    <span className='text-white'>A:這個就是為何要使用本工具了!本工具不僅可以根據你想要的詞條配置</span>
                    <span className='text-red-500 font-bold'>計算出每件遺器所有可能的強化組合<span className='text-white'>以及計算出在這些組合中翻盤的機率</span></span>
                                       
                </div>
            </div>
            <div className="flex flex-col [&>div]:my-1 ">
                <div className='flex flex-row items-center'>
                    <span className='question'>Q:目前變量骰子取得的管道?</span>
                    <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/feixiao.png`}
                                 alt="Good.png" width={25} height={25}/>
                </div>
                <div className='flex flex-col'>
                    <p className='text-white'>A:變量骰子的獲得方式仍相當稀少，目前僅有以下幾種管道：</p>
                    <ol className='[&>li]:text-stone-400'>
                        <li><strong className='text-amber-600'>合成獲取：</strong>消耗 3 個「自塑塵酯」可合成 1 顆變量骰子。</li>
                        <li><strong className='text-amber-600'>限時活動：</strong>官方會不定期透過活動發放，目前在 3.0 版本中曾贈送過 1 顆。</li>
                        <li><strong className='text-amber-600'>金靈兌換：</strong>可使用「旅伴金靈」兌換，1 個金靈可兌換 2 顆變量骰子。</li>
                        <li><strong className='text-amber-600'>無名客的贈禮：</strong>購買「無名客的贈禮」可額外獲得 1 顆骰子。</li>
                    </ol>                   
                </div>
            </div>
        </div>
    )
}

export default Intro;