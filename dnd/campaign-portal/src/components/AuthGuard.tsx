'use client';

import {useUser} from '@/lib/UserContext';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {Loader2} from 'lucide-react';

export function AuthGuard({children}: { children: React.ReactNode }) {
    const {user, isLoading} = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/token/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({accessToken: token}),
                });

                if (!response.ok) {
                    router.push('/login');
                }

                const responseData = await response.json();
                if (response.ok && responseData.message.toString().toLowerCase() === 'token valid.') {
                    // If we are on login page and token is valid, redirect to dashboard
                    if (pathname === '/login') {
                        router.push('/dashboard');
                    }
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                router.push('/login');
            }
        };

        // Verify token on page load
        verifyToken();

        // Set up interval to verify token periodically
        const interval = setInterval(verifyToken, 1 * 60 * 1000); // Every minute

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [router.push]);

    // Prevent "Flicker": Don't show the dashboard if we are still loading
    // or if we are about to redirect to login.
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={40}/>
            </div>
        );
    }

    // If we are on login page, or we have a user, show the content
    return <>{children}</>;
}