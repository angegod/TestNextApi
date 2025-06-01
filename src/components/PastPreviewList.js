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
        return <></>
    }
});

export default PastPreviewList;