import React, { Component,useCallback,useContext,useMemo } from 'react';
import {PastPreview} from './PastPreview';
import SiteContext from '../context/SiteContext';

const PastPreviewList=React.memo(()=>{
    const {historyData}=useContext(SiteContext);

    if(historyData.length!==0){
        const renderList=historyData.map((item,i)=>{
            return(
                <PastPreview    index={i}
                                data={item}
                                key={'history' + i} />
            )
        })
        
        return <>{renderList}</>;
    }else{
        return (
            <div>
                <span>這裡沒有任何您操作過的紀錄。</span>
            </div>
        )
    }
});


//歷史紀錄清單
const PastPreviewList_simulator=React.memo(()=>{
    const {historyData} = useContext(SiteContext);

    if(historyData&&historyData.length>0){
        return(
            historyData.map((item,i)=>
                <PastPreview index={i} 
                            data={item}    
                            context={SiteContext}
                            key={'historyData'+i}/>
            )
        )
    }else{
        return (
                <div className='flex flex-col'>
                    <span className='text-stone-300'>這裡沒有任何操作過的紀錄!!</span>
                    <span className='text-stone-300'>在開始使用前不妨看看下面簡單的Q&A</span>
                </div>
        )
    }
});


export {PastPreviewList,PastPreviewList_simulator};