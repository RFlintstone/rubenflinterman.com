'use client';

import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Book, ChevronDown, Compass, Layers, LogOut, Map as MapIcon, Quote, Users} from 'lucide-react';
import {useUser} from '@/lib/UserContext';
import {useCampaign} from '@/lib/CampaignContext';
import {SidebarItem} from '@/components/SidebarItem';

export default function AppLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const {user, logout} = useUser();
    const {campaigns, activeCampaign, setActiveCampaign} = useCampaign();
    const [isCampaignMenuOpen, setIsCampaignMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const themeColor = activeCampaign?.theme === 'blue' ? 'blue' : 'amber';
    const bgClass = themeColor === 'blue' ? 'bg-blue-600' : 'bg-amber-600';

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
            <div className="flex">
                {/* Sidebar */}
                <aside
                    className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#0d1117] border-r border-slate-800 p-6">

                    <div className="relative mb-6">
                        <button
                            onClick={() => setIsCampaignMenuOpen(!isCampaignMenuOpen)}
                            className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-all group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${bgClass} shadow-lg`}>
                                    <Layers className="text-white" size={20}/>
                                </div>
                                <div className="text-left">
                                    {!activeCampaign ? (
                                        <>
                                            <h1 className="font-serif font-bold text-sm text-white truncate max-w-[120px]">Soon
                                                <span className="align-text-top text-xs font-sans">™</span>
                                            </h1>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">World</p>
                                            <h1 className="font-serif font-bold text-sm text-white truncate max-w-[120px]">{activeCampaign?.name}</h1>
                                        </>
                                    )}

                                </div>
                            </div>
                            <ChevronDown size={16}
                                         className={`text-slate-500 transition-transform ${isCampaignMenuOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {isCampaignMenuOpen && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                                {campaigns.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setActiveCampaign(c);
                                            setIsCampaignMenuOpen(false);
                                        }}
                                        className="w-full p-4 hover:bg-slate-800 text-left text-sm text-slate-400 border-b border-slate-800 last:border-0"
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarItem icon={Compass} label="Dashboard" active={pathname === '/dashboard'}
                                     onClick={() => router.push('/dashboard')} color={themeColor}/>

                        {/* If user doesn't have campaigns */}
                        {activeCampaign ? (
                            <>
                                <SidebarItem icon={Quote} label="Quotes" active={pathname === '/quotes'}
                                             onClick={() => router.push('/quotes')} color={themeColor}/>
                                <SidebarItem icon={Book} label="Lore" active={pathname === '/lore'}
                                             onClick={() => router.push('/lore')} color={themeColor}/>
                                <SidebarItem icon={Users} label="The Party" active={pathname === '/party'}
                                             onClick={() => router.push('/party')} color={themeColor}/>
                                <SidebarItem icon={MapIcon} label="Map" active={pathname === '/map'}
                                             onClick={() => router.push('/map')} color={themeColor}/>
                            </>
                        ) : null}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs">
                            <p className="text-slate-500">Logged in as</p>
                            <p className="font-bold text-slate-200">{user.name}</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white">
                            <LogOut size={18}/>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Background Decorative Gradient */}
            <div
                className={`fixed top-0 right-0 w-[500px] h-[500px] ${activeCampaign?.theme === 'blue' ? 'bg-blue-900/10' : 'bg-amber-900/10'} rounded-full blur-[120px] pointer-events-none -z-10`}></div>
        </div>
    );
}
