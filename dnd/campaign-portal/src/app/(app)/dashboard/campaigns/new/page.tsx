'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {AlignLeft, ChevronLeft, Layers, Loader2, Palette, Save, ShieldCheck} from 'lucide-react';

import {useCampaign} from '@/lib/CampaignContext';
import {useUser} from "@/lib/UserContext";

export default function NewCampaignPage() {
    const router = useRouter();
    const {refreshCampaigns} = useCampaign();
    const {user} = useUser();

    const [name, setName] = useState('');
    const [summary, setSummary] = useState('');
    const [theme, setTheme] = useState('amber');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const token = localStorage.getItem('userToken');
        const API_HOST = process.env.NEXT_PUBLIC_API_HOST?.replace(/\/$/, '');

        // We go back to a flat structure but ensure property names
        // exactly match your C# CampaignModel properties.
        const payload = {
            Name: name,
            Summary: summary,
            Theme: theme,
            DungeonMasterId: user?.id,
            // The validator specifically asked for this object.
            // We provide a dummy object that fits the UserInfoModel shape.
            DungeonMaster: {
                Id: user?.id,
            }
        };

        try {
            const response = await fetch(`${API_HOST}/api/v1/Campaign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (data.errors) {
                    // This pulls "Name: The Name field is required" etc.
                    const messages = Object.entries(data.errors)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
                        .join(' | ');
                    throw new Error(messages);
                }
                throw new Error(data.title || data.message || 'Failed to forge campaign.');
            }

            await refreshCampaigns();

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    <span>Cancel</span>
                </button>
                <div className="flex items-center gap-2 text-amber-500/50">
                    <ShieldCheck size={20}/>
                    <span
                        className="text-xs font-bold uppercase tracking-widest text-slate-500">Dungeon Master Auth</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif text-white mb-2">Create New Campaign</h1>
                    <p className="text-slate-400">Your account will be assigned as the Dungeon Master of this world.</p>
                </div>

                {error && (
                    <div
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                            <Layers size={14}/> Campaign Title
                        </label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            placeholder="The Shattered Isles"
                        />
                    </div>

                    {/* Summary */}
                    <div>
                        <label
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                            <AlignLeft size={14}/> World Summary
                        </label>
                        <textarea
                            rows={4}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                            placeholder="A brief overview of the setting..."
                        />
                    </div>

                    {/* Theme */}
                    <div>
                        <label
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                            <Palette size={14}/> Interface Theme
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setTheme('amber')}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                    theme === 'amber'
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                                }`}
                            >
                                <span className={theme === 'amber' ? 'text-amber-500 font-bold' : 'text-slate-400'}>Amber Fantasy</span>
                                <div className="w-3 h-3 rounded-full bg-amber-500"/>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTheme('blue')}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                    theme === 'blue'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                                }`}
                            >
                                <span className={theme === 'blue' ? 'text-blue-500 font-bold' : 'text-slate-400'}>Mystic Blue</span>
                                <div className="w-3 h-3 rounded-full bg-blue-500"/>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name}
                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20}/>
                        ) : (
                            <>
                                <Save size={20}/>
                                <span>Forge World</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}