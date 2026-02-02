'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useUser} from '@/lib/UserContext';

export default function RootPage() {
    const router = useRouter();
    const {user} = useUser();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [user, router]);

    return (
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
            <div className="text-slate-400">Loading...</div>
        </div>
    );
}
