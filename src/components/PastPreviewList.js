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

export default PastPreviewList;