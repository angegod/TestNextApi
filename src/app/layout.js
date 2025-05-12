import '@/css/globals.css';
// app/layout.js
import Menu from '@/components/Menu'
import Footer from '@/components/Footer'

export default function Layout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <Menu />
        <div className='min-h-[100vh]'>
            {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
