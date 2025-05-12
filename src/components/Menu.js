// components/Menu.js
import Link from 'next/link';

const list = [
  {
    link: '/',
    name: '遺器重洗模擬器',
    engname: 'simulator',
  },
  {
    link: '/import',
    name: '遺器重洗匯入',
    engname: 'import',
  }
];

export default function Menu({children}) {
  return (
    <div className='my-3 sticky top-0 w-[100%] z-[100] pt-2 bg-[rgb(49,48,48)]'>
      <div className='flex flex-row w-4/5 mx-auto max-[400px]:w-[90%]'>
        {list.map((m, i) => (
          <div
            className='mr-3 flex flex-col bg-gray-700 min-w-[100px] rounded-md justify-center px-2'
            key={'menu' + i}
          >
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
