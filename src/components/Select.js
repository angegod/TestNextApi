"use client"
import React,{useContext, useState,useEffect, useRef} from 'react';
import AffixList from '../data/AffixList';
import characters from '../data/characters';
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import SiteContext from '../context/SiteContext';
import { Tooltip } from 'react-tooltip';

//主詞條選擇
const MainAffixSelect = React.memo(() => {
    const { partsIndex, MainSelectOptions, setMainSelectOptions, isChangeAble } = useContext(SiteContext);
    const [range, setRange] = useState(null);

    useEffect(() => {
        if (Number.isInteger(parseInt(partsIndex)) && partsIndex !== undefined) {
            const found = AffixList.find((s) => s.id === parseInt(partsIndex));
            if (found) setRange(found.main);
        } else {
            setRange(null);
        }
    }, [partsIndex]);

    // 當 range 是只有一個值時，設定 state（只設定一次）
    useEffect(() => {
        if (range && range.length === 1) {
            setMainSelectOptions(range[0]);
        }
    }, [range]);

    if (!range) return <></>;

    if (range.length === 1) {
        return <span className='text-white'>{range[0]}</span>;
    } else {
        const options = [
            <option value={'undefined'} key={'MainAfffixUndefined'}>請選擇</option>,
            ...range.map((s, i) => (
                <option value={s} key={`Mainaffix${i}`}>{s}</option>
            ))
        ];

        return (
            <select
                defaultValue={MainSelectOptions}
                onChange={(event) => {
                    const val = event.target.value;
                    setMainSelectOptions(val === 'undefined' ? undefined : val);
                }}
                disabled={!isChangeAble}
                className='w-[150px] graySelect'>
                {options}
            </select>
        );
    }
});

//副詞條選擇
const SubAffixSelect=React.memo(({index})=>{
    const {SubData,MainSelectOptions,partsIndex,isChangeAble}=useContext(SiteContext)

    function updateSubAffix(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).subaffix=val;
    }

    function updateSubData(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).data=Number(val);
    }

    function updateSubCount(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).count=Number(val);
    }

    if(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'&&partsIndex!==undefined){
        let range=AffixList.find((s)=>s.id===parseInt(partsIndex)).sub;
        let options=[<option value={'undefined'} key={`SubaffixUndefined`}>請選擇</option>];

        range.forEach((s,i)=>{
            options.push(<option value={s} key={`Subaffix${i}`}>{s}</option>)
        });
        
        

        return(<div className='my-1' key={'SubAffixSelect'}>
            <select defaultValue={SubData.current[index].subaffix} 
                    onChange={(event)=>updateSubAffix(event.target.value,index)} 
                    className='graySelect'
                    disabled={!isChangeAble}>
                        {options}

            </select>
            <input type='number' defaultValue={SubData.current[index].data}
                    onChange={(event)=>updateSubData(event.target.value,index)}
                    className='ml-2 max-w-[50px] bgInput text-center' 
                    disabled={!isChangeAble} min={0} title='詞條數值'/>
            <input type='number' defaultValue={SubData.current[index].count}
                    onChange={(event)=>updateSubCount(event.target.value,index)}
                    className='ml-2 text-center bgInput' disabled={!isChangeAble}
                    min={0} max={5} title='強化次數'/>
            </div>)
    }else{
        return(<></>)
    }   
});

//部位選擇器
const PartSelect=React.memo(()=>{

    const {partArr,partsIndex,setPartsIndex,setIsSaveAble,isChangeAble}=useContext(SiteContext);
    let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

    partArr.forEach((a,i)=>{
        options.push(
            <option value={i+1} key={`PartSelect${i}`} >{a}</option>       
        )
    });


    return(
        <select value={partsIndex} 
                onChange={(event)=>{
                    if(event.target.value==='undefined')
                        setPartsIndex(undefined)
                    else{
                        setPartsIndex(event.target.value);setIsSaveAble(false);
                    }

                }}
                disabled={!isChangeAble} className='h-[25px] w-[150px] graySelect'>{options}</select>
    )
});

//自訂義有效詞條種類
const StandardSelect2=React.memo(()=>{
    const [selectAffix,setAffix]=useState(undefined);
    const {partsIndex,selfStand,setSelfStand,isChangeAble}=useContext(SiteContext);
    
    //添加標準 目前設定先不超過六個有效 且不重複
    function addAffix(){
        //如果為預設選項則不予選擇
        if(selectAffix===undefined)
            return;
        let newItem={
            name:selectAffix,
            value:1
        }
        if(selfStand.length<6&&!(selfStand.findIndex((item)=>item.name===selectAffix)>=0))
            setSelfStand((old)=>[...old,newItem]);
    }

    function clearAffix(){
        setSelfStand([]);
    }

    if(partsIndex!==undefined){
        //依據所選部位 給出不同的選澤
        let target=AffixList.find((a)=>a.id===parseInt(partsIndex));
        //合併所有選項 並且移除重複值
        let mergedArray = [...new Set([...target.main, ...target.sub])];
        mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

        let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

        //如果該標準已被選擇 會顯示勾選圖示於左側選項中
        mergedArray.forEach((m, i) => {
            const exists = selfStand.some(s => s.name === m);
            const mark = exists ? '\u2714' : '\u2003';
          
            options.push(
                <option
                    key={`Affix${i}`}
                    value={m}
                    title={m}
                    className="w-[160px] whitespace-pre">
                    {`${mark} ${m}`}
                </option>
            );
        });

        return(
                <div className='flex flex-col'>
                    <div className='flex flex-row flex-wrap items-baseline'>
                        <select value={selectAffix}
                            onChange={(event)=>{setAffix(event.target.value)}}
                            disabled={!isChangeAble} className='mr-1 h-[25px] w-[120px] graySelect'
                            >{options}</select>
                        <div className='max-[520px]:mt-1 ml-1'>
                            <button className='processBtn px-1' onClick={addAffix} disabled={!isChangeAble}>添加</button>
                            <button className='deleteBtn ml-2 px-1' onClick={clearAffix} disabled={!isChangeAble}>清空</button>
                        </div>
                    </div>
                </div>
        )
    }else{
        return(<></>)
    }

});

const StandardSelect=React.memo(()=>{
    const {partsIndex,selfStand,setSelfStand,isChangeAble}=useContext(SiteContext);
    const [expand,setExpand]=useState(false);

    const selectContainer = useRef(null);

    //偵測點擊位置 如果點擊非本元件 則直接展開設為false
    useEffect(()=>{
        function handleClickOutside(event) {
            // 如果 containerRef 有值，且點擊目標不在 container 裡面
            if (selectContainer.current && !selectContainer.current.contains(event.target)) {
                setExpand(false);
            }
        }

        if (expand) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // 清理事件
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    },[expand])

    //添加標準 目前設定先不超過六個有效 且不重複
    function addAffix(selectAffix){
        console.log()
        //如果該詞條沒有出現在arr裡則加入 反之則移除
        if(!selfStand.some((s) => s.name === selectAffix)){
            //如果為預設選項則不予選擇
            if(selectAffix===undefined)
                return;
            let newItem={
                name:selectAffix,
                value:1
            }
            if(selfStand.length<6&&!(selfStand.findIndex((item)=>item.name===selectAffix)>=0))
                setSelfStand((old)=>[...old,newItem]);
        }else{
            setSelfStand((arr)=>arr.filter((s)=>s.name!==selectAffix));
        }
    }

    function clearAffix(){
        setSelfStand([]);
    }

    if(partsIndex!==undefined){
        //依據所選部位 給出不同的選澤
        let target=AffixList.find((a)=>a.id===parseInt(partsIndex));
        //合併所有選項 並且移除重複值
        let mergedArray = [...new Set([...target.main, ...target.sub])];
        mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

        //模仿原生select標籤 渲染每個option之div
        let optionsList=mergedArray.map((m, i) => {
            const exists = selfStand.some(s => s.name === m);
            
            return(
                <div className='my-0.5 mx-1 hover:bg-stone-500 hover:text-white cursor-pointer flex flex-row items-center'
                    onClick={()=>addAffix(m)}
                    key={"options"+i}>
                    <div className='mr-1 flex items-center'>
                        <input  type='checkbox' checked={exists} 
                                className='border-[0px] w-4 h-4 accent-[dimgrey]' 
                                onChange={(event)=>console.log(event.target.vaue)}
                                disabled={!exists&&selfStand.length===6}/>
                    </div>
                    <div>
                        <span className='text-white text-sm'>{m}</span>
                    </div>
                </div>
            )
        });

        // <div className="w-5">
        //       <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/check.svg`} alt="check"
        //                     className={exists ? 'opacity-100' : 'opacity-0'}/>
        //            </div>

        return(
                <div className='flex flex-col' ref={selectContainer}>
                    <div className='flex flex-row flex-wrap items-baseline'>
                        <div className='w-[150px] min-w-fit'>
                            <div className='relative border-b-2 border-white flex flex-row justify-between' onClick={()=>setExpand(!expand)}>
                                <div>
                                    <span className='ml-1 text-white'>請選擇</span>
                                </div>
                                <div>
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/arrow_drop.svg`}
                                        className={`transition-transform duration-300 ${expand ? 'rotate-180' : 'rotate-0'}`}
                                        alt="arrow"/>
                                </div>
                            </div>
                            {expand&&(
                                <div className="absolute overflow-y-scroll bg-stone-700 w-[inherit] h-[150px] border-[1px] hide-scrollbar border-stone-700 p-1">
                                    {optionsList}
                                </div>
                            )}
                        </div>
                        <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="StandardHint">
                            <span className='text-white'>?</span>
                        </div>
                    </div>
                    <Tooltip id="StandardHint" 
                        place="top-start"
                        render={()=>
                            <div className='flex flex-col'>
                                <span className='text-white'>根據個人需求</span>
                                <span className='text-yellow-400'>選擇不重複的詞條種類(包含主詞條)</span>
                                <span className='!text-red-500'>"有效詞條"選擇最多保有6個。</span>
                            </div>
                        }/>
                </div>
        )
    }else{
        return(<></>)
    }
});

//腳色選擇器
const CharSelect=React.memo(()=>{
    const {charID,setCharID,setIsSaveAble,isChangeAble}=useContext(SiteContext)
    let options=[];

    const customStyles={
        control: (provided) => ({
            ...provided,
            backgroundColor: 'inherit', // 繼承背景顏色
            outline:'none',
        }),
        input: (provided) => ({
            ...provided,
            color: 'white', // 這裡設定 input 文字的顏色為白色
            backgroundColor:'inherit'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? 'darkgray'
              : state.isFocused
              ? 'gray'
              : 'rgb(36, 36, 36)',
            color: state.isSelected ? 'white' : 'black'
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(36, 36, 36)',
        })
    }
    
    characters.forEach((c)=>{
        options.push({
            value: c.charID, 
            label: c.name,
            engLabel:c.eng_name,
            icon: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${c.charID}.png`
        })
    })

    //自訂義篩選
    const customFilterOption = (option, inputValue) => {
        const lowerInput = inputValue.toLowerCase();
        return option.data.label.toLowerCase().includes(lowerInput) || option.data.engLabel.toLowerCase().includes(lowerInput);
    };

    const selectedOption = options.find((option) => option.value === charID);
    return(<Select options={options} 
                className='w-[200px]' 
                onChange={(option)=>{setCharID(option.value);setIsSaveAble(false);}}
                value={selectedOption} 
                isDisabled={!isChangeAble}
                styles={customStyles}
                getOptionLabel={(e) => (
                    <div style={{ display: "flex", alignItems: "center"  }}>
                        <img src={e.icon} alt={e.label} style={{ width: 30, height: 30, marginRight: 8 ,borderRadius:"25px" }} />
                        <span className='text-white'>{e.label}</span>
                    </div>
                )}
                filterOption={customFilterOption}/>)
});

//遺器選擇
const RelicSelect=React.memo(()=>{
    const {RelicDataArr,relicIndex,setRelicIndex}=useContext(SiteContext);
    if(RelicDataArr.length !==0){
        let list = RelicDataArr.map((r,i)=>{
            const reliclink = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${r.relic.icon}`;
    
            return(
                <div className={`rounded-[50px] mx-2 mb-2 cursor-pointer p-2 border-[3px] max-[400px]:mx-1 max-[400px]:border-[2px] ${(relicIndex === i)?"border-yellow-600":"border-gray-300"}`} 
                    key={'RelicSelect'+i}
                    onClick={()=>setRelicIndex(i)}>
                    <img src={reliclink} alt='relic' width={50} height={50}/>
                </div>
            )
        })
    
        return(
            <div className='w-4/5 flex flex-col pt-1 max-[500px]:w-[100%]'>
                <div className='flex flex-row items-baseline'>
                    <span className='text-red-600 font-bold text-lg'>遺器匹配結果</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="RelicSelectHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='flex flex-row flex-wrap my-2 max-[900px]:w-[100%]'>
                    {list}
                </div>
            </div>
        )
    }else{
        return(<></>)
    }
})



export {PartSelect,StandardSelect,CharSelect,MainAffixSelect,SubAffixSelect,RelicSelect,StandardSelect2}