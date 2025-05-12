import React, { Component,useCallback,useContext,useMemo } from 'react';
import {PastPreview} from './PastPreview';

const PastPreviewList=React.memo(({context})=>{
    const {historyData}=useContext(context);

    if(historyData.length!==0){
        const renderList=historyData.map((item,i)=>{
            return(
                <PastPreview    index={i}
                                data={item}
                                context={context}
                                key={'history' + i} />
            )
        })
        
        return <>{renderList}</>;
    }else{
        return <></>
    }
});

export default PastPreviewList;