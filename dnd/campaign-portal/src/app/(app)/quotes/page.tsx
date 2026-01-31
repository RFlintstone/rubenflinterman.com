'use client';

import {ChevronDown, Layers, X} from 'lucide-react';
import {useCampaign} from '@/lib/CampaignContext';
import {useEffect, useState} from "react";

export default function QuotesPage() {
    type Quote = {
        id: string;
        text: string;
        author: string;
        campaignId: string;
        createdAt: string;
        updatedAt: string;
    };

    const {campaigns, party, activeCampaign} = useCampaign();
    const [isQuotePromptOpen, setIsQuotePromptOpen] = useState(false);
    const [quotes, setQuotes] = useState<{
        totalQuotes: number;
        recent: Quote[];
        all: Quote[];
    }>({
        totalQuotes: 0,
        recent: [],
        all: [],
    });
    const [loading, setLoading] = useState(true);

    const isBlue = activeCampaign?.theme === 'blue';
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-amber-600';
    const hoverClass = isBlue ? 'hover:bg-blue-700' : 'hover:bg-amber-700';
    const ringClass = isBlue ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

    // Fetch Quotes on Mount or when Campaign changes
    useEffect(() => {
        const fetchQuotes = async () => {
            if (!activeCampaign?.id) return;

            const userToken = localStorage.getItem('userToken');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign.id}`, {
                    headers: {'Authorization': `Bearer ${userToken}`}
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuotes(data.quotes || []);
                }
            } catch (err) {
                console.error("Failed to fetch quotes", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [activeCampaign?.id]);

    const handleSaveQuote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userToken = localStorage.getItem('userToken');

        // Extract data from the form
        const formData = new FormData(e.currentTarget);
        const quoteData = {
            text: formData.get('text'),
            author: formData.get('author'),
            // Optionally include the date if your model supports it
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${activeCampaign?.id}/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(quoteData)
            });

            if (response.ok) {
                const newQuote = await response.json();
                setQuotes(prev => ({
                    ...prev,
                    all: [...prev.all, newQuote],
                    totalQuotes: prev.totalQuotes + 1,
                }));
                setIsQuotePromptOpen(false);
            }
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-64 text-slate-600">
            {/* List existing quotes or show empty state */}
            {Array.isArray(quotes?.all) && quotes.all.length > 0 ? (
                <div className="w-full max-w-2xl space-y-6 mb-8">
                    {quotes.all.map((q: Quote, i: number) => (
                        <div
                            key={i}
                            className="p-6 bg-gradient-to-r from-blue-500/10 to-amber-500/10 border border-slate-700 rounded-xl shadow-md text-center"
                        >
                            <p className="text-lg font-serif italic text-slate-300">
                                "{q.text}"
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-400">
                                — {q.author}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <Layers size={48} className="mb-4 opacity-20"/>
                    <p className="text-xl font-serif uppercase tracking-widest opacity-50">quotes system ready</p>
                </>
            )}

            <button
                onClick={() => setIsQuotePromptOpen(true)}
                className={`mt-4 px-6 py-2 ${bgClass} ${hoverClass} text-white rounded-lg font-bold transition-colors shadow-md`}
            >
                Add Entry
            </button>

            {isQuotePromptOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">New Quote</h2>
                            <button onClick={() => setIsQuotePromptOpen(false)}
                                    className="text-slate-400 hover:text-slate-600">
                                <X size={24}/>
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleSaveQuote}>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Who said it?</label>
                                <div className="relative">
                                    <select
                                        name="author"
                                        className={`w-full border border-slate-200 rounded-md p-2 bg-white outline-none focus:ring-2 ${ringClass} appearance-none text-slate-700`}
                                        defaultValue=""
                                        required
                                    >
                                        <option value="" disabled>Select a character</option>
                                        {Array.isArray(party) ? party.map((char) => (
                                            <option key={char.id} value={char.name}>{char.name}</option>
                                        )) : null}
                                        <option value={activeCampaign?.dungeonmaster?.username || "The DM"}>
                                            {activeCampaign?.dungeonmaster?.username
                                                ? `${activeCampaign.dungeonmaster.username} (The DM)`
                                                : "The DM"}
                                        </option>
                                        {(!party || party.length === 0) && (
                                            <>
                                                <option value="The DM">The DM</option>
                                                <option value="NPC">Random NPC</option>
                                            </>
                                        )}
                                    </select>
                                    <ChevronDown
                                        className="pointer-events-none absolute inset-y-0 right-2 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={16}/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">The Quote</label>
                                <textarea
                                    name="text"
                                    rows={3}
                                    placeholder="Write it down..."
                                    className={`w-full border border-slate-200 rounded-md p-2 outline-none focus:ring-2 ${ringClass}`}
                                    required
                                />
                            </div>

                            <button type="submit"
                                    className={`w-full py-3 ${bgClass} text-white rounded-lg font-bold mt-2`}>
                                Save to Campaign
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}