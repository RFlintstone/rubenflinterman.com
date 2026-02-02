'use client';

import { Book, Edit3, Map as MapIcon, Shield, Users, Save, X } from 'lucide-react';
import { Card } from '@/components/Card';
import { useCampaign } from '@/lib/CampaignContext';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function DashboardPage() {
    const { quests, party, activeCampaign, updateCampaign } = useCampaign();
    const { user } = useUser();
    const router = useRouter();

    const isDM = useMemo(() => {
        // If no user or no active campaign, return false
        if (!user?.id || !activeCampaign) return false;

        // Compare user ID with DM ID from campaign
        const dmId = activeCampaign.dungeonmaster?.id || activeCampaign.dungeonMasterId;

        // Return boolean comparison (case-insensitive)
        return user.id.toString().toLowerCase() === dmId?.toString().toLowerCase();
    }, [user?.id, activeCampaign]);

    const themeColor = activeCampaign?.campaignTheme === 'blue' ? 'blue' : 'amber';

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedSummary, setEditedSummary] = useState('');
    const [editedTheme, setEditedTheme] = useState('');

    // 2. SYNC STATE ON CAMPAIGN CHANGE
    useEffect(() => {
        setIsEditing(false);
        setEditedTitle(activeCampaign?.name || '');
        setEditedSummary(activeCampaign?.summary || '');
        setEditedTheme(activeCampaign?.campaignTheme || 'amber');
    }, [activeCampaign]);

    const handleSave = async () => {
        if (!activeCampaign) return;

        // Pass the updates to your context
        await updateCampaign({
            ...activeCampaign,
            name: editedTitle,
            summary: editedSummary,
            campaignTheme: editedTheme
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTitle(activeCampaign?.name || '');
        setEditedSummary(activeCampaign?.summary || '');
        setEditedTheme(activeCampaign?.campaignTheme || 'amber');
        setIsEditing(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {!activeCampaign ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-600 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700">
                    <MapIcon size={48} className="mb-4 opacity-20 text-slate-500"/>
                    <p className="text-2xl font-serif uppercase tracking-widest text-slate-300">No Active Campaign</p>
                    <p className="mt-2 text-slate-400 text-center">
                        Select a world from the sidebar or create a new one.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* CAMPAIGN OVERVIEW CARD */}
                    <Card
                        title={isEditing ? "Edit World Details" : activeCampaign.name}
                        icon={Book}
                        theme={themeColor}
                        className="col-span-full relative"
                    >
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Campaign Title</label>
                                        <input
                                            type="text"
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Interface Theme</label>
                                        <select
                                            value={editedTheme}
                                            onChange={(e) => setEditedTheme(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                                        >
                                            <option value="amber">Amber Fantasy</option>
                                            <option value="blue">Mystic Blue</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">World Summary</label>
                                    <textarea
                                        rows={4}
                                        value={editedSummary}
                                        onChange={(e) => setEditedSummary(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none transition-all"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-slate-300 leading-relaxed italic">
                                    {activeCampaign.summary || "No summary recorded for this world yet."}
                                </p>
                            </div>
                        )}

                        {/* DM ACTIONS */}
                        {isDM && (
                            <div className="absolute top-6 right-6 flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleCancel} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Cancel">
                                            <X size={20}/>
                                        </button>
                                        <button onClick={handleSave} className="p-2 text-amber-500 hover:text-amber-400 transition-colors" title="Save Changes">
                                            <Save size={20}/>
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                        <Edit3 size={18}/>
                                    </button>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* QUESTS CARD */}
                    <Card title="Active Quests" icon={Shield} theme={themeColor}>
                        {isDM && (
                            <button className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white" onClick={() => router.push('/dashboard/edit-quests')}>
                                <Edit3 size={18}/>
                            </button>
                        )}
                        {quests && quests?.active?.length > 0 ? (
                            quests?.active.map((q: any) => (
                                <div key={q.id} className="mb-4 last:mb-0 group">
                                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-amber-500 transition-colors">{q.title}</h3>
                                    <p className="text-sm text-slate-400 leading-snug">{q.description}</p>
                                    <hr className="border-slate-800 mt-4"/>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-600 text-sm py-8 text-center border-2 border-dashed border-slate-800/50 rounded-2xl italic">
                                No active quests recorded.
                            </div>
                        )}
                    </Card>

                    {/* PARTY CARD */}
                    <Card
                        title="The Party"
                        icon={Users}
                        theme={themeColor}
                        className="cursor-pointer hover:border-slate-600 transition-colors"
                        onClick={() => router.push('/dashboard/party')}
                    >
                        {party?.length > 0 ? (
                            party.filter((c: any) => !c.name.includes("[NPC]")).map((c: any) => (
                                <div key={c.id} className="mb-4 last:mb-0">
                                    <h3 className="text-lg font-bold text-slate-200">{c.name}</h3>
                                    {c.dndBeyondUrl && (
                                        <a href={c.dndBeyondUrl} target="_blank" className="text-xs text-amber-600 hover:underline">View D&D Beyond Sheet</a>
                                    )}
                                    <hr className="border-slate-800 mt-4"/>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-600 text-sm py-8 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                                No heroes found.
                            </div>
                        )}
                    </Card>

                    {/* MAP/LOCATION CARD */}
                    <Card title="Current Location" icon={MapIcon} theme={themeColor}>
                        {isDM && (
                            <button className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white" onClick={() => router.push('/dashboard/map')}>
                                <Edit3 size={18}/>
                            </button>
                        )}
                        <div className="text-slate-600 text-sm py-8 text-center border-2 border-dashed border-slate-800/50 rounded-2xl italic">
                            Region unknown.
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}