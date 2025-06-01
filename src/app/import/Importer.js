"use client";
import React, { useEffect, useReducer , createContext } from 'react';
import characters from '../../data/characters';
import AffixName from '../../data/AffixName';
import { useState ,useRef,useCallback } from 'react';
import '../../css/simulator.css';
import axios from 'axios';
import { Tooltip } from 'react-tooltip'
import { usePathname } from 'next/navigation';

import PastPreviewList from '@/components/PastPreviewList';
import Result from '@/components/Result';
import { StandDetails, ShowStand } from '@/components/StandDetails';
import { RelicData } from '@/components/RelicData';
import { StandardSelect,   CharSelect ,RelicSelect } from '@/components/Select';

import SiteContext from '@/context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import HintImporter from '@/components/Hint/HintImporter';


function Importer(){
    //版本序號
    const version="1.4";
    const maxHistoryLength = 6;

    //玩家ID跟腳色ID
    const userID=useRef('');
    const [charID,setCharID]=useState(undefined);

    //部位代碼
    const partsIndex=7;

    //找到的遺器陣列以及目前檢視索引，預設為0
    const [relic,setRelic]=useState();
    const [relicIndex,setRelicIndex] = useState(0);
    

    //期望值、儀器分數、評級、圖表資料
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [PieNums,setPieNums]=useState(undefined);

    //找到所有遺器後計算的所有數據，包含期望值、分數等
    const [RelicDataArr,setRelicDataArr]=useState([]);
    const RelicDataArrRef = useRef(null);
    
    //共用statusMsg
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    // 定義 reducer
    const reducer = (state, action) => {
        switch (action.type) {
            case "CREATE":
                return { ...state, historyData: [...action.payload] }; // 合併狀態
            case "ADD":
                const newHistoryData = [...state.historyData]; // 創建新的陣列
                //newHistoryData.push(action.payload); // 在新陣列上 push
                console.log(newHistoryData);
                return { ...state, historyData: newHistoryData }; // 回傳新的 state
            case "LIMIT":
                return { ...state, historyData: state.historyData.filter((item, i) => i !== 0) }; // 刪除第一項
            case "DELETE":
                return { ...state, historyData: state.historyData.filter((item, i) => i !== action.payload) }; // 刪除指定項
            case "UPDATE":
                const updatedHistory = state.historyData.map((item, i) =>
                    i === action.payload.index ? { ...item, ...action.payload.newData } : item
                );
                return { ...state, historyData: updatedHistory };    
            default:
                return state;
        }
    };
    
    //歷史紀錄
    const initialState = {
        historyData: [] // 確保 historyData 預設為陣列
    };
    const [historyState,dispatchHistory]=useReducer(reducer, initialState );
    const {historyData=[]} =historyState;

    //狀態訊息
    const [statusMsg,setStatusMsg]=useState(undefined);

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);
    const standDetails=useRef([]);

    //router相關
    const pathname = usePathname();

    //元件狀態
    const [isChangeAble,setIsChangeAble]=useState(true);
    const [isSaveAble,setIsSaveAble]=useState(false);
    
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Ball 位面球','Rope 連結繩'];

    //評級標準
    const scoreStand=[
        {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
        {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
        {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
        {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
        {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
        {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
    ];

    
    useEffect(()=>{
        //初始化歷史紀錄
        initHistory();
    },[pathname]);

    //當遺器資料更新時
    useEffect(()=>{
        if(RelicDataArr.length !==0){
            //顯示第一個儀器
            setRelic(RelicDataArr[relicIndex].relic)
            setExpRate(RelicDataArr[relicIndex].ExpRate);
            setRscore(RelicDataArr[relicIndex].Rscore)
            updateStatus('資料顯示完畢',"success");
            setPieNums(RelicDataArr[relicIndex].PieNums);
            setRank(RelicDataArr[relicIndex].Rank);

            standDetails.current=RelicDataArr[relicIndex].standDetails;

            //還原至初始狀態
            setIsChangeAble(true);
        }
    },[RelicDataArr,relicIndex]);

    //當遺器被選擇時
    useEffect(()=>{
        if(relic){
            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    },[relic]);


    function initHistory(){
        
        let history=JSON.parse(localStorage.getItem('importData'));
        //先針對過往紀錄作清空

        if(history===null)return;

        showStatus('正在載入過往紀錄中......');
        

        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        history=history.filter((h)=>h.version===version);
        localStorage.setItem('importData',JSON.stringify(history));

        if(history != null && history.length > 0){
            dispatchHistory({ type: "CREATE", payload: history })
            updateStatus("先前紀錄已匯入!!","success");
            console.log(history);
        }
            
            
    }
    

    //   獲得遺器資料
    async function getRecord(sendData = undefined ,standard = undefined){
        
        let apiLink=(window.location.origin==='http://localhost:3000')?`http://localhost:5000/relic/get`:`https://expressapi-o9du.onrender.com/relic/get`;

        //如果是非更新紀錄
        if(!sendData){
            //如果UID本身就不合理 則直接返回錯誤訊息
            if (!/^\d+$/.test(userID.current)||!userID.current) { // 僅允許數字
                updateStatus("請輸入有效的UID!!",'error');
                return ;
            }

            //腳色相關防呆
            if(!charID){
                updateStatus("未選擇任何腳色!!",'error');
                return ;
            }

            if(!selfStand||selfStand.length ===0){
                updateStatus("至少選擇一項加權!!",'error');
                return ;
            }

            sendData={
                uid:userID.current,
                charID:charID,            
                partsIndex:7
            }
        }

        if(!standard)
            standard = selfStand;

        //送出之前先清空一次資料
        setIsSaveAble(false);
        showStatus('正在尋找匹配資料......');
        setIsChangeAble(false);
        clearData();

        console.log(sendData);
        await axios.post(apiLink,sendData,{
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (response)=>{
            console.log(response.data);

            switch(response.data){
                case 800:
                    updateStatus('找不到該腳色。必須要將腳色放在展示區才可以抓到資料!!','error');
                    setIsChangeAble(true);
                    break;
                case 801:
                    updateStatus('找不到該部件的遺器，如果是剛剛才更新的話建議等五分鐘再使用一次!!','error');
                    setIsChangeAble(true);
                    break;
                case 802:
                    updateStatus('該遺器等級尚未強化至滿等，請先強化至滿等後再嘗試!','error');
                    setIsChangeAble(true);
                    break;
                case 803:
                    updateStatus('該遺器非五星遺器，請選擇部位為五星強化滿等之遺器','error');
                    setIsChangeAble(true);
                    break;
                case 804:
                    updateStatus('該腳色並未穿著五星遺器！！','error');
                    setIsChangeAble(true);
                    break;
                case 810:
                    updateStatus('溝通次數太過於頻繁 請稍後再試!!','error');
                    setIsChangeAble(true);
                    break;
                case 900:
                    updateStatus('系統正在維護，請稍後再試!','error');
                    setIsChangeAble(true);
                    break;
                default:
                    await process(response.data,standard);
                    break;
            }

        }).catch((error)=>{
            console.log(error);
            if(error.response){
                if(error.response.status===429){
                    updateStatus('請求次數過於頻繁，請稍後再試!!','error');
                }else{
                    updateStatus('系統正在維護中 請稍後再試!!','error');
                }
            }else{   
                updateStatus('系統正在維護中 請稍後再試!!','error');
            }
            
            setIsChangeAble(true);
            return;
        })
    }

    async function process(relicArr,standard = undefined){
        let temparr = [];
        console.log(standard);

        //檢查加權標準
        standard.forEach((s)=>{
            if(s.value===''){
                updateStatus('加權指數不可為空或其他非法型式','error');
                return;
            }
        });

        for (const r of relicArr) {
            const ExpData = await calscore(r,standard);  // 等這個做完
            
            temparr.push(ExpData);
        }
        
        setRelicDataArr(temparr);
        RelicDataArrRef.current=temparr;
        //如果是剛查詢完的 則改成可以儲存
        setIsSaveAble(true);
       
    }

    function clearData(){
        setExpRate(undefined);
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic();
    }

    //檢視過往紀錄
    const checkDetails=useCallback((index)=>{
        let data=historyData[index];
        
        setRelicDataArr([...data.dataArr]);
        setRelicIndex(0);
        setIsSaveAble(false); 

        //避免第一次顯示區塊 而導致滾動失常
        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    },[historyData]);

    //更新紀錄
    const updateDetails=useCallback(async (index)=>{
        showStatus('正在更新資料中');
        let data=historyData[index];

        let sendData={
            uid:data.userID,
            charID:data.char.charID,            
            partsIndex:7
        };

        await getRecord(sendData,data.dataArr[0].standDetails)
        .then(()=>{
            console.log(RelicDataArrRef.current);
            //計算平均分數與平均機率

            if(RelicDataArrRef.current){
                let sum = 0;
                let sum2 = 0;

                RelicDataArrRef.current.forEach((r)=>{
                    sum +=Number(r.Rscore);
                    sum2 += r.ExpRate;
                });
                let avgScore = Number(parseFloat(sum/RelicDataArrRef.current.length).toFixed(1));
                let calDate=new Date();
                let avgRank = undefined;
                let avgRate = Number((sum2*100/RelicDataArrRef.current.length).toFixed(1));
                
                scoreStand.forEach((stand)=>{
                    //接著去找尋這個分數所屬的區間
                    if(stand.stand<=avgScore&&avgRank===undefined)
                        avgRank=stand;
                });

                //儲存紀錄
                let newHistorydata={
                    version:version,
                    calDate:calDate.toISOString().split('T')[0],
                    userID:data.userID,
                    char:data.char,
                    dataArr:RelicDataArrRef.current,
                    avgScore:avgScore,
                    avgRank:avgRank,
                    avgRate:avgRate
                };

                dispatchHistory({ type: "UPDATE", payload: {index:index,newData:newHistorydata} });
                updateStatus('已更新','success');
                setIsSaveAble(false);
                let oldHistory=historyData;
                oldHistory[index]=newHistorydata;
                localStorage.setItem('importData',JSON.stringify(oldHistory));
            }


            
        }).catch(()=>{
            console.log('error');
        });
            
    },[historyData]);

    //刪除過往紀錄
    const updateHistory=useCallback((index)=>{
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        let oldHistory=historyData;
        dispatchHistory({ type: "DELETE", payload: index })

        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem('importData',JSON.stringify(oldHistory));
        //強制觸發刷新紀錄

        setTimeout(() => {
            updateStatus('成功刪除該筆資料','success');
        }, 0);
    },[historyData]);

    function calscore(relic,standard){
        return new Promise((resolve)=>{
            let isCheck=true;
            //將獲得到遺器先儲存起來

            //將運行結果丟到背景執行
            let worker=new Worker(new URL('../../worker/worker.js', import.meta.url));
            let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type);
            let SubData=[];

            relic.sub_affix.forEach((s,i)=>{
                let typeName=AffixName.find((a)=>a.fieldName===s.type);
                let val=(!typeName.percent)?Number(s.value.toFixed(1)):Number((s.value*100).toFixed(1));
                
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:val, //詞條數值    
                    count:s.count-1//強化次數
                }

                SubData.push(data);
            });
            
            //如果篩選有速度詞條 需給予0.5誤差計算 
            let deviation=(SubData.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
            SubData.forEach(s=>{
                if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                    deviation+=0.2;
            })

            //制定送出資料格式
            let postData={
                charID:charID,
                MainData:MainAffix.name,
                SubData:SubData,
                partsIndex:relic.type,
                standard:standard,
                deviation:0.5
            };
            
            if(isCheck){
                showStatus('數據計算處理中......');
                worker.postMessage(postData);

                // 接收 Worker 返回的訊息
                worker.onmessage = function (event) {
                    let returnData = {
                        relic:relic,
                        ExpRate:event.data.expRate,
                        Rscore:event.data.relicscore,
                        PieNums:event.data.returnData,
                        Rank:event.data.relicrank,
                        standDetails:standard
                    };

                    resolve(returnData);
                };
            }
        })
        
    }

    //儲存紀錄
    function saveRecord(){
        let selectChar=characters.find((c)=>c.charID===charID);

        //如果原本紀錄超過6個 要先刪除原有紀錄
        if(historyData.length>=maxHistoryLength)
            dispatchHistory({ type: "LIMIT" })

        //如果當前沒有任何資料則不予匯入
        if(RelicDataArr.length === 0){
            updateStatus("當前沒有任何數據，不予儲存!!",'error');
            return;
        }
        //如果玩家ID當前並沒有輸入成功
        if(!userID.current){
            updateStatus("沒有輸入玩家ID，請再試一次!!","error");
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            updateStatus("沒有選擇任何腳色!!","error");
            return;
        }

        //計算平均分數與平均機率
        let sum = 0;
        let sum2 = 0;
        RelicDataArr.forEach((r)=>{
            sum +=Number(r.Rscore);
            sum2 += r.ExpRate;
        });
        let avgScore = Number(parseFloat(sum/RelicDataArr.length).toFixed(1));
        let calDate=new Date();
        let avgRank = undefined;
        let avgRate = Number((sum2*100/RelicDataArr.length).toFixed(1));
        
        scoreStand.forEach((stand)=>{
            //接著去找尋這個分數所屬的區間
            if(stand.stand<=avgScore&&avgRank===undefined)
                avgRank=stand;
        });


        //儲存紀錄
        let data={
            version:version,
            calDate:calDate.toISOString().split('T')[0],
            userID:userID.current,
            char:selectChar,
            dataArr:RelicDataArr,
            avgScore:avgScore,
            avgRank:avgRank,
            avgRate:avgRate
        };
        let oldHistory=historyData;
        
        dispatchHistory({ type: "ADD", payload: data })
        updateStatus('已儲存','error');
        setIsSaveAble(false);
        oldHistory.push(data);
        
        localStorage.setItem('importData',JSON.stringify(oldHistory));
       
    }
    
    
    //共用context狀態
    let ImporterStatus={
        //數值資料
        charID:charID,
        selfStand:selfStand,
        partsIndex:partsIndex,
        standDetails:standDetails.current,
        partArr:partArr,
        historyData:historyData,
        isChangeAble:isChangeAble,
        RelicDataArr:RelicDataArr,
        relicIndex:relicIndex,
        
        //RelicData
        relic:relic,
        Rscore:Rscore,
        Rrank:Rrank,
        //方法
        updateHistory:updateHistory,
        checkDetails:checkDetails,
        updateDetails:updateDetails,

        //state管理
        setCharID:setCharID,
        setSelfStand:setSelfStand,
        setIsSaveAble:setIsSaveAble,
        setStatusMsg:setStatusMsg,
        setRelicIndex:setRelicIndex
    }
    
    return(
    <SiteContext.Provider value={ImporterStatus}>
        <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[90%]'>
            <div className='flex flex-row items-center'>
                <h1 className='text-red-600 font-bold text-2xl'>遺器匯入</h1>
                <div className='hintIcon ml-2 overflow-visible'
                    data-tooltip-id="ImporterHint">
                    <span className='text-white'>?</span>
                </div>
            </div>
            <div className='flex flex-row flex-wrap '>
                <div className='flex flex-col w-2/5 max-[1250px]:w-[100%] min-w-[400px]'>
                    <div className='flex flex-row [&>*]:mr-2 my-3 items-baseline max-[400px]:!flex-col'>
                        <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'><span className='text-white'>玩家UID :</span></div>
                        <input type='text' placeholder='HSR UID' 
                                className='h-[40px] max-w-[170px] pl-2 
                                        bg-inherit text-white outline-none border-b border-white' 
                                id="userId"
                                onChange={(e)=>userID.current=e.target.value}
                                disabled={!isChangeAble}/>
                    </div>
                    <div className='flex flex-row [&>*]:mr-2 my-3 max-[400px]:!flex-col items-center'>
                        <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                            <span className='text-white whitespace-nowrap'>Characters 腳色:</span>
                        </div>                       
                        <div className='flex flex-row items-center'>
                            <CharSelect  />
                            <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col` } >
                        <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                            <span className='text-white whitespace-nowrap'>Affix 有效詞條:</span>
                        </div>
                        <div className='flex flex-row items-center'>
                            <StandardSelect />
                            <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="StandardHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`}>
                        <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'>
                            <span className='text-white'>Params 參數:</span>
                        </div>
                        <ShowStand />
                    </div>
                    <div className='my-3 flex flex-row [&>*]:mr-2 justify-end max-w-[400px] max-[400px]:justify-start'>
                        <button className='processBtn' onClick={()=>getRecord()}  disabled={!isChangeAble}>開始匹配</button>
                        <button className='processBtn' onClick={()=>saveRecord()} disabled={!isSaveAble}>儲存紀錄</button>
                    </div>
                    
                </div>
                <div className={`w-3/5 ${(historyData.length===0)?'hidden':''} flex-wrap max-[1250px]:w-[100%]`}>
                    <div className='flex flex-row items-baseline'>
                        <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                        <div className='hintIcon ml-2 overflow-visible'
                            data-tooltip-id="HistoryHint">
                            <span className='text-white'>?</span>
                        </div>
                    </div>
                    <div className='h-[300px] overflow-y-scroll hiddenScrollBar flex flex-row flex-wrap max-[600px]:!flex-col max-[600px]:!flex-nowrap'>
                        <PastPreviewList  />
                    </div> 
                </div>
            </div>
            
            <div className={`flex flex-row flex-wrap w-[100%] border-t-4 border-gray-600 ${(PieNums===undefined)?'hidden':''}`} >
                <div className={`w-[100%] ${(PieNums===undefined)?'hidden':''}`}>
                    <RelicSelect />
                </div>
                <div className={`mt-3 flex flex-row flex-wrap w-1/4  max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`}>
                    <RelicData  mode={'Importer'} button={true}/>
                </div>
                <div className={`mt-3 w-1/4 max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                    <StandDetails />
                </div>
                <div className={`mt-3 flex flex-row flex-wrap w-1/2 max-[700px]:w-[100%] ${(!PieNums)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} 
                    id="resultDetails">
                    <Result ExpRate={ExpRate} 
                            Rscore={Rscore} 
                            Rrank={Rrank} 
                            PieNums={PieNums}/>
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
            <Tooltip id="StandardHint" 
                    place="top-start"
                    render={()=>
                        <div className='flex flex-col'>
                            <span className='text-white'>根據個人需求</span>
                            <span className='text-yellow-400'>選擇不重複的詞條種類(包含主詞條)</span>
                            <span className='!text-red-500'>"有效詞條"選擇最多保有6個。</span>
                        </div>
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
                                    <span className='text-white font-bold'>更新</span>
                                </div>
                                <div>
                                    <span>點選後會根據該紀錄原本的參數再查詢一次，並且將新結果更新至掉該筆紀錄中。</span>
                                </div>
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
            <Tooltip id="RelicSelectHint"  
                    place="top-start"
                    render={()=>
                        <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
                            <span>下方會顯示出該腳色符合條件的所有遺器</span>
                            <span>點選遺器即可查看個別資訊</span>
                            <span className='!text-red-600 font-bold'>僅顯示符合條件的五星滿等遺器遺器</span>
                        </div>
                    }/>
            <Tooltip id="ImporterHint" 
                    place='right-start'
                    render={()=><HintImporter/>}
                    clickable={true}/>
        </div>
            
    </SiteContext.Provider>)
}




export default Importer;
