import { redirect } from 'next/navigation';

export default function NotFound() {
    redirect('/'); // 伺服器直接導向首頁
}