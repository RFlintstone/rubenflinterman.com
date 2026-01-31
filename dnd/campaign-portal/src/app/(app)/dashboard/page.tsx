'use client';

import {Book, Map as MapIcon, Shield, Users} from 'lucide-react';
import {Card} from '@/components/Card';
import {useCampaign} from '@/lib/CampaignContext';

export default function DashboardPage() {
    const {quests, party, activeCampaign} = useCampaign();
    const themeColor = activeCampaign?.theme === 'blue' ? 'blue' : 'amber';

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
                        title={activeCampaign.name || "Adventure"}
                        icon={Book}
                        theme={themeColor}
                        className="col-span-full"
                    >
                        <p className="text-slate-400 italic">
                            {activeCampaign.summary || `No summary recorded for ${activeCampaign.name} yet.`}
                        </p>
                    </Card>

                    <Card title="Active Quests" icon={Shield} theme={themeColor}>
                        {quests && quests.active && quests.active.length > 0 ? (
                                quests.active.map((q) => (
                                    <div key={q.id} className="mb-4 last:mb-0">
                                        <h3 className="text-lg font-bold text-slate-300">{q.title}</h3>
                                        <p className="text-sm text-slate-400">{q.description}</p>
                                        <hr className="border-slate-700 my-4"/>
                                    </div>
                                ))
                            ) : (
                                <div
                                    className="text-slate-500 text-sm py-8 text-center border-2 border-dashed
                                    border-slate-800 rounded-xl">
                                    No active quests
                                </div>
                            )
                        }
                    </Card>

                    <Card title="Party Status" icon={Users} theme={themeColor}>
                        <>
                            {party && party.length > 0 ? (
                                    party.map((c) => (
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

                    <Card title="Location" icon={MapIcon} theme={themeColor}>
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