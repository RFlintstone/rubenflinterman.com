'use client';

import { Layers, X, ChevronDown } from 'lucide-react'; // Added ChevronDown
import { useCampaign } from '@/lib/CampaignContext';
import { useState } from "react";

export default function QuotesPage() {
    // Campaign
    const { party, activeCampaign } = useCampaign();

    // Theme logic - added optional chaining for safety
    const isBlue = activeCampaign?.theme === 'blue';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';
    const hoverClass = isBlue ? 'hover:bg-blue-700' : 'hover:bg-amber-700';
    const ringClass = isBlue ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

    // Quotes Page State
    const [isQuotePromptOpen, setIsQuotePromptOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-600">
            <Layers size={48} className="mb-4 opacity-20"/>
            <p className="text-xl font-serif uppercase tracking-widest opacity-50">quotes system ready</p>
            <button
                onClick={() => setIsQuotePromptOpen(true)}
                className={`mt-4 px-6 py-2 ${bgClass} ${hoverClass} text-white rounded-lg font-bold transition-colors shadow-md`}
            >
                Add Entry
            </button>

            {/* Modal Overlay */}
            {isQuotePromptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">New Quote</h2>
                            <button onClick={() => setIsQuotePromptOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsQuotePromptOpen(false); }}>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Who said it?</label>
                                <div className="relative">
                                    <select
                                        className={`w-full border border-slate-200 rounded-md p-2 bg-white outline-none focus:ring-2 ${ringClass} appearance-none text-slate-700`}
                                        defaultValue=""
                                        required
                                    >
                                        <option value="" disabled>Select a character</option>

                                        {party?.map((char) => (
                                            <option key={char.id} value={char.id}>
                                                {char.name}
                                            </option>
                                        ))}

                                        {/* Simplified Empty Check */}
                                        {(!party || party.length === 0) && (
                                            <>
                                                <option value="dm">The DM</option>
                                                <option value="npc">Random NPC</option>
                                            </>
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Date/In-Game Day</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 14th of Mirtul"
                                    className={`w-full border border-slate-200 rounded-md p-2 outline-none focus:ring-2 ${ringClass}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">The Quote</label>
                                <textarea
                                    rows={3}
                                    placeholder="Write it down before you forget..."
                                    className={`w-full border border-slate-200 rounded-md p-2 outline-none focus:ring-2 ${ringClass}`}
                                />
                            </div>

                            <button type="submit" className={`w-full py-3 ${bgClass} ${hoverClass} text-white rounded-lg font-bold mt-2 shadow-lg transition-all active:scale-[0.98]`}>
                                Save to Campaign
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}