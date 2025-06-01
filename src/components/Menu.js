import Link from 'next/link';
import Image from 'next/image';
import '@/css/globals.css';

const list=[{
    link:'/simulator',
    name:'遺器重洗模擬',
    engname:'simulator',
    image:'simulator.png',
    mode: '手動輸入',
    description:"遺器只存在於背包中，請點我"
},{
    link:'/import',
    name:'遺器重洗匯入',
    engname:'importer',
    image:'importer.png',
    mode:'API自動匯入',
    description:"查詢展示櫃角色身上的遺器，請點我"
}];;


function Menu({children}) {
    return (
        <div className='my-3 sticky top-0 w-[100%] z-[100] pt-2 bg-[rgb(49,48,48)]'>
            <div className='flex flex-row w-4/5 mx-auto max-[400px]:w-[90%]'>
              {list.map((m, i) => (
                  <div
                      className='mr-3 flex flex-col bg-gray-700 min-w-[100px] rounded-md justify-center px-2'
                      key={'menu' + i}>
                      <Link href={m.link} className='text-center'>
                        <span className='text-gray-500 font-bold text-lg max-[400px]:text-sm'>
                          {m.name}
                        </span>
                      </Link>
                      <span className='text-lg text-gray-400 text-center max-[400px]:text-sm'>
                        {m.engname}
                      </span>
                  </div>
              ))}
            </div>
            <div>
              {children}
            </div>
        </div>
    );
}

function MainMenu(){
    return(
        <div className='w-[100%] h-[80vh] top-[5vh] relative'>
            <div className='w-4/5 flex flex-col mx-auto'>
                <div className='text-center h-[15vh] flex flex-col'>
                    <div className='flex flex-col'>
                        <span className='font-bold text-2xl text-gray-200'>遺器重洗模擬器 </span>
                        <span className='font-bold text-xl text-gray-200'>Relic Simulator</span>
                    </div>
                    <div className='mt-3'>
                        <span>能夠根據每件遺器的初始屬性，完整模擬及統計所有可能的強化組合，讓你預先了解該遺器潛力!</span>
                    </div>
                </div>
                <div className='flex flex-row justify-evenly mx-auto w-[100%] mt-[5vh]'>
                    {list.map((m, i) => (
                        <div key={'menu' + i} className='w-2/5 flex flex-col'>
                            <div className='w-1/2 min-w-[30vw] mb-5 text-center h-[50px] bg-gray-700 rounded-sm mx-auto flex flex-col justify-center arrow-down-box relative'>
                                <span className='font-bold'>{m.description}</span>
                            </div>
                            <Link href={m.link} className='text-center'>
                                <div className='flex flex-col bg-gray-700 rounded-sm hover:bg-gray-600'>
                                    <div className='flex flex-col justify-center my-2'>
                                        <Image 
                                            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/${m.image}`}
                                            alt="Logo"
                                            width={200}
                                            height={200}
                                        className='mx-auto'/>
                                        <span className='text-xl text-gray-400 font-bold'>{m.mode}</span>
                                        <span className='text-lg text-gray-400 font-bold'>{m.engname}</span>
                                    </div> 
                                </div>
                            </Link>
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export {MainMenu,Menu};
