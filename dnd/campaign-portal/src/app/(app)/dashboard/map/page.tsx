'use client';

import { Layers } from 'lucide-react';
import { useCampaign } from '@/lib/CampaignContext';

export default function MapPage() {
  const { activeCampaign } = useCampaign();
  const bgClass = activeCampaign?.campaignTheme === 'blue' ? 'bg-blue-600' : 'bg-amber-600';

  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-600">
      <Layers size={48} className="mb-4 opacity-20" />
      <p className="text-xl font-serif uppercase tracking-widest opacity-50">map system ready</p>
      <button className={`mt-4 px-6 py-2 ${bgClass} text-white rounded-lg font-bold`}>
        Add Entry
      </button>
    </div>
  );
}
