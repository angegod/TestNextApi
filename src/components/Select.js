import React,{useContext, useEffect, useState} from 'react';
import AffixList from '../data/AffixList';
import characters from '../data/characters';
import Select from 'react-select';

//主詞條選擇
const MainAffixSelect=React.memo(({context})=>{
    const {partsIndex,MainSelectOptions,setMainSelectOptions,isChangeAble} = useContext(context);

    if(Number.isInteger(parseInt(partsIndex))&&partsIndex!==undefined){
        let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
        
        //如果只有固定一個主屬性的情況下
        if(range.length===1){
            setMainSelectOptions(range[0]);
            return(<span className='text-white'>{MainSelectOptions}</span>)
        }else{
            //如果超過一個的情況下
            let options=[<option value={'undefined'} key={"MainAfffixUndefined"}>請選擇</option>];

            range.forEach((s,i)=>{
                options.push(<option value={s} key={'Mainaffix'+i}>{s}</option>)
            });

            return(<select  defaultValue={MainSelectOptions} 
                            onChange={(event)=>{
                                if(event.target.value==='undefined')
                                    setMainSelectOptions(undefined)
                                else
                                    setMainSelectOptions(event.target.value)
                            }}
                            disabled={!isChangeAble}
                            className='w-[150px] graySelect'>{options}</select>)
        }
    }else{
        return(<></>)
    }
});

//副詞條選擇
const SubAffixSelect=React.memo(({index,context})=>{
    const {SubData,MainSelectOptions,partsIndex,isChangeAble}=useContext(context)

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
const PartSelect=React.memo(({context})=>{

    const {partArr,partsIndex,setPartsIndex,setIsSaveAble,isChangeAble}=useContext(context);
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
const StandardSelect=React.memo(({context})=>{
    const [selectAffix,setAffix]=useState(undefined);
    const {partsIndex,selfStand,setSelfStand,isChangeAble}=useContext(context);
    
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
                className="w-[160px] whitespace-pre"
              >
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


//自訂義有效詞條種類
const StandardSelect2=React.memo(({context})=>{
    const [selectAffix,setAffix]=useState(undefined);
    const {partsIndex,selfStand,setSelfStand,isChangeAble}=useContext(context);
    
    //監聽selectAffix
    useEffect(()=>{
        console.log(selectAffix);
        if(selectAffix!==undefined){
            let newItemArr = selectAffix.map((s)=>{
                return {
                    name:s,
                    value:1
                }
            });
            setSelfStand(newItemArr);
        }
            
    },[selectAffix])

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'inherit',
            outline: 'none',
            borderColor: 'white', // 可自訂邊框色
            color: 'white',
        }),
        input: (provided) => ({
            ...provided,
            color: 'white',
            backgroundColor: 'inherit'
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
            width: '100px', // ✅ 統一寬度，可視需求調整
            display: 'inline-block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#555' // 多選的 tag 背景
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#555' // 被選中的背景
                : state.isFocused
                ? '#444' // hover 時的背景
                : 'rgb(36, 36, 36)', // 預設背景
            color: 'white',
            cursor: 'pointer',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(36, 36, 36)',
        }),
    };
      

    if(partsIndex!==undefined){
        //依據所選部位 給出不同的選澤
        let target=AffixList.find((a)=>a.id===parseInt(partsIndex));
        //合併所有選項 並且移除重複值
        let mergedArray = [...new Set([...target.main, ...target.sub])];
        mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

        let options = mergedArray.map((affix)=>{
            return {
                value:affix,
                label:affix
            }
        });


        return(<Select isMulti
                       options={options}
                       styles={customStyles}
                       placeholder="請選擇"
                       onChange={(selected) => {setAffix(selected.map(opt => opt.value));}}
                        />)
    }else{
        return(<></>)
    }

});


//腳色選擇器
const CharSelect=React.memo(({context})=>{
    const {charID,setCharID,setIsSaveAble,isChangeAble}=useContext(context)
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
const RelicSelect=React.memo(({context})=>{
    const {RelicDataArr,relicIndex,setRelicIndex}=useContext(context);
    if(RelicDataArr.length !==0){
        let list = RelicDataArr.map((r,i)=>{
            const reliclink = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${r.relic.icon}`;
    
            return(
                <div className={`rounded-[50px] mx-2 mb-2 cursor-pointer p-2 border-[3px] max-[400px]:w-[45px] max-[400px]:h-[45px] max-[400px]:border-[2px] ${(relicIndex === i)?"border-yellow-600":"border-gray-300"}`} 
                    key={'RelicSelect'+i}
                    onClick={()=>setRelicIndex(i)}>
                    <img src={reliclink} alt='relic' width={50} height={50}/>
                </div>
            )
        })
    
        return(
            <div className='w-4/5 flex flex-col pt-1'>
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