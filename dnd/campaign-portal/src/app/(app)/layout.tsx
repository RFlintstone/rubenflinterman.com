'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Book, ChevronDown, Compass, Layers, LogOut, Map as MapIcon, Plus, Quote, Users } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { useCampaign } from '@/lib/CampaignContext';
import { SidebarItem } from '@/components/SidebarItem';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useUser();
    const { campaigns, activeCampaign, setActiveCampaign } = useCampaign();
    const [isCampaignMenuOpen, setIsCampaignMenuOpen] = useState(false);

    // 1. REDIRECT IF NO USER
    useEffect(() => {
        if (!user) router.push('/login');
    }, [user, router]);

    // 2. DERIVED STATE (The "No-Spam" Secret)
    // We calculate this on every render. No API calls needed.
    const isDM = useMemo(() => {
        if (!user || !activeCampaign) return false;
        const dmId = activeCampaign.dungeonMasterId || activeCampaign.dungeonmaster?.id;
        return user.id?.toString() === dmId?.toString();
    }, [user, activeCampaign]);

    if (!user) return null;

    // 3. INSTANT SWITCH LOGIC
    const handleCampaignSwitch = (campaign: any) => {
        setActiveCampaign(campaign);
        localStorage.setItem('campaignId', campaign.id);
        setIsCampaignMenuOpen(false);
        // We don't call refreshUser here anymore! The 'isDM' memo handles it.
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // UI THEMING
    const themeColor = activeCampaign?.campaignTheme === 'blue' ? 'blue' : 'amber';
    const bgClass = themeColor === 'blue' ? 'bg-blue-600' : 'bg-amber-600';
    const activeTextClass = themeColor === 'blue' ? 'text-blue-500' : 'text-amber-500';

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
            <div className="flex">
                {/* --- DESKTOP SIDEBAR --- */}
                <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#0d1117] border-r border-slate-800 p-6">
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
                                        <h1 className="font-serif font-bold text-sm text-white">Select World</h1>
                                    ) : (
                                        <>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Active World</p>
                                            <h1 className="font-serif font-bold text-sm text-white truncate max-w-[120px]">{activeCampaign.name}</h1>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isCampaignMenuOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {/* CAMPAIGN DROPDOWN */}
                        {isCampaignMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden flex flex-col">
                                <div className="max-h-60 overflow-y-auto">
                                    {campaigns.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleCampaignSwitch(c)}
                                            className={`w-full p-4 hover:bg-slate-800 text-left text-sm border-b border-slate-800 transition-colors ${activeCampaign?.id === c.id ? activeTextClass + ' bg-slate-800/30' : 'text-slate-400'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => { setIsCampaignMenuOpen(false); router.push('/dashboard/campaigns/new'); }}
                                    className="w-full p-4 bg-slate-800/80 hover:bg-slate-700 text-amber-500 text-sm font-bold flex items-center justify-center gap-2 border-t border-slate-700"
                                >
                                    <Plus size={16} />
                                    <span>Forge New World</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarItem icon={Compass} label="Dashboard" active={pathname === '/dashboard'} onClick={() => router.push('/dashboard')} color={themeColor}/>
                        {activeCampaign && (
                            <>
                                <SidebarItem icon={Quote} label="Quotes" active={pathname === '/dashboard/quotes'} onClick={() => router.push('/dashboard/quotes')} color={themeColor}/>
                                <SidebarItem icon={Book} label="Lore" active={pathname === '/dashboard/lore'} onClick={() => router.push('/dashboard/lore')} color={themeColor}/>
                                <SidebarItem icon={Users} label="The Party" active={pathname === '/dashboard/party'} onClick={() => router.push('/dashboard/party')} color={themeColor}/>
                                <SidebarItem icon={MapIcon} label="Map" active={pathname === '/dashboard/map'} onClick={() => router.push('/dashboard/map')} color={themeColor}/>
                            </>
                        )}
                    </nav>

                    {/* USER PROFILE SECTION */}
                    <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs">
                            <p className="text-slate-500">Authenticated as</p>
                            <p className="font-bold text-slate-200">
                                {user.username}
                                <span className={`ml-1 ${isDM ? 'text-amber-500' : 'text-blue-400'}`}>
                                    ({isDM ? 'DM' : 'Player'})
                                </span>
                            </p>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white transition-colors">
                            <LogOut size={18}/>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* BACKGROUND DECORATION */}
            <div className={`fixed top-0 right-0 w-[500px] h-[500px] ${activeCampaign?.campaignTheme === 'blue' ? 'bg-blue-900/10' : 'bg-amber-900/10'} rounded-full blur-[120px] pointer-events-none -z-10`}></div>
        </div>
    );
}