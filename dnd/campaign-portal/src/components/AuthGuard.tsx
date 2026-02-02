'use client';

import { useUser } from '@/lib/UserContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading: contextLoading, login } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [isVerifying, setIsVerifying] = useState(true);
    const hasChecked = useRef(false);

    useEffect(() => {
        const verify = async () => {
            const token = localStorage.getItem('userToken');
            const isLoginPage = pathname === '/login';

            if (!token) {
                setIsVerifying(false);
                if (!isLoginPage) router.replace('/login');
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/token/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ accessToken: token }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.message?.toLowerCase().includes('valid')) {
                        if (!user) await login('player');
                        if (isLoginPage) router.replace('/');
                    }
                } else {
                    localStorage.removeItem('userToken');
                    if (!isLoginPage) router.replace('/login');
                }
            } catch (e) {
                console.error("Verification error", e);
            } finally {
                setIsVerifying(false);
            }
        };

        if (!hasChecked.current || pathname === '/login') {
            verify();
            hasChecked.current = true;
        }
    }, [pathname, router, login, user]);

    // Show loading if we're not on the login page and we're verifying or context is loading
    const showLoader = pathname !== '/login' && (isVerifying || contextLoading);

    if (showLoader) {
        return (
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-amber-500 mx-auto" size={40}/>
                    <p className="text-slate-400 text-lg font-serif italic">Verifying Credentials...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}