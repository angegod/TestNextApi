"use client"
import React, { useContext, useEffect, useRef,createContext } from 'react';
import AffixName from '../../data/AffixName';
import { useState } from 'react';
import '../../css/simulator.css';
import '../../css/enchant.css';
import { StandDetails } from '../../components/StandDetails';
import { RelicData, RelicData_simulate } from '../../components/RelicData';
import { PieChart } from '@mui/x-charts/PieChart';
import SiteContext from '@/context/SiteContext';

//此物件為單次模擬隨機強化後的結果
const Enchant=React.memo(()=>{

    const [data,setData] = useState();//從其他頁面記錄在localstorage的資料
    const {relic,standDetails,Rscore,Rrank,mode}=data || {};
    
    const relicBackUp =useRef(null);
    const [isChangeAble,setIsChangeAble]=useState(true);
    //模擬強化相關數據
    const [simulatorData,setSimulatorData]=useState({oldData:null,newData:null});
    const [statics,setStatics]=useState(undefined);
    
    //強化次數
    const [count,setCount]=useState(0);

    //成功翻盤次數
    const [successCount,setSuccessCount]=useState(0);

    const scoreStand=[
        {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
        {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
        {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
        {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
        {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
        {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
    ];

    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Ball 位面球','Rope 連結繩'];

    //進入頁面初始化自動執行一次
    useEffect(()=>{
        if(localStorage.getItem('EnchantData')!==null&&localStorage.getItem('EnchantData')!==undefined){
            let getSendData = JSON.parse(localStorage.getItem('EnchantData'));
            setData(getSendData);
        }
    },[])

   


    useEffect(()=>{
        //回到畫面最上方
        requestAnimationFrame(()=>{
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        })

        //初始化紀錄
        initStatics();

        //依照執行模式執行對應模擬
        execute();
    },[data])

    useEffect(()=>{
        //初始紀錄
        if(relicBackUp.current === null){
            relicBackUp.current=simulatorData.oldData;
        }
        //新增強化紀錄
        addStatics();
    },[simulatorData])


    //初始化統計數據
    function initStatics(){
        let arr = [];
        scoreStand.forEach((s)=>{
            arr.push({
                label:s.rank,
                value:0,
                color:s.color,
                tag:s.rank
            })
        });

        setStatics(arr);
    }

    //增加統計數據
    function addStatics(){
        if(simulatorData.newData!==null){
            //如果數據統計尚未初始化
            if(statics === undefined){
                let arr=[];
                let data={
                    label:simulatorData.newData.relicrank.rank,
                    value:1,
                    color:scoreStand.find((s)=>s.tag === simulatorData.newData.relicrank.rank).color,
                    tag:simulatorData.newData.relicrank.rank
                }
                arr.push(data);
                setStatics(arr);
                return;
            }

            //讀取既有統計
            let oldStatics = statics;
            let targetStatics = oldStatics.find((s)=>s.label === simulatorData.newData.relicrank.rank);
            
            if (targetStatics === null || targetStatics === undefined) {
                let data = {
                    label: simulatorData.newData.relicrank.rank,
                    value: 1,
                    color: scoreStand.find((s) => s.tag === simulatorData.newData.relicrank.rank).color,
                    tag: simulatorData.newData.relicrank.rank
                };
                setStatics((old) => [...old, data]); // 新陣列，觸發 re-render
            } else {
                setStatics((old) =>
                    old.map((item) =>
                        item.tag === simulatorData.newData.relicrank.rank
                            ? { ...item, value: item.value + 1 }
                            : item
                    )
                );
            }
        }
    }

    //模擬強化--Importer
    function simulate(){
        let isCheck=true;

        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../../worker/worker2.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type);
        let SubData=[];
          
        if(simulatorData.oldData===null){
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
        }else{
            SubData = simulatorData.oldData.returnData;
        }
        

        //檢查標準是否合法
        standDetails.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
            }
        });
        
        //如果篩選有速度詞條 需給予0.5誤差計算 
        let deviation=(SubData.includes((s)=>s.subaffix==='速度'))?0.5*(standDetails.find((s)=>s.name==='速度').value):0;
        SubData.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        });

        //制定送出資料格式
        let postData={
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:relic.type,
            standard:standDetails,
            deviation:0
        };

        if(isCheck){
            worker.postMessage(postData);
            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {
                setSimulatorData({
                    oldData:{
                        relicscore:(simulatorData.oldData===null)?Rscore:simulatorData.oldData.relicscore,
                        relicrank:(simulatorData.oldData===null)?Rrank:simulatorData.oldData.relicrank,
                        returnData:SubData
                    },
                    newData:event.data
                });

                setCount((c)=>c+=1);

                //如果該次強化超過原有分數 則成功次數+1
                if(simulatorData.oldData!==null){
                    if(parseInt(event.data.relicscore) > parseInt(simulatorData.oldData.relicscore))
                        setSuccessCount((c)=>c+=1);
                }
            };

           
        }
    }

    //模擬強化--Simulator
    function simulate2(){
        let isCheck=true;
        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../../worker/worker2.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.name===relic.main_affix);
        let SubData=[];


        if(simulatorData.oldData===null){
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

        }else{
            SubData = simulatorData.oldData.returnData;
        }
        

        //檢查標準是否合法
        standDetails.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
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
            standard:standDetails,
            deviation:0.5
        };
        
        if(isCheck){
            worker.postMessage(postData);

            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {

                setSimulatorData({
                    oldData:{
                        relicscore:(simulatorData.oldData===null)?Rscore:simulatorData.oldData.relicscore,
                        relicrank:(simulatorData.oldData===null)?Rrank:simulatorData.oldData.relicrank,
                        returnData:SubData
                    },
                    newData:event.data
                });

                setCount((c)=>c+=1);

                //如果該次強化超過原有分數 則成功次數+1
                if(simulatorData.oldData!==null){
                    if(parseInt(event.data.relicscore) > parseInt(simulatorData.oldData.relicscore))
                        setSuccessCount((c)=>c+=1);
                }
            };
        }
    }

    //套用模擬強化的資料
    function changeToNew(){
        if(simulatorData.newData!==null){
            setSimulatorData({
                oldData:simulatorData.newData,
                newData:null
            });

            setSuccessCount(0);
        }
    }

    function execute(){
        //根據傳入模式執行對應模擬
        switch(mode){
            case 'Importer':
                simulate();
                break;
            case 'Simulator':
                simulate2();
                break;
            default:
                break;
        }
    }

    //回到初始狀態
    function reInit(){
        //將counter歸0
        setCount(0);
        setSuccessCount(0);

        //還原至一開始記錄
        setSimulatorData({oldData:relicBackUp.current,newData:null});

        //還原強化紀錄
        initStatics();
    }

    const ResultSection=(simulatorData.newData!==undefined&&simulatorData.oldData!==undefined)?(
        <div className='flex flex-row flex-wrap  max-[600px]:!flex-col'>
            <DataList standDetails={standDetails} data={simulatorData.oldData} title={'重洗前'} />
            <div className={`flex my-auto w-[30px] moveAnimate moveAnimate2 max-[600px]:w-full  h-[30px] ${(simulatorData.newData===null)?'hidden':''}`} >
                <svg xmlns="http://www.w3.org/2000/svg" className='max-[600px]:hidden mx-auto'
                    height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className='min-[600px]:hidden mx-auto'
                    height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
            </div>
            <DataList standDetails={standDetails} data={simulatorData.newData} title={'重洗後'} />          
        </div>
    ):(<></>);

    const EnchantStatus ={
        relic:relic,
        Rrank:Rrank,
        Rscore:Rscore,
        standDetails:standDetails,
        isChangeAble:isChangeAble,
        standDetails:standDetails,
        partArr:partArr
    };
    
    return(
        <SiteContext.Provider value={EnchantStatus}>
            <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[90%]'>
                <div className="w-[100%] border-gray-600 my-4 justify-center flex flex-row flex-wrap max-[900px]:flex-col">
                    <div className='flex flex-row flex-wrap w-1/2 max-[900px]:w-full justify-evenly max-[900px]:mb-2'>
                        <div className='w-[45%] h-fit flex flex-row max-[900px]:w-fit bg-[rgba(0,0,0,0.5)] p-2 rounded-md'>
                            {(mode==="Importer")?
                                <RelicData  />:
                                <RelicData_simulate />}
                        </div>
                        <div className='w-[45%] h-fit max-[900px]:w-fit bg-[rgba(0,0,0,0.5)] p-2 rounded-md ml-1 max-[900px]:ml-0 max-[900px]:my-2'>
                            <StandDetails />
                        </div>
                    </div>
                    <div className='w-1/2 bg-[rgba(0,0,0,0.5)] p-2 rounded-md max-[900px]:w-[100%] flex flex-col max-[900px]:items-center'>
                        <div className='flex flex-row'>
                            <div className='items-center flex flex-row'>
                                <span className='text-red-600 text-lg font-bold'>模擬強化</span>
                                <div className='hintIcon ml-2 overflow-visible' data-tooltip-id="ImporterHint">
                                    <span className='text-white'>?</span>
                                </div>
                            </div>
                            <div>
                                <button className='processBtn ml-2' onClick={()=>execute()} >再洗一次</button>
                                <button className='processBtn ml-2' onClick={()=>changeToNew()}>套用新強化</button>
                                <button className='processBtn ml-2' onClick={()=>reInit()}>還原</button>
                            </div>
                        </div>
                        <div className='my-2'>
                            <span>目前重洗次數:<span className='text-white ml-1'>{count}</span></span>
                        </div>
                        <div>
                            {ResultSection}
                        </div>
                        <div className=''>
                            <Pie PieNums={statics} successCount={successCount}/> 
                        </div>
                    </div>
                </div>
               
            </div>
        </SiteContext.Provider>
    )
     
});

//強化前後的數據顯示
const DataList=React.memo(({standDetails,data,title})=>{
    let list=[];
    if(data!==null){
        data.returnData.map((d,i)=>{
            let markcolor="";
            var targetAffix = AffixName.find((a)=>a.name===d.subaffix);
            let isBold=(standDetails.find((st)=>st.name===d.subaffix)!==undefined)?true:false;
            let showData;
            //檢查是否要顯示%數
            if(targetAffix.percent&&!d.data.toString().includes('%'))
                showData=d.data+'%';
                    
            var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${targetAffix.icon}.png`;
    
            switch(d.count){
                case 0:
                    markcolor='rgb(122, 122, 122)';
                    break;
                case 1:
                    markcolor='rgb(67, 143, 67)';
                    break;
                case 2:
                    markcolor='rgb(23, 93, 232)';
                    break;
                case 3:
                    markcolor='rgb(67, 17, 184)';
                    break;
                case 4:
                    markcolor='rgb(219, 171, 15)';
                    break;
                case 5:
                    markcolor='#FF55FF';
                    break;
                default:
                    break;
            }
    
            list.push(
                <div className='flex flex-row' key={'Subaffix_'+d.subaffix}>
                    <div className='flex justify-center items-center'>
                        <span className='mr-0.5 text-white w-[20px] h-[20px] rounded-[20px]
                            flex justify-center items-center' style={{backgroundColor:markcolor}}>
                            {d.count}
                        </span>
                    </div>
                    <div className='w-[120px] flex flex-row'>
                        <div className='flex justify-center items-center'>
                            <img src={imglink} alt='555' width={24} height={24}/>
                        </div>
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{d.subaffix}</span>
                    </div>
                    <span className='flex w-[70px]'>:<span className='ml-2 text-white '>{showData}</span></span>
                </div>
                
            )
        });
        return(
            <div className='flex flex-col mx-1'>
                <div>
                    <span className='text-amber-700 font-bold text-lg'>{title}</span>
                    <div className='flex flex-row'>
                        <span>遺器評級:</span>
                        <span className='pl-2' style={{color:data.relicrank.color}}>
                            {data.relicrank.rank} {data.relicscore}/100 
                        </span>
                    </div>
                </div>
                <div>
                    {list}
                </div>
            </div>
        )
    }else{
        return(<></>)
    }
    
    
    
    
});

const Pie=React.memo(({PieNums,successCount})=>{
    if(PieNums!==undefined){
        const pieParams = {
            height: 200,
            margin:{ top: 10, right: 0, bottom: 0, left: 0 },
            slotProps: { legend: { hidden: true } },
        };

        return(
           <div className='w-[100%] flex flex-row flex-wrap'>
                <div className='min-w-[300px]'>
                    <PieChart  
                    series={[
                        {
                            innerRadius: 20,
                            arcLabelMinAngle: 35,
                            arcLabel: (item) => `${item.value}次`,
                            data: PieNums,
                        }
                    ]}  {...pieParams} />
                </div>
                <div className={`flex flex-col w-2/5 max-[500px]:w-[100%] mt-2 hidden ${(PieNums.find((p)=>p.value!==0)===undefined)?'hidden':''}`}>
                    <div className='flex flex-col max-[600px]:w-3/5 max-[600px]:mx-auto'>
                        <div>
                            <span className='text-amber-700 font-bold text-lg'>模擬次數</span>
                        </div>
                        <div className='flex flex-col justify-center '>
                            {PieNums.map((p,i)=>{
                                if(p.value!==0)
                                    return(
                                        <div className='my-1 flex flex-row' key={'pieNums'+i}>
                                            <span className='w-1/4' style={{color:p.color}}>{p.tag}</span>
                                            <span className='w-1/4' style={{color:p.color}}>{p.value}次</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        
                    </div>
                    <div className='flex flex-col justify-center hidden max-[600px]:w-3/5 max-[600px]:mx-auto'>
                        <div className='flex justify-start'>
                            <span className='text-amber-700 font-bold text-lg'>翻盤次數</span>
                        </div>
                        <div className='flex justify-start text-center'>
                            <span className='text-white'>{successCount}次</span>
                        </div>
                    </div>
                </div>
               
           </div>
        );

    }else{
        return(<></>)
    }
});

export default Enchant;

//data資料包含著 既定結果跟模擬結果
//兩個都需要 1.詞條數據 2.強化次數 3.遺器分數跟評級