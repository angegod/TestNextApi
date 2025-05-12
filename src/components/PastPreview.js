import React, { useContext } from 'react';
import '../css/simulator.css';


//簡易瀏覽
const PastPreview=React.memo(({index,data,context})=>{
    const {checkDetails,updateHistory,isChangeAble} = useContext(context);
    const hue = data.expRate * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;
    const BaseLink =  `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;
    
    
    return(
        <div className='flex flex-row flex-wrap w-[300px] max-h-[120px] bg-slate-700 rounded-md p-2 m-2 max-[400px]:w-[95%] max-[400px]:!flex-nowrap'>
            <div className='flex flex-col mr-3'>
                <div>
                    <img src={BaseLink} alt='iconChar' className='w-[70px] rounded-[50px] max-[400px]:min-w-[50px] max-[400px]:w-[50px]'/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.avgRank.color}} className='font-bold text-xl max-[400px]:text-lg'>{data.avgScore}</span>
                </div>
            </div>
            <div className='flex flex-col'>
                <div className='flex flex-row [&>span]:text-white justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>查詢日期:</span>
                    <span className='pl-1'>{data.calDate}</span>
                </div>
                <div className='flex flex-row [&>span]:text-white justify-start '>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>玩家UID:</span>
                    <span className='pl-1'>{data.userID}</span>
                </div>
                <div className='flex flex-row [&>span]:text-white justify-start '>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>平均期望:</span>
                    <span className='pl-1'>{data.avgRate}%</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='deleteBtn px-1' onClick={()=>updateHistory(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>        
    )

    
    
});


//簡易瀏覽_模擬器版本
const PastPreview_simulator=React.memo(({data,index,context})=>{
    const {checkDetails,updateHistory,isChangeAble} = useContext(context);
    const hue = data.expRate * 120;
    
    const textColor =`hsl(${hue}, 100%, 50%)`;
    let BaseLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;

    return(<>
        <div className='flex flex-row flex-wrap w-[300px] max-h-[120px] bg-slate-700 rounded-md p-2 m-2 max-[400px]:w-[95%] max-[400px]:flex-nowrap'>
            <div className='flex flex-col mr-3'>
                <div>
                    <img src={BaseLink} alt='iconChar' className='w-[70px] min-w-[] rounded-[50px] max-[400px]:w-[50px]'/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.rank.color}} className='font-bold text-xl'>{data.score}</span>
                </div>
            </div>
            <div className='flex flex-col '>
                <div className='[&>span]:text-white flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>部位:</span>
                    <span>{data.part}</span>
                </div>
                <div className='[&>span]:text-white flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>主詞條:</span>
                    <span>{data.mainaffix}</span>
                </div>
                <div className='[&>span]:text-white flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>期望機率:</span>
                    <span style={{color:textColor}} className='pl-1 font-bold'>{(data.expRate*100).toFixed(1)}%</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='deleteBtn px-1 ' onClick={()=>updateHistory(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>
    
    </>)
})

export {PastPreview,PastPreview_simulator};