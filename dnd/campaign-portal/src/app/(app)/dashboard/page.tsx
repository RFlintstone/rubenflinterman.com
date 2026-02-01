'use client';

import {Book, Edit3, Map as MapIcon, Shield, Users} from 'lucide-react';
import {Card} from '@/components/Card';
import {useCampaign} from '@/lib/CampaignContext';
import {useUser} from '@/lib/UserContext';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function DashboardPage() {
    const {quests, party, activeCampaign, updateCampaign} = useCampaign();
    const {user} = useUser();
    const router = useRouter();
    const themeColor = activeCampaign?.campaignTheme === 'blue' ? 'blue' : 'amber';

    const isDM = user?.role === 'dm';

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(activeCampaign?.name || '');
    const [editedCampaignTheme, setEditedCampaignTheme] = useState(activeCampaign?.name || '');
    const [editedSummary, setEditedSummary] = useState(activeCampaign?.summary || '');

    const handleSave = () => {
        updateCampaign({name: editedTitle, campaignTheme: editedCampaignTheme, summary: editedSummary}); // Update the campaign
        setIsEditing(false);
    };

    useEffect(() => {
        setIsEditing(false);
        setEditedTitle(activeCampaign?.name || '');
        setEditedCampaignTheme(activeCampaign?.campaignTheme || '');
        setEditedSummary(activeCampaign?.summary || '');
    }, [activeCampaign?.id]);

    return (
        <div className="max-w-7xl mx-auto p-4">
            {!activeCampaign ? (
                /* Empty State */
                <div
                    className="flex flex-col items-center justify-center h-64 text-slate-600 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-2xl border border-slate-700">
                    <MapIcon size={48} className="mb-4 opacity-20 text-slate-500"/>
                    <p className="text-2xl font-serif uppercase tracking-widest text-slate-300">No Active Campaign</p>
                    <p className="mt-2 text-slate-400 text-center">
                        You are not currently enrolled in any campaigns. <br className="mb-2"/>
                        <i>Contact your Dungeon Master to join a campaign.</i>
                    </p>
                </div>
            ) : (
                /* Dashboard Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card
                        title={isEditing ? editedTitle : activeCampaign.name || "Adventure"}
                        icon={Book}
                        theme={themeColor}
                        className="col-span-full relative"
                    >
                        {isEditing ? (
                            <>
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="summary" className="text-white">
                                        Title:
                                    </label>
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="w-full bg-transparent border border-slate-500 text-white p-2 rounded focus:outline-none"
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="summary" className="text-white">
                                        Summary:
                                    </label>
                                    <textarea
                                        id="summary"
                                        value={editedSummary}
                                        onChange={(e) => setEditedSummary(e.target.value)}
                                        className="w-full bg-transparent border border-slate-500 text-white p-2 rounded focus:outline-none"
                                    />
                                </div>
                                {isDM && (
                                    <div className="flex flex-col space-y-2">
                                        <p>Theme:</p>
                                        <input
                                            type="text"
                                            value={editedCampaignTheme}
                                            onChange={(e) => setEditedCampaignTheme(e.target.value)}
                                            className="bg-transparent border border-slate-500 text-white p-1 rounded focus:outline-none"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-slate-400 italic">
                                    Summary: {activeCampaign.summary || `No summary recorded for ${activeCampaign.name} yet.`}
                                </p>
                                {isDM && (
                                    <p className="text-slate-400 mt-2">
                                        Theme: {activeCampaign.campaignTheme || "Not set"}
                                    </p>
                                )}
                            </>
                        )}
                        {isDM && (
                            <div className="absolute top-6 right-4">
                                <button
                                    className="p-2 text-slate-500 hover:text-white"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();
                                        } else {
                                            setIsEditing(true);
                                        }
                                    }}
                                >
                                    {isEditing ? "Save" : <Edit3 size={18}/>}
                                </button>
                            </div>
                        )}
                    </Card>

                    <Card title="Active Quests" icon={Shield} theme={themeColor}>
                        {isDM && (
                            <button
                                className="absolute top-6 right-4 p-2 text-slate-500 hover:text-white"
                                onClick={() => router.push('/dashboard/edit-quests')}
                            >
                                <Edit3 size={18}/>
                            </button>
                        )}
                        {Array.isArray(quests?.active) && quests.active.length > 0 ? (
                            quests.active.map((q) => (
                                <div key={q.id} className="mb-4 last:mb-0">
                                    <h3 className="text-lg font-bold text-slate-300">{q.title}</h3>
                                    <p className="text-sm text-slate-400">{q.description}</p>
                                    <hr className="border-slate-700 my-4"/>
                                </div>
                            ))
                        ) : (
                            <div
                                className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                                No active quests
                            </div>
                        )}
                    </Card>

                    <div
                        className="cursor-pointer"
                        onClick={() => router.push('/dashboard/party')}
                    >
                        <Card
                            title="Party Status"
                            icon={Users}
                            theme={themeColor}
                            className="cursor-pointer"
                        >
                            {isDM && (
                                <button
                                    className="absolute top-6 right-4 p-2 text-slate-500 hover:text-white"
                                    onClick={() => router.push('/dashboard/party')}
                                >
                                    <Edit3 size={18}/>
                                </button>
                            )}
                            <>
                                {party && party.length > 0 ? (
                                        // Display party members, excluding NPCs
                                        party.filter(c => !c.name.includes("[NPC]")).map((c) => (
                                            <div key={c.id}>
                                                <div className="mb-4 last:mb-0">
                                                    <h3 className="text-lg font-bold text-slate-300">{c.name}</h3>
                                                    {c.dndBeyondUrl ? (
                                                        <p className="text-sm text-slate-400"><a href={c.dndBeyondUrl}>Click
                                                            here to go to dndbeyond</a></p>
                                                    ) : null}
                                                </div>
                                                <hr className="border-slate-700 my-4"/>
                                            </div>
                                        ))
                                    ) :
                                    <div
                                        className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                                        No party members
                                    </div>
                                }
                            </>
                        </Card>
                    </div>

                    <Card title="Location" icon={MapIcon} theme={themeColor}>
                        {isDM && (
                            <button
                                className="absolute top-6 right-4 p-2 text-slate-500 hover:text-white"
                                onClick={() => router.push('/dashboard/edit-location')}
                            >
                                <Edit3 size={18}/>
                            </button>
                        )}
                        <div
                            className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                            No location set
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}