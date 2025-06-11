"use client";
import AffixList from '../../data/AffixList';
import characters from '../../data/characters';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import '../../css/simulator.css';
import '@/css/intro.css';
import AffixName from '@/data/AffixName';

import Result from '@/components/Result';
import { StandDetails ,ShowStand } from '@/components/StandDetails';
import { RelicData_simuldate as RelicData} from '@/components/RelicData';
import { PastPreviewList_simulator } from '@/components/PastPreviewList';
import { PastPreview_simulator as PastPreview } from '@/components/PastPreview';
import { CharSelect,PartSelect,StandardSelect,MainAffixSelect,SubAffixSelect } from '@/components/Select';
import SubAffixHint from '@/components/Hint/SubAffixHint';
import HintSimulator from '@/components/Hint/HintSimulator';
import { Tooltip } from 'react-tooltip';

import SiteContext from '@/context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';

//遺器強化模擬器
function Simulator(){
    //版本代號
    const version="1.3";

    const maxHistoryLength = 6;

    //部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState();
    
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [statusMsg,setStatusMsg]=useState(undefined);
    const [processBtn,setProcessBtn]=useState(true);
    const standDetails=useRef([]);

    const SubData=useRef([]);
    const [charID,setCharID]=useState(undefined);
    const [PieNums,setPieNums]=useState(undefined);

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);

    //模擬強化相關數據
    const [simulatorData,setSimulatorData]=useState({});

    //共用statusMsg
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    //找到的遺器
    const [relic,setRelic]=useState();

    //歷史紀錄
    const historyData=useRef([]);
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Ball 位面球','Rope 連結繩'];
    
    //是否可以儲存(防呆用)、是否可以立馬變更
    const [isSaveAble,setIsSaveAble]=useState(false);
    const [isChangeAble,setIsChangeAble]=useState(true);

    const pathname = usePathname();

    useEffect(()=>{
        init();
    },[pathname]);

    useEffect(() => {
        if(partsIndex!==undefined&&Number.isInteger(partsIndex)){
            let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
            const targetAffix = range[0];
            setMainSelectOptions(targetAffix); 
        }
    }, [partsIndex]); 

    function init(){

        SubData.current=[];
        for(var i=0;i<=3;i++){
            let data={
                index:i, 
                subaffix:0,//詞條種類
                data:0, //詞條數值
                count:0 //強化次數
            }

            SubData.current.push(data);
        }
        
        let history=JSON.parse(localStorage.getItem('HistoryData'));

        if(!history) return;
        showStatus('正在載入過往紀錄中......');
        
        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        
        if(history!=null&&history.length>0){
            history=history.filter((h)=>h.version===version);
            localStorage.setItem('HistoryData',JSON.stringify(history));
            historyData.current=history;
            updateStatus('先前紀錄已匯入!!','success');
        }else{
            updateStatus('尚未有任何操作紀錄!!','default');
        }
    }

    //刪除過往紀錄
    function updateHistory(index){
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        historyData.current=historyData.current.filter((item,i)=>i!==index);
        showStatus('正在處理中......');
        //強制觸發刷新紀錄
        setTimeout(() => {
            updateStatus('成功刪除該紀錄!!','success')
        }, 0);
        localStorage.setItem('HistoryData',JSON.stringify(historyData.current));
    }
    //清除相關資料
    function clearData(){
        setExpRate(undefined);
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic(undefined);
    }

    //儲存紀錄
    function saveRecord(){
        let partName=partArr[partsIndex-1];
        let selectChar=characters.find((c)=>c.charID===charID);

        //如果目前則沒有紀錄 則初始化
        if(!historyData.current)
            historyData.current=[];
        else if(historyData.current.length>=maxHistoryLength)//如果原本紀錄超過6個 要先刪除原有紀錄
            historyData.current=historyData.current.filter((item,i)=>i!==0);
        
        //如果當前沒有任何資料則不予匯入
        if(!PieNums||ExpRate===undefined||!Rrank||Rscore===undefined){
            updateStatus('當前沒有任何數據，不予儲存!!','error');
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            updateStatus("沒有選擇任何腳色!!",'error');
            return;
        }
        
        //將部位資料丟進遺器資料中
        let savedRelic = relic;
        savedRelic.type=parseInt(partsIndex);

        //儲存紀錄
        let data={
            version:version,
            char:selectChar,
            part:partName,
            mainaffix:MainSelectOptions,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums,
            stand:standDetails.current,
            relic:relic
        };

        //利用深拷貝區分原有資料
        let oldHistory=JSON.parse(JSON.stringify(historyData.current));
        historyData.current.push(data);
        updateStatus("已儲存",'success');
        const targetElement = document.getElementById('historyData');
        targetElement.scrollIntoView({ behavior: 'smooth' });
        

        //將歷史紀錄合併至緩存數據中
        oldHistory.push(data);
        localStorage.setItem('HistoryData',JSON.stringify(oldHistory));
        setIsSaveAble(false);
    }

    //檢視過往紀錄
    function checkDetails(index){
        let data=historyData.current[index];
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score);
        updateStatus('資料替換完畢!!','success');
        setPieNums(data.pieData);
        standDetails.current=data.stand;
        setRelic(data.relic);

        //清空模擬強化紀錄
        setSimulatorData({});

        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        })
    }

    //整合並儲存遺器資訊
    function saveRelic(){
        let data={
            main_affix:MainSelectOptions,
            subaffix:[]
        }

        SubData.current.forEach((s,i)=>{
            if(!['生命值','攻擊力','防禦力','速度'].includes(s.subaffix))
                s.display=s.data+'%';
            else
                s.display=s.data;
        })
        data.subaffix=SubData.current;
        data.type = parseInt(partsIndex);

        setRelic(data);
    }

    

    //計算遺器分數等細節
    function calScore(){
        //先驗證選擇是否有誤
        //副詞條是否有空值?
        //副詞條是否有跟主詞條重複?
        let errors=false;
        console.log(SubData.current);
        SubData.current.some((s,i)=>{
            if(s.subaffix===MainSelectOptions){
                //alert(`第${i+1}個詞條選擇\n副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`);
                updateStatus(`第${i+1}個詞條:副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
            else if(s.subaffix==='undefined'||s.subaffix===0){
                updateStatus(`您還有副詞條沒有選擇\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
        })

        if(errors) return;
        //輸入的副詞條之間是否重複?
        const seen = new Set();
        for (const obj of SubData.current) {
            if (seen.has(obj['subaffix'])) {
                alert(`副詞條之間不可以選擇重複\n請再重新選擇!!`);
                errors=true;
                return;
            }
            seen.add(obj['subaffix']);
        }

        //檢查標準是否合法
        selfStand.forEach((s)=>{
            if(s.value===''){
                errors=true;
                alert('加權指數不可為空或其他非法型式');
            }
                
        })

        if(errors) return;

        //如果篩選有速度詞條 需給予0.5誤差計算 
        let deviation=(SubData.current.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
        SubData.current.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        })
        
        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../../worker/worker.js', import.meta.url));
        let postData={
            charID:charID,
            MainData:MainSelectOptions,
            SubData:SubData.current,
            partsIndex:partsIndex,
            standard:selfStand,
            deviation:deviation
        };

        //將按鈕disable
        setIsSaveAble(false);
        setProcessBtn(false);
        setIsChangeAble(false);
        showStatus('數據計算處理中!!');
        clearData();
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            updateStatus('計算完畢!!','success');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            saveRelic();
            standDetails.current=selfStand;
            
            //恢復點擊
            setProcessBtn(true);
            setIsSaveAble(true);
            setIsChangeAble(true);
            //將視窗往下滾
            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            })

            //清空強化紀錄
            setSimulatorData({});
        };
    }

    //模擬強化
    function simulate(){
        let isCheck=true;
        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../../worker/worker.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.name===relic.main_affix);
        let SubData=[];

        relic.subaffix.forEach((s,i)=>{
            let typeName=AffixName.find((a)=>a.name===s.subaffix);
           
            let data={
                index:i, 
                subaffix:typeName.name,
                data:s.data, //詞條數值    
                count:s.count//強化次數
            }

            SubData.push(data);
        });

        //檢查標準是否合法
        selfStand.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
                updateStatus('加權指數不可為空或其他非法型式','error');
            }
        });
        
        //如果篩選有速度詞條 需給予0.5誤差計算 
        /*let deviation=(SubData.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
        SubData.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        })*/

        //制定送出資料格式
        let postData={
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:relic.type,
            standard:standDetails.current,
            deviation:0.5
        };
        
        if(isCheck){
            worker.postMessage(postData);

            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {
                setSimulatorData({
                    oldData:{
                        relicscore:Rscore,
                        relicrank:Rrank,
                        returnData:SubData
                    },
                    newData:event.data
                });
                requestAnimationFrame(()=>{
                    window.scrollTo({
                        top: document.getElementById('enchant').offsetTop,
                        behavior: 'smooth'
                    });
                })
                
            };
        }
        
        //將送出按鈕設為可用
        setIsChangeAble(true);
    }


    let SimulatorStatus = {
        charID:charID,
        standDetails:standDetails.current,
        partArr:partArr,
        historyData:historyData.current,
        isChangeAble:isChangeAble,
        selfStand:selfStand,
        partsIndex:partsIndex,
        MainSelectOptions:MainSelectOptions,
        SubData:SubData,
        simulatorData:simulatorData,
        Rrank:Rrank,
        Rscore:Rscore,
        relic:relic,


        updateHistory:updateHistory,
        checkDetails:checkDetails,
        simulate:simulate,

        setCharID:setCharID,
        setIsChangeAble:setIsChangeAble,
        setIsSaveAble:setIsSaveAble,
        setSelfStand:setSelfStand,
        setPartsIndex:setPartsIndex,
        setMainSelectOptions:setMainSelectOptions,
        setStatusMsg:setStatusMsg
    }
    
    return(
    <SiteContext.Provider value={SimulatorStatus}>
        <div className='w-4/5 mx-auto max-[600px]:w-[90%] flex flex-row flex-wrap'>
            <div className='flex flex-col  bg-[rgba(0,0,0,0.5)] p-1 rounded-md'>
                <div className='flex flex-row items-center'>
                    <h1 className='text-red-600 font-bold text-2xl'>遺器重洗模擬器</h1>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="SimulatorHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='flex flex-row flex-wrap'>
                    <div className='flex flex-row flex-wrap w-1/2 max-[1200px]:w-[100%]'>
                        <div className='flex flex-col mt-2'>
                            <div className='flex flex-row [&>*]:mr-2 my-3 items-center max-[400px]:!flex-col max-[400px]:items-start'>
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Characters 腳色:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <CharSelect />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`my-1 ${(Number.isInteger(charID)&&charID!==undefined)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col max-[400px]:items-start`}>
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Parts 部位:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <PartSelect />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="PartSelectHint">
                                        <span className='text-white'>?</span>
                                    </div>   
                                </div>
                            </div>
                            <div className={`my-1 ${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[400px]:items-start max-[400px]:!flex-col`}>
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Main 主屬性:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <MainAffixSelect />
                                    <div className={`hintIcon ml-1 overflow-visible ${(parseInt(partsIndex)!==1&&(parseInt(partsIndex)!==2)?'':'hidden')}`} data-tooltip-id="MainAffixHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`my-1 ${(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'&&partsIndex!==undefined)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[600px]:!flex-col max-[600px]:text-center max-[400px]:text-left`}>
                                <div className='text-right w-[200px] max-[600px]:w-[100%] max-[600px]:text-center max-[400px]:text-left'>
                                    <span className='text-white'>SubAffix 副屬性:</span>
                                </div>
                                <div className='flex flex-row items-start justify-center'>
                                    <div className='flex flex-col'>
                                        <SubAffixSelect index={0} />
                                        <SubAffixSelect index={1} />
                                        <SubAffixSelect index={2} />
                                        <SubAffixSelect index={3} />
                                    </div>
                                    <div className='hintIcon ml-1 mt-1 overflow-visible'data-tooltip-id="SubAffixHint">
                                        <span className='text-white'>?</span>
                                    </div>  
                                </div>
                            </div>
                            <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col ${(partsIndex===undefined)?'hidden':''}`}>
                                <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Affix 有效詞條:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <StandardSelect />
                                </div>
                            </div>
                            <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`} >
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Params 參數:</span>
                                </div>
                                <ShowStand />
                            </div>
                            <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 mb-2 max-w-[400px] flex flex-row [&>*]:mr-2 justify-end max-[400px]:justify-start`}>
                                <div className='flex flex-row mt-1'>
                                    <button className='processBtn mr-2 whitespace-nowrap' 
                                        onClick={()=>calScore()} 
                                        disabled={!processBtn}>計算分數</button>
                                    <button className='processBtn mr-2 whitespace-nowrap' 
                                    onClick={()=>saveRecord()} disabled={!isSaveAble}>儲存紀錄</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            <div className={`w-1/2 max-[1200px]:w-[100%] ml-2 bg-[rgba(0,0,0,0.5)] rounded-md p-1 h-fit`} id="historyData" >
                <div className='flex flex-row items-center'>
                    <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="HistoryHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='flex flex-row flex-wrap h-max max-h-[600px] overflow-y-scroll hiddenScrollBar max-[600px]:!flex-col max-[600px]:!flex-nowrap'>
                    <PastPreviewList_simulator />
                </div>
            </div>
            <div className={`flex flex-row my-3 flex-wrap bg-[rgba(0,0,0,0.5)] w-full p-1 ${(PieNums===undefined)?'hidden':''} rounded-md`}>
                <div className={`w-full flex flex-row flex-wrap ${(PieNums===undefined)?'hidden':''}`}>
                    <div className={`flex flex-row flex-wrap w-[18vw]  max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                        <RelicData   mode={'Simulator'} button={true}/>
                    </div>
                    <div className={`w-1/4 max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                        <StandDetails />
                    </div>
                    <div className='flex flex-row flex-wrap w-1/2 max-[700px]:w-[100%] max-[500px]:w-4/5 max-[500px]:mx-auto ' id="resultDetails">
                        <Result ExpRate={ExpRate} 
                                Rscore={Rscore} 
                                statusMsg={statusMsg} 
                                Rrank={Rrank} 
                                PieNums={PieNums}/>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <Tooltip id="CharHint"  
                    place="right-start" 
                    render={()=>
                        <div className='flex flex-col'>
                            <span className='text-white'>選擇指定腳色，可以使用中文或英文關鍵字</span>
                            <span className='text-white'>例如:Jingliu&rarr;鏡流</span>
                        </div>
                    }/>
            <Tooltip id="PartSelectHint"  
                    place="right-start" 
                    render={()=>
                        <div className='flex flex-col max-w-[230px]'>
                            <span className='text-white'>選擇遺器部位</span>
                            <span className='text-white'>"主詞條"跟"副詞條"區塊中會自動帶入該部位詞條種類</span>
                        </div>
                    }/>
            <Tooltip id="MainAffixHint"  
                    place="right-start" 
                    render={()=>
                        <div className='flex flex-col max-w-[230px] '>
                            <span className='text-white'>選擇遺器的主詞條</span>
                        </div>
                    }/>
            <Tooltip id="SubAffixHint"  
                    place="right-start" 
                    render={()=>
                        <SubAffixHint />
                    }/>
            <Tooltip id="HistoryHint"  
                place="top-center"
                render={()=>
                    <div className='flex flex-col max-w-[250px] p-1'>
                        <div>
                            <span className='text-white'>此區塊可以查看過往查詢紀錄，下面為個別功能相關簡述。</span>
                        </div>
                        <div className='mt-2 flex flex-col'>
                            <span className='text-md font-bold text-white'>檢視</span>
                            <span>可以查看曾經查詢出來的資訊、包括遺器、評分標準等</span>
                        </div>
                        <div className='mt-2 flex flex-col'>
                            <div>
                                <span className='text-md font-bold text-white'>刪除</span>
                            </div>
                            <div>
                                <span>刪除該筆紀錄</span>
                            </div>
                        </div>
                        <div className='mt-2 flex flex-col'>
                            <div>
                                <span className='text-md font-bold text-white'>注意事項</span>
                            </div>
                            <div className='flex flex-col'>
                                <span className='!text-red-500'>"過往紀錄"最多只保留6筆</span>
                                <span className='!text-yellow-500'>如果在已有6筆資料的情況再新增，則會從最舊的紀錄開始覆蓋掉</span>
                            </div>
                        </div>
                    </div>
                }/>
            <Tooltip id="RelicDataHint"  
                place="right-start"
                render={()=>
                    <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
                        <div>
                            <span className='text-white'>下方會顯示出該遺器的</span>
                        </div>
                        <ul>
                            <li>1.所屬套裝</li>
                            <li>2.主屬性</li>
                            <li>3.副屬性</li>
                            <li>4.副屬性數值</li>
                            <li>5.副屬性強化次數</li>
                        </ul>
                        <div className='mt-2'>
                            <span className='text-white'>此外下方有個重洗模擬按鈕，此功能將會帶入這個遺器的資訊進行重洗模擬</span>
                        </div>
                    </div>
                }/>
            <Tooltip id="SimulatorHint"
                    place='right-start'
                    render={()=><HintSimulator/>}
                    clickable={true}/>
            
        </div>
    </SiteContext.Provider>)
}




export default Simulator;