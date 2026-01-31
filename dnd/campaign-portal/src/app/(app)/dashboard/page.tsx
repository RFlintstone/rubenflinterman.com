'use client';

import {Book, Map as MapIcon, Shield, Users} from 'lucide-react';
import {Card} from '@/components/Card';
import {useCampaign} from '@/lib/CampaignContext';

export default function DashboardPage() {
    const {activeCampaign} = useCampaign();
    const themeColor = activeCampaign?.theme === 'blue' ? 'blue' : 'amber';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title={activeCampaign?.name ? activeCampaign.name : "Adventure"} icon={Book} theme={themeColor} className="col-span-full">
                {(activeCampaign?.summary) ? (
                    <p className="text-slate-400 italic">{activeCampaign.summary}</p>
                ) : (
                    <p className="text-slate-400 italic">No summary recorded for {activeCampaign?.name} yet.</p>
                )}
            </Card>

            <Card title="Active Quests" icon={Shield} theme={themeColor}>
                <div
                    className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    No active quests
                </div>
            </Card>

            <Card title="Party Status" icon={Users} theme={themeColor}>
                <div
                    className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    No party members
                </div>
            </Card>

            <Card title="Location" icon={MapIcon} theme={themeColor}>
                <div
                    className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    No location set
                </div>
            </Card>
        </div>
    );
}
