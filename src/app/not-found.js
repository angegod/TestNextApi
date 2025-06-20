'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // 自動導回首頁或其他頁面
    router.replace('/')
  }, [])

  return (
        <div className='w-4/5 mx-auto'>
            <p>非法頁面，正在導回首頁...</p>
        </div>
  )
}
